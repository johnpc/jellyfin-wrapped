import {
  getImageApi,
  getPluginsApi,
  getUserApi,
  getUserLibraryApi,
} from "@jellyfin/sdk/lib/utils/api";
import { getAuthenticatedJellyfinApi } from "./jellyfin-api";
import { addDays, startOfDay, subYears } from "date-fns";
import {
  BaseItemPerson,
  ImageType,
  NameGuidPair,
  PluginStatus,
} from "@jellyfin/sdk/lib/generated-client";
import {
  getCachedHiddenIds,
  getCacheValue,
  JELLYFIN_CURRENT_USER_CACHE_KEY,
  setCacheValue,
} from "./cache";

export type SimpleItemDto = {
  id?: string;
  parentId?: string | null;
  name?: string | null;
  date?: string | null;
  communityRating?: number | null;
  productionYear?: number | null;
  people?: BaseItemPerson[] | null;
  genres?: string[] | null;
  genreItems?: NameGuidPair[] | null;
};

const oneYearAgo = subYears(new Date(), 1);

const getCurrentUserId = async (): Promise<string> => {
  const cachedUserId = getCacheValue(JELLYFIN_CURRENT_USER_CACHE_KEY);
  if (cachedUserId) {
    return cachedUserId;
  }

  const authenticatedApi = await getAuthenticatedJellyfinApi();
  const userApi = getUserApi(authenticatedApi);
  const user = await userApi.getCurrentUser();
  const userId = user.data.Id ?? "";
  setCacheValue(JELLYFIN_CURRENT_USER_CACHE_KEY, userId);
  return userId;
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
  return res.data as {
    colums: string[];
    results: string[][];
  };
};

export const checkIfPlaybackReportingInstalled = async (): Promise<boolean> => {
  const authenticatedApi = await getAuthenticatedJellyfinApi();
  const pluginsApi = getPluginsApi(authenticatedApi);
  const pluginsResponse = await pluginsApi.getPlugins();
  const plugins = pluginsResponse.data;
  const playbackReportingPlugin = plugins.find(
    (plugin) => plugin.Name === "Playback Reporting",
  );
  return playbackReportingPlugin?.Status === PluginStatus.Active;
};

export const getImageUrlById = async (id: string) => {
  const cacheKey = `imageUrlCache_${id}`;
  const cachedUrl = getCacheValue(cacheKey);
  if (cachedUrl) {
    return cachedUrl;
  }
  const api = getImageApi(await getAuthenticatedJellyfinApi());
  /* eslint-disable @typescript-eslint/no-unsafe-argument */
  // @ts-expect-error ImageType.Poster not behaving right
  const url = api.getItemImageUrlById(id, ImageType.Poster);
  setCacheValue(cacheKey, url);
  return url;
};

const getItemDtosByIds = async (ids: string[]): Promise<SimpleItemDto[]> => {
  const hiddenIds = getCachedHiddenIds();
  const authenticatedApi = await getAuthenticatedJellyfinApi();
  const userId = await getCurrentUserId();
  const itemsApi = getUserLibraryApi(authenticatedApi);

  const itemPromises = ids
    .filter((id) => !hiddenIds.includes(id))
    .map(async (itemId: string) => {
      try {
        const cachedItem = getCacheValue(`item_${itemId}`);

        if (cachedItem) {
          // If item exists in cache, parse and use it
          return JSON.parse(cachedItem) as SimpleItemDto;
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
            people: item.data.People,
            date: item.data.PremiereDate,
            genres: item.data.Genres,
            genreItems: item.data.GenreItems,
          };
          setCacheValue(`item_${itemId}`, JSON.stringify(simpleItem));

          return simpleItem;
        }
      } catch (e) {
        console.error(e);
        return null;
      }
    });
  const movieItems = await Promise.all(itemPromises);
  return movieItems.filter((item) => item !== null);
};

export const listFavoriteActors = async (): Promise<
  {
    name: string;
    count: number;
    details: BaseItemPerson;
    seenInMovies: SimpleItemDto[];
    seenInShows: SimpleItemDto[];
  }[]
> => {
  const movies = await listMovies();
  const shows = await listShows();
  const people = [
    ...shows.flatMap((show) => show.item.people),
    movies.flatMap((movie) => movie.people),
  ].flat();

  const counts = people.reduce((acc, person) => {
    if (!person?.Name) return acc;

    const name: string = person.Name;
    acc.set(name, (acc.get(name) || 0) + 1);
    return acc;
  }, new Map());

  const peopleWithCounts = Array.from(counts.entries()).map(([name]) => {
    // Count appearances in movies
    const movieCount = movies.reduce(
      (acc, movie) =>
        acc + (movie.people?.some((person) => person?.Name === name) ? 1 : 0),
      0,
    );

    // Count appearances in shows
    const showCount = shows.reduce(
      (acc, show) =>
        acc +
        (show.item.people?.some((person) => person?.Name === name) ? 1 : 0),
      0,
    );

    return {
      name: name as string,
      count: movieCount + showCount,
      details: people.find((p) => p?.Name === name),
      seenInMovies: movies.filter((movie) =>
        movie.people?.some((person) => person?.Name === name),
      ),
      seenInShows: shows
        .filter((show) =>
          show.item.people?.some((person) => person?.Name === name),
        )
        .map((s) => s.item),
    };
  });

  peopleWithCounts.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.name.localeCompare(b.name);
  });

  return peopleWithCounts
    .filter((p) => p.details)
    .filter((p) => p.count > 1) as {
    name: string;
    count: number;
    details: BaseItemPerson;
    seenInMovies: SimpleItemDto[];
    seenInShows: SimpleItemDto[];
  }[];
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
  const movieItemIds = data.results
    .map((result: string[]) => result[itemIdIndex])
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index,
    );
  return getItemDtosByIds(movieItemIds);
};

export const listWatchedOnDate = async (
  date: Date,
): Promise<SimpleItemDto[]> => {
  const startOfDate = startOfDay(date);
  const endOfDate = addDays(startOfDate, 1);

  const userId = await getCurrentUserId();

  const queryString = `
SELECT ROWID, *
FROM PlaybackActivity
WHERE UserId = "${userId}"
AND ItemType = "Movie"
AND DateCreated > '${startOfDate.getFullYear()}-${startOfDate.getMonth() + 1}-${startOfDate.getDate()}'
AND DateCreated < '${endOfDate.getFullYear()}-${endOfDate.getMonth() + 1}-${endOfDate.getDate()}'
ORDER BY rowid DESC
`;
  const data = await playbackReportingSqlRequest(queryString);
  console.log({ queryString });

  const queryString2 = `
  SELECT ROWID, *
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND ItemType = "Episode"
  AND DateCreated > '${startOfDate.getFullYear()}-${startOfDate.getMonth()}-${startOfDate.getDate()}'
  AND DateCreated < '${endOfDate.getFullYear()}-${endOfDate.getMonth()}-${endOfDate.getDate()}'
  ORDER BY rowid DESC
  `;
  const data2 = await playbackReportingSqlRequest(queryString2);
  const itemIdIndex2 = data2.colums.findIndex((i: string) => i == "ItemId");
  const showItemIds = data2.results
    .map((result: string[]) => result[itemIdIndex2])
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index,
    );
  const episodes = await getItemDtosByIds(showItemIds);
  const seasonIds: string[] = episodes
    .map((episode) => episode.parentId ?? "")
    .filter((v) => v)
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index,
    );
  const seasons = await getItemDtosByIds(seasonIds);

  const showIds: string[] = seasons
    .map((season) => season.parentId ?? "")
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index,
    );
  const shows = await getItemDtosByIds(showIds);
  const itemIdIndex = data.colums.findIndex((i: string) => i == "ItemId");
  const movieItemIds = data.results
    .map((result: string[]) => result[itemIdIndex])
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index,
    );
  const movies = await getItemDtosByIds(movieItemIds);

  return [...movies, ...shows];
};

export const listMusicVideos = async (): Promise<SimpleItemDto[]> => {
  const userId = await getCurrentUserId();

  const queryString = `
  SELECT ROWID, *
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND ItemType = "MusicVideo"
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
  const seasonIds: string[] = episodes
    .map((episode) => episode.parentId ?? "")
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index,
    );
  const seasons = await getItemDtosByIds(seasonIds);

  const showIds: string[] = seasons
    .map((season) => season.parentId ?? "")
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
        const showEpisodeIds = showEpisodes.map((episode) => episode.id);
        return showEpisodeIds.includes(result[itemIdIndex]);
      })
      .map((result: string[]) => parseInt(result[playDurationIndex]))
      .reduce((acc, curr) => acc + curr, 0);
    return {
      showName: show.name ?? "",
      episodeCount: showEpisodes.length,
      playbackTime: showPlaybackDuration,
      item: show,
    };
  });

  showInfo.sort((a, b) => b.episodeCount - a.episodeCount);

  return showInfo;
};
