import { getItemsApi } from "@jellyfin/sdk/lib/utils/api";
import { getAuthenticatedJellyfinApi } from "../jellyfin-api";
import {
  getCurrentUserId,
  getStartDate,
  getEndDate,
  formatDateForSql,
  playbackReportingSqlRequest,
} from "./utils";
import { getItemDtosByIds } from "./items";
import { SimpleItemDto, UnfinishedShowDto } from "./types";

export const getMonthlyShowStats = async (): Promise<
  {
    month: Date;
    topShow: {
      item: SimpleItemDto;
      watchTimeMinutes: number;
    };
    totalWatchTimeMinutes: number;
  }[]
> => {
  const userId = await getCurrentUserId();
  const startDate = getStartDate();
  const endDate = getEndDate();

  const queryString = `
    SELECT
      strftime('%Y-%m', DateCreated) as Month,
      ItemId,
      SUM(PlayDuration) as TotalPlayDuration
    FROM PlaybackActivity
    WHERE UserId = "${userId}"
    AND ItemType = "Episode"
    AND DateCreated > '${formatDateForSql(startDate)}'
    AND DateCreated <= '${formatDateForSql(endDate)}'
    GROUP BY Month, ItemId
    ORDER BY Month DESC, TotalPlayDuration DESC
  `;

  const data = await playbackReportingSqlRequest(queryString);

  const monthIndex = data.colums.findIndex((i: string) => i === "Month");
  const itemIdIndex = data.colums.findIndex((i: string) => i === "ItemId");
  const durationIndex = data.colums.findIndex(
    (i: string) => i === "TotalPlayDuration"
  );

  const episodeIds = Array.from(
    new Set(data.results.map((row: string[]) => row[itemIdIndex]))
  );

  const episodes = await getItemDtosByIds(episodeIds);

  // Get first level parents (usually seasons, but could be shows directly)
  const level1ParentIds = Array.from(
    new Set(
      episodes
        .map((episode: SimpleItemDto) => episode.parentId)
        .filter((id): id is string => id !== null && id !== undefined)
    )
  );

  const level1Parents = await getItemDtosByIds(level1ParentIds);

  // Get second level parents (usually shows)
  const level2ParentIds = Array.from(
    new Set(
      level1Parents
        .map((item: SimpleItemDto) => item.parentId)
        .filter((id): id is string => id !== null && id !== undefined)
    )
  );

  const level2Parents = await getItemDtosByIds(level2ParentIds);

  // Build episode to show mapping
  // For each episode, walk up the hierarchy to find the show
  const episodeToShow = new Map<string, SimpleItemDto>();
  
  episodes.forEach((episode: SimpleItemDto) => {
    if (!episode.id || !episode.parentId) return;
    
    // Find the level 1 parent (season or show)
    const level1Parent = level1Parents.find(
      (p: SimpleItemDto) => p.id === episode.parentId
    );
    
    if (!level1Parent) return;
    
    // If level1Parent has a parentId, it's likely a season - look up the show
    if (level1Parent.parentId) {
      const level2Parent = level2Parents.find(
        (p: SimpleItemDto) => p.id === level1Parent.parentId
      );
      if (level2Parent) {
        // level2Parent is the show
        episodeToShow.set(episode.id, level2Parent);
      } else {
        // Couldn't find level2, assume level1 is the show
        episodeToShow.set(episode.id, level1Parent);
      }
    } else {
      // level1Parent has no parent, so it's the show itself
      episodeToShow.set(episode.id, level1Parent);
    }
  });
  
  // Collect all unique shows
  const showsMap = new Map<string, SimpleItemDto>();
  episodeToShow.forEach((show) => {
    if (show.id) {
      showsMap.set(show.id, show);
    }
  });
  const shows = Array.from(showsMap.values());

  const monthlyShowData = data.results.reduce(
    (
      acc: Record<
        string,
        {
          shows: Map<string, number>;
          totalDuration: number;
        }
      >,
      row: string[]
    ) => {
      const month = row[monthIndex];
      const episodeId = row[itemIdIndex];
      const duration = parseFloat(row[durationIndex]);
      const show = episodeToShow.get(episodeId);

      if (!show) return acc;

      if (!acc[month]) {
        acc[month] = {
          shows: new Map<string, number>(),
          totalDuration: 0,
        };
      }

      const showDuration = acc[month].shows.get(show?.id ?? "") || 0;
      acc[month].shows.set(show?.id ?? "", showDuration + duration);
      acc[month].totalDuration += duration;

      return acc;
    },
    {}
  );

  const monthlyStats = await Promise.all(
    Object.entries(monthlyShowData).map(([month, data]) => {
      let maxDuration = 0;
      let topShowId = "";

      data.shows.forEach((duration: number, showId: string) => {
        if (duration > maxDuration) {
          maxDuration = duration;
          topShowId = showId;
        }
      });

      const topShow = shows.find(
        (show: SimpleItemDto) => show.id === topShowId
      );

      if (!topShow) {
        throw new Error(`Could not find show with ID ${topShowId}`);
      }

      // Parse the month string (e.g., "2025-11") and create a date in local timezone
      // Using noon to avoid any timezone edge cases
      const [year, monthNum] = month.split("-").map(Number);
      const monthDate = new Date(year, monthNum - 1, 1, 12, 0, 0);
      
      return {
        month: monthDate,
        topShow: {
          item: topShow,
          watchTimeMinutes: maxDuration / 60,
        },
        totalWatchTimeMinutes: data.totalDuration / 60,
      };
    })
  );

  return monthlyStats.sort((a, b) => b.month.getTime() - a.month.getTime());
};

export async function getUnfinishedShows(): Promise<UnfinishedShowDto[]> {
  const userId = await getCurrentUserId();
  const authenticatedApi = await getAuthenticatedJellyfinApi();
  const itemsApi = getItemsApi(authenticatedApi);
  const startDate = getStartDate();
  const endDate = getEndDate();

  const queryString = `
    SELECT
      ItemId,
      ItemName,
      MAX(DateCreated) as LastWatched
    FROM PlaybackActivity
    WHERE UserId = "${userId}"
    AND ItemType = "Episode"
    AND DateCreated > '${formatDateForSql(startDate)}'
    AND DateCreated <= '${formatDateForSql(endDate)}'
    GROUP BY ItemId
  `;

  const data = await playbackReportingSqlRequest(queryString);

  const itemIdIndex = data.colums.findIndex((i: string) => i === "ItemId");
  const lastWatchedIndex = data.colums.findIndex(
    (i: string) => i === "LastWatched"
  );

  const watchedEpisodes = await getItemDtosByIds(
    data.results.map((row: string[]) => row[itemIdIndex])
  );

  const parentIds = Array.from(
    new Set(
      watchedEpisodes
        .map((episode: SimpleItemDto) => episode.parentId)
        .filter((id): id is string => id !== null && id !== undefined)
    )
  );

  const parents = await getItemDtosByIds(parentIds);

  const showIds = Array.from(
    new Set(
      parents
        .map((parent: SimpleItemDto) => {
          if (parent.name?.includes("Season")) {
            return parent.parentId;
          }
          return parent.id;
        })
        .filter((id): id is string => id !== null && id !== undefined)
    )
  );

  const shows = await getItemDtosByIds(showIds);

  const unfinishedShows = await Promise.all(
    shows.map(async (show: SimpleItemDto) => {
      try {
        const allEpisodes = await itemsApi.getItems({
          userId,
          parentId: show.id,
          includeItemTypes: ["Episode"],
          recursive: true,
        });

        const totalEpisodes = allEpisodes.data.TotalRecordCount ?? 0;

        const watchedForShow = await itemsApi.getItems({
          userId,
          parentId: show.id,
          includeItemTypes: ["Episode"],
          recursive: true,
          filters: ["IsPlayed"],
        });

        const watchedEpisodeCount = watchedForShow.data.TotalRecordCount ?? 0;

        const showEpisodeIds = new Set(
          watchedEpisodes
            .filter((ep: SimpleItemDto) => {
              const parent = parents.find(
                (p: SimpleItemDto) => p.id === ep.parentId
              );
              return parent?.parentId === show.id || ep.parentId === show.id;
            })
            .map((ep: SimpleItemDto) => ep.id)
        );

        const lastWatchedDates = data.results
          .filter((row: string[]) => showEpisodeIds.has(row[itemIdIndex]))
          .map((row: string[]) => new Date(row[lastWatchedIndex]).getTime());

        const lastWatchedDate = new Date(Math.max(...lastWatchedDates, 0));

        if (watchedEpisodeCount > 0 && watchedEpisodeCount < totalEpisodes) {
          return {
            item: show,
            watchedEpisodes: watchedEpisodeCount,
            totalEpisodes,
            lastWatchedDate,
          };
        }
      } catch (error) {
        console.error(`Error processing show ${show.name}:`, error);
      }
      return null;
    })
  );

  return unfinishedShows
    .filter((show): show is UnfinishedShowDto => show !== null)
    .sort((a, b) => b.lastWatchedDate.getTime() - a.lastWatchedDate.getTime());
}
