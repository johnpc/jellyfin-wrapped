import {
  getImageApi,
  getPluginsApi,
  getUserApi,
  getUserLibraryApi,
  getItemsApi,
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
  durationSeconds: number;
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
  const url = api.getItemImageUrlById(id, ImageType.Primary, {
    maxWidth: 300,
    width: 300,
    quality: 90,
  });
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
          const ticks = item.data.RunTimeTicks ?? 0;
          // In Jellyfin, runtime ticks are a unit of time measurement used to track media playback duration. One tick represents 10,000,000 (10 million) nanoseconds, which is equivalent to 1/10th of a second.
          const durationSeconds = Math.floor(ticks / 10000000);

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
            durationSeconds,
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
      .map((result: string[]) => {
        const duration = parseInt(result[playDurationIndex]);
        // Prevent negative playback time due to Playback Reporting bug
        const zeroBoundDuration = Math.max(0, duration);
        const maxShowRuntime =
          showEpisodes.find((show) => show.id === result[itemIdIndex])
            ?.durationSeconds || zeroBoundDuration;
        // Prevent excessive playback time due to Playback Reporting bug
        const playBackBoundDuration = Math.min(
          zeroBoundDuration,
          maxShowRuntime,
        );
        return playBackBoundDuration;
      })
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

export const getMinutesPlayedPerDay = async (): Promise<
  {
    date: string;
    minutes: number;
  }[]
> => {
  const userId = await getCurrentUserId();

  const queryString = `
  SELECT
    date(DateCreated) as PlayDate,
    SUM(PlayDuration) as TotalPlayDuration
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND DateCreated > '${oneYearAgo.getFullYear()}-${oneYearAgo.getMonth()}-${oneYearAgo.getDate()}'
  GROUP BY date(DateCreated)
  ORDER BY PlayDate DESC
  `;

  const data = await playbackReportingSqlRequest(queryString);

  const dateIndex = data.colums.findIndex((i: string) => i === "PlayDate");
  const durationIndex = data.colums.findIndex(
    (i: string) => i === "TotalPlayDuration",
  );

  return data.results.map((result: string[]) => {
    const duration = parseInt(result[durationIndex]);
    // Prevent negative playback time due to potential reporting bugs
    const zeroBoundDuration = Math.max(0, duration);
    // Convert seconds to minutes, rounding down
    const minutes = Math.floor(zeroBoundDuration / 60);

    return {
      date: result[dateIndex],
      minutes: minutes,
    };
  });
};

export const getViewingPatterns = async (): Promise<{
  timeOfDay: { hour: number; minutes: number }[];
  dayOfWeek: { day: number; minutes: number }[];
  primeTime: { isPrimeTime: boolean; minutes: number }[];
}> => {
  const userId = await getCurrentUserId();

  // Time of day query
  const timeOfDayQuery = `
  SELECT
    strftime('%H', DateCreated) as Hour,
    SUM(PlayDuration) as TotalPlayDuration
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND DateCreated > '${oneYearAgo.getFullYear()}-${oneYearAgo.getMonth()}-${oneYearAgo.getDate()}'
  GROUP BY Hour
  ORDER BY Hour
  `;

  // Day of week query (0 = Sunday, 6 = Saturday)
  const dayOfWeekQuery = `
  SELECT
    strftime('%w', DateCreated) as DayOfWeek,
    SUM(PlayDuration) as TotalPlayDuration
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND DateCreated > '${oneYearAgo.getFullYear()}-${oneYearAgo.getMonth()}-${oneYearAgo.getDate()}'
  GROUP BY DayOfWeek
  ORDER BY DayOfWeek
  `;

  // Prime time query (7 PM - 11 PM)
  const primeTimeQuery = `
  SELECT
    CASE
      WHEN strftime('%H', DateCreated) BETWEEN '19' AND '22' THEN 1
      ELSE 0
    END as IsPrimeTime,
    SUM(PlayDuration) as TotalPlayDuration
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND DateCreated > '${oneYearAgo.getFullYear()}-${oneYearAgo.getMonth()}-${oneYearAgo.getDate()}'
  GROUP BY IsPrimeTime
  ORDER BY IsPrimeTime
  `;

  const [timeData, dayData, primeTimeData] = await Promise.all([
    playbackReportingSqlRequest(timeOfDayQuery),
    playbackReportingSqlRequest(dayOfWeekQuery),
    playbackReportingSqlRequest(primeTimeQuery),
  ]);

  // Process time of day data
  const timeOfDay = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    minutes: 0,
  }));

  timeData.results.forEach((result) => {
    const hour = parseInt(
      result[timeData.colums.findIndex((c) => c === "Hour")],
    );
    const duration = parseInt(
      result[timeData.colums.findIndex((c) => c === "TotalPlayDuration")],
    );
    timeOfDay[hour].minutes = Math.floor(Math.max(0, duration) / 60);
  });

  // Process day of week data
  const dayOfWeek = Array.from({ length: 7 }, (_, i) => ({
    day: i,
    minutes: 0,
  }));

  dayData.results.forEach((result) => {
    const day = parseInt(
      result[dayData.colums.findIndex((c) => c === "DayOfWeek")],
    );
    const duration = parseInt(
      result[dayData.colums.findIndex((c) => c === "TotalPlayDuration")],
    );
    dayOfWeek[day].minutes = Math.floor(Math.max(0, duration) / 60);
  });

  // Process prime time data
  const primeTime = Array.from({ length: 2 }, (_, i) => ({
    isPrimeTime: i === 1,
    minutes: 0,
  }));

  primeTimeData.results.forEach((result) => {
    const isPrimeTime =
      parseInt(
        result[primeTimeData.colums.findIndex((c) => c === "IsPrimeTime")],
      ) === 1;
    const duration = parseInt(
      result[primeTimeData.colums.findIndex((c) => c === "TotalPlayDuration")],
    );
    const index = isPrimeTime ? 1 : 0;
    primeTime[index].minutes = Math.floor(Math.max(0, duration) / 60);
  });

  return {
    timeOfDay,
    dayOfWeek,
    primeTime,
  };
};

export const getDeviceStats = async (): Promise<{
  deviceUsage: { deviceName: string; minutes: number }[];
  browserUsage: { browserName: string; minutes: number }[];
  osUsage: { osName: string; minutes: number }[];
}> => {
  const userId = await getCurrentUserId();

  // Device query
  const deviceQuery = `
  SELECT
    DeviceName,
    SUM(PlayDuration) as TotalPlayDuration
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND DateCreated > '${oneYearAgo.getFullYear()}-${oneYearAgo.getMonth()}-${oneYearAgo.getDate()}'
  GROUP BY DeviceName
  ORDER BY TotalPlayDuration DESC
  `;

  // Browser query
  const browserQuery = `
  SELECT
    CASE
      WHEN DeviceName LIKE '%Chrome%' THEN 'Chrome'
      WHEN DeviceName LIKE '%Firefox%' THEN 'Firefox'
      WHEN DeviceName LIKE '%Safari%' THEN 'Safari'
      WHEN DeviceName LIKE '%Edge%' THEN 'Edge'
      WHEN DeviceName LIKE '%TV%' THEN 'Smart TV'
      WHEN DeviceName LIKE '%Mobile%' THEN 'Mobile'
      ELSE 'Other'
    END as BrowserName,
    SUM(PlayDuration) as TotalPlayDuration
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND DateCreated > '${oneYearAgo.getFullYear()}-${oneYearAgo.getMonth()}-${oneYearAgo.getDate()}'
  GROUP BY BrowserName
  ORDER BY TotalPlayDuration DESC
  `;

  // OS query
  const osQuery = `
  SELECT
    CASE
      WHEN DeviceName LIKE '%Windows%' THEN 'Windows'
      WHEN DeviceName LIKE '%Mac%' OR DeviceName LIKE '%iOS%' THEN 'Apple'
      WHEN DeviceName LIKE '%Android%' THEN 'Android'
      WHEN DeviceName LIKE '%Linux%' THEN 'Linux'
      WHEN DeviceName LIKE '%TV%' THEN 'Smart TV'
      ELSE 'Other'
    END as OSName,
    SUM(PlayDuration) as TotalPlayDuration
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND DateCreated > '${oneYearAgo.getFullYear()}-${oneYearAgo.getMonth()}-${oneYearAgo.getDate()}'
  GROUP BY OSName
  ORDER BY TotalPlayDuration DESC
  `;

  const [deviceData, browserData, osData] = await Promise.all([
    playbackReportingSqlRequest(deviceQuery),
    playbackReportingSqlRequest(browserQuery),
    playbackReportingSqlRequest(osQuery),
  ]);

  // Process device data
  const deviceUsage = deviceData.results.map((result) => {
    const deviceName =
      result[deviceData.colums.findIndex((c) => c === "DeviceName")];
    const duration = parseInt(
      result[deviceData.colums.findIndex((c) => c === "TotalPlayDuration")],
    );
    return {
      deviceName,
      minutes: Math.floor(Math.max(0, duration) / 60),
    };
  });

  // Process browser data
  const browserUsage = browserData.results.map((result) => {
    const browserName =
      result[browserData.colums.findIndex((c) => c === "BrowserName")];
    const duration = parseInt(
      result[browserData.colums.findIndex((c) => c === "TotalPlayDuration")],
    );
    return {
      browserName,
      minutes: Math.floor(Math.max(0, duration) / 60),
    };
  });

  // Process OS data
  const osUsage = osData.results.map((result) => {
    const osName = result[osData.colums.findIndex((c) => c === "OSName")];
    const duration = parseInt(
      result[osData.colums.findIndex((c) => c === "TotalPlayDuration")],
    );
    return {
      osName,
      minutes: Math.floor(Math.max(0, duration) / 60),
    };
  });

  return {
    deviceUsage,
    browserUsage,
    osUsage,
  };
};

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
  const oneYearAgo = subYears(new Date(), 1);

  // First get all episodes watched in the last year
  const queryString = `
    SELECT
      strftime('%Y-%m', DateCreated) as Month,
      ItemId,
      SUM(PlayDuration) as TotalPlayDuration
    FROM PlaybackActivity
    WHERE UserId = "${userId}"
    AND ItemType = "Episode"
    AND DateCreated > '${oneYearAgo.getFullYear()}-${oneYearAgo.getMonth() + 1}-${oneYearAgo.getDate()}'
    GROUP BY Month, ItemId
    ORDER BY Month DESC, TotalPlayDuration DESC
  `;

  const data = await playbackReportingSqlRequest(queryString);

  const monthIndex = data.colums.findIndex((i) => i === "Month");
  const itemIdIndex = data.colums.findIndex((i) => i === "ItemId");
  const durationIndex = data.colums.findIndex((i) => i === "TotalPlayDuration");

  // Get all episode IDs
  const episodeIds = Array.from(
    new Set(data.results.map((row) => row[itemIdIndex])),
  );

  // Get episode details
  const episodes = await getItemDtosByIds(episodeIds);

  // Get season IDs from episodes
  const seasonIds = Array.from(
    new Set(
      episodes
        .map((episode) => episode.parentId)
        .filter((id): id is string => id !== null && id !== undefined),
    ),
  );

  // Get season details
  const seasons = await getItemDtosByIds(seasonIds);

  // Get show IDs from seasons
  const showIds = Array.from(
    new Set(
      seasons
        .map((season) => season.parentId)
        .filter((id): id is string => id !== null && id !== undefined),
    ),
  );

  // Get show details
  const shows = await getItemDtosByIds(showIds);

  // Create a mapping from episode to show
  const episodeToShow = new Map<string, SimpleItemDto>();
  episodes.forEach((episode) => {
    const season = seasons.find((s) => s.id === episode.parentId);
    if (season) {
      const show = shows.find((s) => s.id === season.parentId);
      if (show) {
        episodeToShow.set(episode.id!, show);
      }
    }
  });

  // Group by month and show
  const monthlyShowData = data.results.reduce(
    (acc, row) => {
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

      const showDuration = acc[month].shows.get(show.id!) || 0;
      acc[month].shows.set(show.id!, showDuration + duration);
      acc[month].totalDuration += duration;

      return acc;
    },
    {} as Record<
      string,
      {
        shows: Map<string, number>;
        totalDuration: number;
      }
    >,
  );

  // Convert to final format
  const monthlyStats = await Promise.all(
    Object.entries(monthlyShowData).map(async ([month, data]) => {
      // Get show with highest duration
      let maxDuration = 0;
      let topShowId = "";

      data.shows.forEach((duration, showId) => {
        if (duration > maxDuration) {
          maxDuration = duration;
          topShowId = showId;
        }
      });

      const topShow = shows.find((show) => show.id === topShowId);

      if (!topShow) {
        throw new Error(`Could not find show with ID ${topShowId}`);
      }

      return {
        month: new Date(month + "-01"), // Convert to Date object
        topShow: {
          item: topShow,
          watchTimeMinutes: maxDuration / 60, // Convert to minutes
        },
        totalWatchTimeMinutes: data.totalDuration / 60, // Convert to minutes
      };
    }),
  );

  return monthlyStats.sort((a, b) => b.month.getTime() - a.month.getTime());
};

export type UnfinishedShowDto = {
  item: SimpleItemDto;
  watchedEpisodes: number;
  totalEpisodes: number;
  lastWatchedDate: Date;
};

export async function getUnfinishedShows(): Promise<UnfinishedShowDto[]> {
  const userId = await getCurrentUserId();
  const authenticatedApi = await getAuthenticatedJellyfinApi();
  const itemsApi = getItemsApi(authenticatedApi);

  // First get all episodes watched in the last year
  const queryString = `
    SELECT
      ItemId,
      ItemName,
      MAX(DateCreated) as LastWatched
    FROM PlaybackActivity
    WHERE UserId = "${userId}"
    AND ItemType = "Episode"
    AND DateCreated > '${oneYearAgo.getFullYear()}-${oneYearAgo.getMonth() + 1}-${oneYearAgo.getDate()}'
    GROUP BY ItemId
  `;

  const data = await playbackReportingSqlRequest(queryString);

  const itemIdIndex = data.colums.findIndex((i) => i === "ItemId");
  const lastWatchedIndex = data.colums.findIndex((i) => i === "LastWatched");

  // Get all watched episodes
  const watchedEpisodes = await getItemDtosByIds(
    data.results.map((row) => row[itemIdIndex]),
  );

  // Get parent info from the episode items themselves
  const parentIds = Array.from(
    new Set(
      watchedEpisodes
        .map((episode) => episode.parentId)
        .filter((id): id is string => id !== null && id !== undefined),
    ),
  );

  const parents = await getItemDtosByIds(parentIds);

  // Get show IDs - either directly from episodes or via seasons
  const showIds = Array.from(
    new Set(
      parents
        .map((parent) => {
          // If parent is a season, get its parent show ID
          if (parent.name?.includes("Season")) {
            return parent.parentId;
          }
          // If parent is a show, use its ID
          return parent.id;
        })
        .filter((id): id is string => id !== null && id !== undefined),
    ),
  );

  const shows = await getItemDtosByIds(showIds);

  // For each show, get all its episodes to compare with watched episodes
  const unfinishedShows = await Promise.all(
    shows.map(async (show) => {
      try {
        // Get all episodes for this show
        const allEpisodes = await itemsApi.getItems({
          userId,
          parentId: show.id,
          includeItemTypes: ["Episode"],
          recursive: true,
        });

        const totalEpisodes = allEpisodes.data.TotalRecordCount ?? 0;

        // Get watched episodes for this show
        const watchedForShow = await itemsApi.getItems({
          userId,
          parentId: show.id,
          includeItemTypes: ["Episode"],
          recursive: true,
          filters: ["IsPlayed"],
        });

        const watchedEpisodeCount = watchedForShow.data.TotalRecordCount ?? 0;

        // Find the last watched date for this show's episodes
        const showEpisodeIds = new Set(
          watchedEpisodes
            .filter((ep) => {
              const parent = parents.find((p) => p.id === ep.parentId);
              return parent?.parentId === show.id || ep.parentId === show.id;
            })
            .map((ep) => ep.id),
        );

        const lastWatchedDates = data.results
          .filter((row) => showEpisodeIds.has(row[itemIdIndex]))
          .map((row) => new Date(row[lastWatchedIndex]).getTime());

        const lastWatchedDate = new Date(Math.max(...lastWatchedDates, 0));

        // Only return shows that have been started but not completed
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
    }),
  );

  return unfinishedShows
    .filter((show): show is UnfinishedShowDto => show !== null)
    .sort((a, b) => b.lastWatchedDate.getTime() - a.lastWatchedDate.getTime());
}

export interface PunchCardData {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  count: number;
}

export async function getPunchCardData(): Promise<PunchCardData[]> {
  const userId = await getCurrentUserId();

  const queryString = `
    SELECT
      strftime('%w', DateCreated) as day_of_week,
      strftime('%H', DateCreated) as hour,
      COUNT(*) as count
    FROM PlaybackActivity
    WHERE UserId = "${userId}"
    GROUP BY day_of_week, hour
    ORDER BY day_of_week, hour
  `;

  const data = await playbackReportingSqlRequest(queryString);

  const dayIndex = data.colums.findIndex((i) => i === "day_of_week");
  const hourIndex = data.colums.findIndex((i) => i === "hour");
  const countIndex = data.colums.findIndex((i) => i === "count");

  return data.results.map((row) => ({
    dayOfWeek: parseInt(row[dayIndex]),
    hour: parseInt(row[hourIndex]),
    count: parseInt(row[countIndex]),
  }));
}

export interface CalendarData {
  value: number;
  day: string; // Format: YYYY-MM-DD
}

export async function getCalendarData(): Promise<CalendarData[]> {
  const userId = await getCurrentUserId();

  const queryString = `
    SELECT
      date(DateCreated) as day,
      COUNT(*) as count
    FROM PlaybackActivity
    WHERE UserId = "${userId}"
    AND DateCreated > date('now', '-1 year')
    GROUP BY date(DateCreated)
    ORDER BY day
  `;

  const data = await playbackReportingSqlRequest(queryString);

  const dayIndex = data.colums.findIndex((i) => i === "day");
  const countIndex = data.colums.findIndex((i) => i === "count");

  return data.results.map((row) => ({
    day: row[dayIndex],
    value: parseInt(row[countIndex]),
  }));
}
