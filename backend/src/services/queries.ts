// Query functions for Jellyfin Wrapped data

import {
  SimpleItemDto,
  MovieWithStats,
  ShowWithStats,
  DeviceStats,
  PunchCardData,
  CalendarData,
  LiveTvChannel,
  MonthlyShowStats,
  UnfinishedShow,
  ActorStats,
  Timeframe,
} from '../types.js';
import { JellyfinConfig, executeSqlQuery, getItemsByIds, getShowEpisodeStats } from './jellyfin.js';

function formatDateForSql(date: Date): string {
  return date.toISOString().split('T')[0];
}

// List movies with playback stats
export async function listMovies(
  config: JellyfinConfig,
  timeframe: Timeframe
): Promise<MovieWithStats[]> {
  const query = `
    SELECT 
      ItemId,
      COUNT(*) as PlayCount,
      SUM(PlayDuration) as TotalWatchTime
    FROM PlaybackActivity
    WHERE UserId = "${config.userId}"
    AND ItemType = "Movie"
    AND DateCreated > '${timeframe.startDate}'
    AND DateCreated <= '${timeframe.endDate}'
    GROUP BY ItemId
    ORDER BY TotalWatchTime DESC
  `;

  const data = await executeSqlQuery(config, query);

  const itemIdIndex = data.colums.findIndex((i) => i === 'ItemId');
  const playCountIndex = data.colums.findIndex((i) => i === 'PlayCount');
  const watchTimeIndex = data.colums.findIndex((i) => i === 'TotalWatchTime');

  const movieIds = data.results.map((row) => row[itemIdIndex]);
  const movies = await getItemsByIds(config, movieIds);

  // Create stats map
  const statsMap = new Map<string, { playCount: number; totalWatchTimeSeconds: number }>();
  data.results.forEach((row) => {
    statsMap.set(row[itemIdIndex], {
      playCount: parseInt(row[playCountIndex]) || 1,
      totalWatchTimeSeconds: parseInt(row[watchTimeIndex]) || 0,
    });
  });

  // Enrich movies with stats
  const moviesWithStats: MovieWithStats[] = movies.map((movie) => {
    const stats = statsMap.get(movie.id ?? '') || { playCount: 1, totalWatchTimeSeconds: 0 };
    const movieDuration = movie.durationSeconds ?? 0;

    let completedWatches = 0;
    if (movieDuration > 0) {
      completedWatches = Math.round(stats.totalWatchTimeSeconds / movieDuration);
    } else {
      completedWatches = stats.playCount;
    }

    return {
      ...movie,
      playCount: stats.playCount,
      completedWatches: Math.max(1, completedWatches),
      totalWatchTimeSeconds: stats.totalWatchTimeSeconds,
    };
  });

  // Sort by completed watches, then by duration
  moviesWithStats.sort((a, b) => {
    if (b.completedWatches !== a.completedWatches) {
      return b.completedWatches - a.completedWatches;
    }
    return (b.durationSeconds ?? 0) - (a.durationSeconds ?? 0);
  });

  return moviesWithStats;
}

// List shows with episode stats
export async function listShows(
  config: JellyfinConfig,
  timeframe: Timeframe
): Promise<ShowWithStats[]> {
  const query = `
    SELECT ROWID, *
    FROM PlaybackActivity
    WHERE UserId = "${config.userId}"
    AND ItemType = "Episode"
    AND DateCreated > '${timeframe.startDate}'
    AND DateCreated <= '${timeframe.endDate}'
    ORDER BY rowid DESC
  `;

  const data = await executeSqlQuery(config, query);

  const playDurationIndex = data.colums.findIndex((i) => i === 'PlayDuration');
  const itemIdIndex = data.colums.findIndex((i) => i === 'ItemId');

  // Get unique episode IDs
  const episodeIds = [...new Set(data.results.map((row) => row[itemIdIndex]))];
  const episodes = await getItemsByIds(config, episodeIds);

  // Get seasons
  const seasonIds = [...new Set(episodes.map((ep) => ep.parentId).filter((id): id is string => !!id))];
  const seasons = await getItemsByIds(config, seasonIds);

  // Get shows
  const showIds = [...new Set(seasons.map((s) => s.parentId).filter((id): id is string => !!id))];
  const shows = await getItemsByIds(config, showIds);

  // Build show info
  const showInfo: ShowWithStats[] = shows.map((show) => {
    const showEpisodes = episodes.filter((episode) => {
      const season = seasons.find((s) => s.id === episode.parentId);
      return season?.parentId === show.id;
    });

    const uniqueEpisodeIds = new Set<string>();
    data.results.forEach((row) => {
      const episodeId = row[itemIdIndex];
      if (showEpisodes.some((ep) => ep.id === episodeId)) {
        uniqueEpisodeIds.add(episodeId);
      }
    });

    const showPlaybackDuration = data.results
      .filter((row) => {
        const showEpisodeIds = showEpisodes.map((ep) => ep.id);
        return showEpisodeIds.includes(row[itemIdIndex]);
      })
      .map((row) => {
        const duration = parseInt(row[playDurationIndex]) || 0;
        const zeroBoundDuration = Math.max(0, duration);
        const maxRuntime = showEpisodes.find((ep) => ep.id === row[itemIdIndex])?.durationSeconds || zeroBoundDuration;
        return Math.min(zeroBoundDuration, maxRuntime);
      })
      .reduce((acc, curr) => acc + curr, 0);

    return {
      showName: show.name ?? '',
      episodeCount: uniqueEpisodeIds.size,
      playbackTime: showPlaybackDuration,
      item: show,
    };
  });

  showInfo.sort((a, b) => b.episodeCount - a.episodeCount);
  return showInfo;
}

// List audio items
export async function listAudio(
  config: JellyfinConfig,
  timeframe: Timeframe
): Promise<SimpleItemDto[]> {
  const query = `
    SELECT ROWID, *
    FROM PlaybackActivity
    WHERE UserId = "${config.userId}"
    AND ItemType = "Audio"
    AND DateCreated > '${timeframe.startDate}'
    AND DateCreated <= '${timeframe.endDate}'
    ORDER BY rowid DESC
  `;

  const data = await executeSqlQuery(config, query);
  const itemIdIndex = data.colums.findIndex((i) => i === 'ItemId');
  const audioIds = [...new Set(data.results.map((row) => row[itemIdIndex]))];
  return getItemsByIds(config, audioIds);
}

// List music videos
export async function listMusicVideos(
  config: JellyfinConfig,
  timeframe: Timeframe
): Promise<SimpleItemDto[]> {
  const query = `
    SELECT ROWID, *
    FROM PlaybackActivity
    WHERE UserId = "${config.userId}"
    AND ItemType = "MusicVideo"
    AND DateCreated > '${timeframe.startDate}'
    AND DateCreated <= '${timeframe.endDate}'
    ORDER BY rowid DESC
  `;

  const data = await executeSqlQuery(config, query);
  const itemIdIndex = data.colums.findIndex((i) => i === 'ItemId');
  const videoIds = [...new Set(data.results.map((row) => row[itemIdIndex]))];
  return getItemsByIds(config, videoIds);
}

// List live TV channels
export async function listLiveTvChannels(
  config: JellyfinConfig,
  timeframe: Timeframe
): Promise<LiveTvChannel[]> {
  const query = `
    SELECT ROWID, *
    FROM PlaybackActivity
    WHERE UserId = "${config.userId}"
    AND ItemType = "TvChannel"
    AND DateCreated > '${timeframe.startDate}'
    AND DateCreated <= '${timeframe.endDate}'
    ORDER BY rowid DESC
  `;

  const data = await executeSqlQuery(config, query);
  const itemNameIndex = data.colums.findIndex((i) => i === 'ItemName');
  const playDurationIndex = data.colums.findIndex((i) => i === 'PlayDuration');

  const channelMap = new Map<string, number>();
  data.results.forEach((row) => {
    const name = row[itemNameIndex];
    const duration = parseInt(row[playDurationIndex]) || 0;
    channelMap.set(name, (channelMap.get(name) || 0) + duration);
  });

  const channels = Array.from(channelMap.entries())
    .map(([channelName, duration]) => ({ channelName, duration }))
    .sort((a, b) => b.duration - a.duration);

  return channels;
}

// Get device stats
export async function getDeviceStats(
  config: JellyfinConfig,
  timeframe: Timeframe
): Promise<DeviceStats> {
  // Device usage
  const deviceQuery = `
    SELECT DeviceName as device, COUNT(*) as count
    FROM PlaybackActivity
    WHERE UserId = "${config.userId}"
    AND DateCreated > '${timeframe.startDate}'
    AND DateCreated <= '${timeframe.endDate}'
    AND DeviceName IS NOT NULL AND DeviceName != ''
    GROUP BY DeviceName
    ORDER BY count DESC
  `;

  const deviceData = await executeSqlQuery(config, deviceQuery);
  const deviceNameIndex = deviceData.colums.findIndex((i) => i === 'device');
  const deviceCountIndex = deviceData.colums.findIndex((i) => i === 'count');

  const deviceUsage = deviceData.results.map((row) => ({
    name: row[deviceNameIndex] || 'Unknown Device',
    count: parseInt(row[deviceCountIndex]) || 0,
  }));

  // Client usage
  const clientQuery = `
    SELECT ClientName as client, COUNT(*) as count
    FROM PlaybackActivity
    WHERE UserId = "${config.userId}"
    AND DateCreated > '${timeframe.startDate}'
    AND DateCreated <= '${timeframe.endDate}'
    AND ClientName IS NOT NULL AND ClientName != ''
    GROUP BY ClientName
    ORDER BY count DESC
  `;

  const clientData = await executeSqlQuery(config, clientQuery);
  const clientNameIndex = clientData.colums.findIndex((i) => i === 'client');
  const clientCountIndex = clientData.colums.findIndex((i) => i === 'count');

  const browserUsage = clientData.results.map((row) => ({
    name: row[clientNameIndex] || 'Unknown Client',
    count: parseInt(row[clientCountIndex]) || 0,
  }));

  // Derive OS from device names
  const osPatterns: Record<string, RegExp> = {
    'Windows': /windows|win\d+|pc/i,
    'macOS': /mac|macos|osx/i,
    'iOS': /iphone|ipad|ios/i,
    'Android': /android/i,
    'Linux': /linux|ubuntu|debian|fedora/i,
    'Chrome OS': /chromebook|chrome\s?os/i,
    'Smart TV': /tv|roku|firestick|chromecast|apple\s?tv/i,
  };

  const osCounts: Record<string, number> = {};
  deviceUsage.forEach((device) => {
    let matched = false;
    for (const [osName, pattern] of Object.entries(osPatterns)) {
      if (pattern.test(device.name)) {
        osCounts[osName] = (osCounts[osName] || 0) + device.count;
        matched = true;
        break;
      }
    }
    if (!matched) {
      osCounts['Other'] = (osCounts['Other'] || 0) + device.count;
    }
  });

  const osUsage = Object.entries(osCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return { deviceUsage, browserUsage, osUsage };
}

// Get punch card data
export async function getPunchCardData(
  config: JellyfinConfig,
  timeframe: Timeframe
): Promise<PunchCardData[]> {
  const query = `
    SELECT
      strftime('%w', DateCreated) as day_of_week,
      strftime('%H', DateCreated) as hour,
      COUNT(*) as count
    FROM PlaybackActivity
    WHERE UserId = "${config.userId}"
    AND DateCreated > '${timeframe.startDate}'
    AND DateCreated <= '${timeframe.endDate}'
    GROUP BY day_of_week, hour
    ORDER BY day_of_week, hour
  `;

  const data = await executeSqlQuery(config, query);
  const dayIndex = data.colums.findIndex((i) => i === 'day_of_week');
  const hourIndex = data.colums.findIndex((i) => i === 'hour');
  const countIndex = data.colums.findIndex((i) => i === 'count');

  return data.results.map((row) => ({
    dayOfWeek: parseInt(row[dayIndex]),
    hour: parseInt(row[hourIndex]),
    count: parseInt(row[countIndex]),
  }));
}

// Get calendar data (last year)
export async function getCalendarData(config: JellyfinConfig): Promise<CalendarData[]> {
  const query = `
    SELECT
      date(DateCreated) as day,
      COUNT(*) as count
    FROM PlaybackActivity
    WHERE UserId = "${config.userId}"
    AND DateCreated > date('now', '-1 year')
    GROUP BY date(DateCreated)
    ORDER BY day
  `;

  const data = await executeSqlQuery(config, query);
  const dayIndex = data.colums.findIndex((i) => i === 'day');
  const countIndex = data.colums.findIndex((i) => i === 'count');

  return data.results.map((row) => ({
    day: row[dayIndex],
    value: parseInt(row[countIndex]),
  }));
}

// Get monthly show stats
export async function getMonthlyShowStats(
  config: JellyfinConfig,
  timeframe: Timeframe
): Promise<MonthlyShowStats[]> {
  const query = `
    SELECT
      strftime('%Y-%m', DateCreated) as Month,
      ItemId,
      SUM(PlayDuration) as TotalPlayDuration
    FROM PlaybackActivity
    WHERE UserId = "${config.userId}"
    AND ItemType = "Episode"
    AND DateCreated > '${timeframe.startDate}'
    AND DateCreated <= '${timeframe.endDate}'
    GROUP BY Month, ItemId
    ORDER BY Month DESC, TotalPlayDuration DESC
  `;

  const data = await executeSqlQuery(config, query);
  const monthIndex = data.colums.findIndex((i) => i === 'Month');
  const itemIdIndex = data.colums.findIndex((i) => i === 'ItemId');
  const durationIndex = data.colums.findIndex((i) => i === 'TotalPlayDuration');

  // Get all episodes
  const episodeIds = [...new Set(data.results.map((row) => row[itemIdIndex]))];
  const episodes = await getItemsByIds(config, episodeIds);

  // Get parents (seasons)
  const level1ParentIds = [...new Set(episodes.map((ep) => ep.parentId).filter((id): id is string => !!id))];
  const level1Parents = await getItemsByIds(config, level1ParentIds);

  // Get shows
  const level2ParentIds = [...new Set(level1Parents.map((p) => p.parentId).filter((id): id is string => !!id))];
  const level2Parents = await getItemsByIds(config, level2ParentIds);

  // Build episode to show mapping
  const episodeToShow = new Map<string, SimpleItemDto>();
  episodes.forEach((episode) => {
    if (!episode.id || !episode.parentId) return;

    const level1Parent = level1Parents.find((p) => p.id === episode.parentId);
    if (!level1Parent) return;

    if (level1Parent.parentId) {
      const level2Parent = level2Parents.find((p) => p.id === level1Parent.parentId);
      episodeToShow.set(episode.id, level2Parent || level1Parent);
    } else {
      episodeToShow.set(episode.id, level1Parent);
    }
  });

  // Collect shows
  const showsMap = new Map<string, SimpleItemDto>();
  episodeToShow.forEach((show) => {
    if (show.id) showsMap.set(show.id, show);
  });
  const shows = Array.from(showsMap.values());

  // Aggregate by month
  const monthlyData: Record<string, { shows: Map<string, number>; totalDuration: number }> = {};
  data.results.forEach((row) => {
    const month = row[monthIndex];
    const episodeId = row[itemIdIndex];
    const duration = parseFloat(row[durationIndex]);
    const show = episodeToShow.get(episodeId);

    if (!show) return;

    if (!monthlyData[month]) {
      monthlyData[month] = { shows: new Map(), totalDuration: 0 };
    }

    const showDuration = monthlyData[month].shows.get(show.id ?? '') || 0;
    monthlyData[month].shows.set(show.id ?? '', showDuration + duration);
    monthlyData[month].totalDuration += duration;
  });

  // Build result
  const result: MonthlyShowStats[] = Object.entries(monthlyData).map(([month, data]) => {
    let maxDuration = 0;
    let topShowId = '';

    data.shows.forEach((duration, showId) => {
      if (duration > maxDuration) {
        maxDuration = duration;
        topShowId = showId;
      }
    });

    const topShow = shows.find((s) => s.id === topShowId);

    return {
      month: `${month}-01T12:00:00.000Z`,
      topShow: {
        item: topShow || { id: topShowId, name: 'Unknown' },
        watchTimeMinutes: maxDuration / 60,
      },
      totalWatchTimeMinutes: data.totalDuration / 60,
    };
  });

  return result.sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
}

// Get unfinished shows
export async function getUnfinishedShows(
  config: JellyfinConfig,
  timeframe: Timeframe
): Promise<UnfinishedShow[]> {
  const query = `
    SELECT
      ItemId,
      ItemName,
      MAX(DateCreated) as LastWatched
    FROM PlaybackActivity
    WHERE UserId = "${config.userId}"
    AND ItemType = "Episode"
    AND DateCreated > '${timeframe.startDate}'
    AND DateCreated <= '${timeframe.endDate}'
    GROUP BY ItemId
  `;

  const data = await executeSqlQuery(config, query);
  const itemIdIndex = data.colums.findIndex((i) => i === 'ItemId');
  const lastWatchedIndex = data.colums.findIndex((i) => i === 'LastWatched');

  const watchedEpisodes = await getItemsByIds(
    config,
    data.results.map((row) => row[itemIdIndex])
  );

  const parentIds = [...new Set(watchedEpisodes.map((ep) => ep.parentId).filter((id): id is string => !!id))];
  const parents = await getItemsByIds(config, parentIds);

  const showIds = [...new Set(
    parents.map((parent) => {
      if (parent.name?.includes('Season')) {
        return parent.parentId;
      }
      return parent.id;
    }).filter((id): id is string => !!id)
  )];

  const shows = await getItemsByIds(config, showIds);

  const unfinishedShows: UnfinishedShow[] = [];

  for (const show of shows) {
    try {
      const stats = await getShowEpisodeStats(config, show.id!);

      if (stats.watched > 0 && stats.watched < stats.total) {
        const showEpisodeIds = new Set(
          watchedEpisodes
            .filter((ep) => {
              const parent = parents.find((p) => p.id === ep.parentId);
              return parent?.parentId === show.id || ep.parentId === show.id;
            })
            .map((ep) => ep.id)
        );

        const lastWatchedDates = data.results
          .filter((row) => showEpisodeIds.has(row[itemIdIndex]))
          .map((row) => new Date(row[lastWatchedIndex]).getTime());

        const lastWatchedDate = new Date(Math.max(...lastWatchedDates, 0));

        unfinishedShows.push({
          item: show,
          watchedEpisodes: stats.watched,
          totalEpisodes: stats.total,
          lastWatchedDate: lastWatchedDate.toISOString(),
        });
      }
    } catch (error) {
      console.error(`Error processing show ${show.name}:`, error);
    }
  }

  return unfinishedShows.sort(
    (a, b) => new Date(b.lastWatchedDate).getTime() - new Date(a.lastWatchedDate).getTime()
  );
}

// List favorite actors
export async function listFavoriteActors(
  config: JellyfinConfig,
  timeframe: Timeframe
): Promise<ActorStats[]> {
  const movies = await listMovies(config, timeframe);
  const shows = await listShows(config, timeframe);

  const people = [
    ...shows.flatMap((show) => show.item.people || []),
    ...movies.flatMap((movie) => movie.people || []),
  ];

  const counts = new Map<string, number>();
  people.forEach((person) => {
    if (!person?.Name) return;
    counts.set(person.Name, (counts.get(person.Name) || 0) + 1);
  });

  const actorStats: ActorStats[] = Array.from(counts.keys()).map((name) => {
    const movieCount = movies.filter((m) =>
      m.people?.some((p) => p?.Name === name)
    ).length;

    const showCount = shows.filter((s) =>
      s.item.people?.some((p) => p?.Name === name)
    ).length;

    const details = people.find((p) => p?.Name === name);

    return {
      name,
      count: movieCount + showCount,
      details: details || { Name: name },
      seenInMovies: movies.filter((m) => m.people?.some((p) => p?.Name === name)),
      seenInShows: shows.filter((s) => s.item.people?.some((p) => p?.Name === name)).map((s) => s.item),
    };
  });

  return actorStats
    .filter((a) => a.count > 1)
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });
}

// Get items watched on a specific date
export async function getWatchedOnDate(
  config: JellyfinConfig,
  date: string // YYYY-MM-DD
): Promise<SimpleItemDto[]> {
  const startDate = date;
  const endDate = new Date(new Date(date).getTime() + 86400000).toISOString().split('T')[0];

  // Movies
  const movieQuery = `
    SELECT ROWID, *
    FROM PlaybackActivity
    WHERE UserId = "${config.userId}"
    AND ItemType = "Movie"
    AND DateCreated > '${startDate}'
    AND DateCreated < '${endDate}'
    ORDER BY rowid DESC
  `;

  const movieData = await executeSqlQuery(config, movieQuery);
  const movieItemIdIndex = movieData.colums.findIndex((i) => i === 'ItemId');
  const movieIds = [...new Set(movieData.results.map((row) => row[movieItemIdIndex]))];
  const movies = await getItemsByIds(config, movieIds);

  // Episodes -> Shows
  const episodeQuery = `
    SELECT ROWID, *
    FROM PlaybackActivity
    WHERE UserId = "${config.userId}"
    AND ItemType = "Episode"
    AND DateCreated > '${startDate}'
    AND DateCreated < '${endDate}'
    ORDER BY rowid DESC
  `;

  const episodeData = await executeSqlQuery(config, episodeQuery);
  const episodeItemIdIndex = episodeData.colums.findIndex((i) => i === 'ItemId');
  const episodeIds = [...new Set(episodeData.results.map((row) => row[episodeItemIdIndex]))];
  const episodes = await getItemsByIds(config, episodeIds);

  const seasonIds = [...new Set(episodes.map((ep) => ep.parentId).filter((id): id is string => !!id))];
  const seasons = await getItemsByIds(config, seasonIds);

  const showIds = [...new Set(seasons.map((s) => s.parentId).filter((id): id is string => !!id))];
  const shows = await getItemsByIds(config, showIds);

  return [...movies, ...shows];
}

