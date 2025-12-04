// Jellyfin API service for backend

import { SimpleItemDto, PersonDto } from '../types.js';

export interface JellyfinConfig {
  serverUrl: string;
  apiKey: string;
  userToken: string;
  userId: string;
}

// Execute SQL query against Playback Reporting plugin
export async function executeSqlQuery(
  config: JellyfinConfig,
  query: string
): Promise<{ colums: string[]; results: string[][] }> {
  const response = await fetch(
    `${config.serverUrl}/user_usage_stats/submit_custom_query?stamp=${Date.now()}`,
    {
      method: 'POST',
      headers: {
        'X-Emby-Token': config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        CustomQueryString: query,
        ReplaceUserId: true,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`SQL query failed: ${response.status}`);
  }

  const text = await response.text();
  if (!text) {
    return { colums: [], results: [] };
  }

  return JSON.parse(text);
}

// Fetch items by IDs from Jellyfin
export async function getItemsByIds(
  config: JellyfinConfig,
  ids: string[]
): Promise<SimpleItemDto[]> {
  if (ids.length === 0) return [];

  const BATCH_SIZE = 100;
  const allItems: SimpleItemDto[] = [];

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    const idsParam = batch.join(',');

    const response = await fetch(
      `${config.serverUrl}/Users/${config.userId}/Items?ids=${idsParam}&fields=ParentId,People,Genres`,
      {
        headers: {
          'X-Emby-Token': config.userToken,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch items: ${response.status}`);
      continue;
    }

    const data = await response.json() as {
      Items?: Array<{
        Id?: string;
        ParentId?: string;
        Name?: string;
        PremiereDate?: string;
        CommunityRating?: number;
        ProductionYear?: number;
        People?: PersonDto[];
        Genres?: string[];
        GenreItems?: { Name?: string; Id?: string }[];
        RunTimeTicks?: number;
      }>;
    };

    const items = (data.Items ?? []).map((item) => ({
      id: item.Id,
      parentId: item.ParentId,
      name: item.Name,
      date: item.PremiereDate,
      communityRating: item.CommunityRating,
      productionYear: item.ProductionYear,
      people: item.People,
      genres: item.Genres,
      genreItems: item.GenreItems,
      durationSeconds: item.RunTimeTicks ? Math.floor(item.RunTimeTicks / 10000000) : 0,
    }));

    allItems.push(...items);
  }

  return allItems;
}

// Get items with episode count for a show
export async function getShowEpisodeStats(
  config: JellyfinConfig,
  showId: string
): Promise<{ total: number; watched: number }> {
  // Get all episodes
  const allResponse = await fetch(
    `${config.serverUrl}/Users/${config.userId}/Items?parentId=${showId}&includeItemTypes=Episode&recursive=true`,
    {
      headers: { 'X-Emby-Token': config.userToken },
    }
  );

  if (!allResponse.ok) {
    return { total: 0, watched: 0 };
  }

  const allData = await allResponse.json() as { TotalRecordCount?: number };

  // Get watched episodes
  const watchedResponse = await fetch(
    `${config.serverUrl}/Users/${config.userId}/Items?parentId=${showId}&includeItemTypes=Episode&recursive=true&filters=IsPlayed`,
    {
      headers: { 'X-Emby-Token': config.userToken },
    }
  );

  if (!watchedResponse.ok) {
    return { total: allData.TotalRecordCount ?? 0, watched: 0 };
  }

  const watchedData = await watchedResponse.json() as { TotalRecordCount?: number };

  return {
    total: allData.TotalRecordCount ?? 0,
    watched: watchedData.TotalRecordCount ?? 0,
  };
}

