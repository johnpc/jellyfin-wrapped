import {
  getImageApi,
  getUserApi,
  getUserLibraryApi,
} from "@jellyfin/sdk/lib/utils/api";
import { getAuthenticatedJellyfinApi } from "./jellyfin-api";
import { subYears } from "date-fns";
import { BaseItemDto, ImageType } from "@jellyfin/sdk/lib/generated-client";

export type SimpleItemDto = {
  id?: string;
  parentId?: string | null;
  name?: string | null;
  communityRating?: number | null;
  productionYear?: number | null;
} & BaseItemDto;

const oneYearAgo = subYears(new Date(), 1);

const getCurrentUserId = async (): Promise<string> => {
  const cacheKey = "jellyfinwrapped_current_user";
  const cachedUserId = localStorage.getItem(cacheKey);
  if (cachedUserId) {
    return cachedUserId;
  }

  const authenticatedApi = await getAuthenticatedJellyfinApi();
  const userApi = getUserApi(authenticatedApi);
  const user = await userApi.getCurrentUser();
  localStorage.setItem(cacheKey, user.data.Id!);
  return user.data.Id!;
};

const playbackReportingSqlRequest = async (
  queryString: string,
): Promise<{
  colums: string[];
  results: string[][];
}> => {
  const authenticatedApi = await getAuthenticatedJellyfinApi();
  const res = await authenticatedApi.axiosInstance.post(
    `${authenticatedApi.basePath}/user_usage_stats/submit_custom_query?stamp=1735765350440`,
    {
      CustomQueryString: queryString,
      ReplaceUserId: true,
    },
    {
      headers: {
        Authorization: authenticatedApi.authorizationHeader,
        "Content-Type": "application/json",
      },
    },
  );
  return res.data;
};

export const getImageUrlById = async (id: string) => {
  const cacheKey = `imageUrlCache_${id}`;
  const cachedUrl = localStorage.getItem(cacheKey);
  if (cachedUrl) {
    return cachedUrl;
  }
  const api = getImageApi(await getAuthenticatedJellyfinApi());
  // @ts-expect-error ImageType.Poster not behaving right
  const url = await api.getItemImageUrlById(id, ImageType.Poster);
  localStorage.setItem(cacheKey, url);
  return url;
};

const getItemDtosByIds = async (ids: string[]): Promise<SimpleItemDto[]> => {
  const authenticatedApi = await getAuthenticatedJellyfinApi();
  const userId = await getCurrentUserId();
  const itemsApi = getUserLibraryApi(authenticatedApi);

  const itemPromises = ids.map(async (itemId: string) => {
    try {
      const cachedItem = localStorage.getItem(`item_${itemId}`);

      if (cachedItem) {
        // If item exists in cache, parse and use it
        return JSON.parse(cachedItem);
      } else {
        // If not in cache, fetch from API
        const item = await itemsApi.getItem({
          itemId,
          userId,
        });
        const simpleItem: SimpleItemDto = {
          id: item.data.Id,
          parentId: item.data.ParentId,
          name: item.data.Name,
          productionYear: item.data.ProductionYear,
          communityRating: item.data.CommunityRating,
          // ...item.data,
        };
        localStorage.setItem(`item_${itemId}`, JSON.stringify(simpleItem));

        return simpleItem;
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  });
  const movieItems = await Promise.all(itemPromises);
  return movieItems.filter((item) => item !== null) as SimpleItemDto[];
};

export const listMovies = async (): Promise<SimpleItemDto[]> => {
  const userId = await getCurrentUserId();

  const queryString = `
SELECT ROWID, *
FROM PlaybackActivity
WHERE UserId = "${userId}"
AND ItemType = "Movie"
AND DateCreated > '${oneYearAgo.getFullYear()}-${oneYearAgo.getMonth()}-${oneYearAgo.getDate()}'
ORDER BY rowid DESC
`;
  const data = await playbackReportingSqlRequest(queryString);

  const itemIdIndex = data.colums.findIndex((i: string) => i == "ItemId");
  data.results.map((result: string[]) => {
    return result[itemIdIndex];
  });
  const movieItemIds = data.results
    .map((result: string[]) => result[itemIdIndex])
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index,
    );
  return getItemDtosByIds(movieItemIds);
};

export const listAudio = async (): Promise<SimpleItemDto[]> => {
  const userId = await getCurrentUserId();

  const queryString = `
  SELECT ROWID, *
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND ItemType = "Audio"
  AND DateCreated > '${oneYearAgo.getFullYear()}-${oneYearAgo.getMonth()}-${oneYearAgo.getDate()}'
  ORDER BY rowid DESC
  `;
  const data = await playbackReportingSqlRequest(queryString);

  const itemIdIndex = data.colums.findIndex((i: string) => i == "ItemId");
  data.results.map((result: string[]) => {
    return result[itemIdIndex];
  });
  const movieItemIds = data.results
    .map((result: string[]) => result[itemIdIndex])
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index,
    );
  return getItemDtosByIds(movieItemIds);
};

export const listLiveTvChannels = async (): Promise<
  {
    channelName: string;
    duration: number;
  }[]
> => {
  const userId = await getCurrentUserId();

  const queryString = `
  SELECT ROWID, *
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND ItemType = "TvChannel"
  AND DateCreated > '${oneYearAgo.getFullYear()}-${oneYearAgo.getMonth()}-${oneYearAgo.getDate()}'
  ORDER BY rowid DESC
  `;
  const data = await playbackReportingSqlRequest(queryString);

  const itemNameIndex = data.colums.findIndex((i: string) => i == "ItemName");
  const playDurationIndex = data.colums.findIndex(
    (i: string) => i == "PlayDuration",
  );

  const channelWatchTimeInfo = data.results
    .map((result: string[]) => {
      return {
        channelName: result[itemNameIndex],
        duration: parseInt(result[playDurationIndex]),
      };
    })
    .reduce((acc: { channelName: string; duration: number }[], curr) => {
      const existingChannel = acc.find(
        (item) => item.channelName === curr.channelName,
      );
      if (existingChannel) {
        existingChannel.duration += curr.duration;
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, []);

  channelWatchTimeInfo.sort((a, b) => b.duration - a.duration);

  return channelWatchTimeInfo;
};

export const listShows = async (): Promise<
  {
    showName: string;
    episodeCount: number;
    playbackTime: number;
    item: SimpleItemDto;
  }[]
> => {
  const userId = await getCurrentUserId();

  const queryString = `
  SELECT ROWID, *
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND ItemType = "Episode"
  AND DateCreated > '${oneYearAgo.getFullYear()}-${oneYearAgo.getMonth()}-${oneYearAgo.getDate()}'
  ORDER BY rowid DESC
  `;
  const data = await playbackReportingSqlRequest(queryString);

  const playDurationIndex = data.colums.findIndex(
    (i: string) => i == "PlayDuration",
  );
  const itemIdIndex = data.colums.findIndex((i: string) => i == "ItemId");
  data.results.map((result: string[]) => {
    return result[itemIdIndex];
  });
  const showItemIds = data.results
    .map((result: string[]) => result[itemIdIndex])
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index,
    );
  const episodes = await getItemDtosByIds(showItemIds);
  const seasonIds = episodes
    .map((episode) => episode.parentId!)
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index,
    );
  const seasons = await getItemDtosByIds(seasonIds);

  const showIds = seasons
    .map((season) => season.parentId!)
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index,
    );
  const shows = await getItemDtosByIds(showIds);
  const showInfo: {
    showName: string;
    episodeCount: number;
    playbackTime: number;
    item: SimpleItemDto;
  }[] = shows.map((show) => {
    const showEpisodes = episodes.filter((episode) => {
      const season = seasons.find((s) => s.id === episode.parentId);
      return season?.parentId === show.id;
    });
    const showPlaybackDuration = data.results
      .filter((result: string[]) => {
        const showEpisodeIds = showEpisodes.map((episode) => episode.id!);
        return showEpisodeIds.includes(result[itemIdIndex]);
      })
      .map((result: string[]) => parseInt(result[playDurationIndex]))
      .reduce((acc, curr) => acc + curr, 0);
    return {
      showName: show.name!,
      episodeCount: showEpisodes.length,
      playbackTime: showPlaybackDuration,
      item: show,
    };
  });

  showInfo.sort((a, b) => b.episodeCount - a.episodeCount);

  return showInfo;
};
