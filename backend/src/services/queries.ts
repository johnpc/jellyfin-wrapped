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
  StreakStats,
  TimePersonality,
  DecadeBreakdown,
  WatchEvolution,
  ViewingPersonality,
  FunComparisons,
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

  // Sort by completed watches, then by total watch time
  moviesWithStats.sort((a, b) => {
    if (b.completedWatches !== a.completedWatches) {
      return b.completedWatches - a.completedWatches;
    }
    return (b.totalWatchTimeSeconds ?? 0) - (a.totalWatchTimeSeconds ?? 0);
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

  // Sort by episode count, then by playback time
  showInfo.sort((a, b) => {
    if (b.episodeCount !== a.episodeCount) {
      return b.episodeCount - a.episodeCount;
    }
    return (b.playbackTime ?? 0) - (a.playbackTime ?? 0);
  });
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

// Get streak statistics
export async function getStreakStats(
  config: JellyfinConfig,
  timeframe: Timeframe
): Promise<StreakStats> {
  const query = `
    SELECT
      date(DateCreated) as day,
      COUNT(*) as count
    FROM PlaybackActivity
    WHERE UserId = "${config.userId}"
    AND DateCreated > '${timeframe.startDate}'
    AND DateCreated <= '${timeframe.endDate}'
    GROUP BY date(DateCreated)
    ORDER BY day
  `;

  const data = await executeSqlQuery(config, query);
  const dayIndex = data.colums.findIndex((i) => i === 'day');
  const countIndex = data.colums.findIndex((i) => i === 'count');

  const watchedDays = new Set<string>();
  data.results.forEach((row) => {
    if (parseInt(row[countIndex]) > 0) {
      watchedDays.add(row[dayIndex]);
    }
  });

  if (watchedDays.size === 0) {
    return {
      longestStreak: 0,
      longestBreak: 0,
      currentStreak: 0,
    };
  }

  // Convert to sorted array of dates
  const sortedDays = Array.from(watchedDays).sort();
  
  // Calculate streaks
  let longestStreak = 1;
  let currentStreak = 0;
  let longestBreak = 0;
  let streakStartDate: string | undefined;

  // Check current streak (from end)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  let checkDate = new Date(today);
  let consecutiveDays = 0;
  while (sortedDays.includes(checkDate.toISOString().split('T')[0])) {
    consecutiveDays++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  currentStreak = consecutiveDays;
  // Set streak start date to the earliest date in the consecutive sequence
  // After the loop breaks, checkDate is the first day NOT in the streak
  // So the earliest date in the streak (when it began) is checkDate + 1 day
  if (consecutiveDays > 0) {
    const earliestDate = new Date(checkDate);
    earliestDate.setDate(earliestDate.getDate() + 1);
    streakStartDate = earliestDate.toISOString().split('T')[0];
  }

  // Calculate longest streak and longest break
  let currentStreakLength = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1]);
    const currDate = new Date(sortedDays[i]);
    const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreakLength++;
      longestStreak = Math.max(longestStreak, currentStreakLength);
    } else {
      currentStreakLength = 1;
      if (diffDays > 1) {
        longestBreak = Math.max(longestBreak, diffDays - 1);
      }
    }
  }

  return {
    longestStreak,
    longestBreak,
    currentStreak,
    streakStartDate,
  };
}

// Get time-of-day personality
export async function getTimePersonality(
  config: JellyfinConfig,
  timeframe: Timeframe
): Promise<TimePersonality> {
  const query = `
    SELECT
      strftime('%H', DateCreated) as hour,
      COUNT(*) as count
    FROM PlaybackActivity
    WHERE UserId = "${config.userId}"
    AND DateCreated > '${timeframe.startDate}'
    AND DateCreated <= '${timeframe.endDate}'
    GROUP BY hour
  `;

  const data = await executeSqlQuery(config, query);
  const hourIndex = data.colums.findIndex((i) => i === 'hour');
  const countIndex = data.colums.findIndex((i) => i === 'count');

  let totalCount = 0;
  const hourCounts: Record<number, number> = {};
  
  data.results.forEach((row) => {
    const hour = parseInt(row[hourIndex]);
    const count = parseInt(row[countIndex]);
    hourCounts[hour] = count;
    totalCount += count;
  });

  // Calculate percentages for each time slot
  let earlyBird = 0; // 0-8
  let dayWatcher = 0; // 9-16
  let primeTimer = 0; // 17-21
  let nightOwl = 0; // 22-23

  for (let hour = 0; hour < 24; hour++) {
    const count = hourCounts[hour] || 0;
    if (hour >= 0 && hour < 9) {
      earlyBird += count;
    } else if (hour >= 9 && hour < 17) {
      dayWatcher += count;
    } else if (hour >= 17 && hour < 22) {
      primeTimer += count;
    } else {
      nightOwl += count;
    }
  }

  const breakdown = {
    earlyBird: totalCount > 0 ? Math.round((earlyBird / totalCount) * 100) : 0,
    dayWatcher: totalCount > 0 ? Math.round((dayWatcher / totalCount) * 100) : 0,
    primeTimer: totalCount > 0 ? Math.round((primeTimer / totalCount) * 100) : 0,
    nightOwl: totalCount > 0 ? Math.round((nightOwl / totalCount) * 100) : 0,
  };

  // Determine personality
  const maxCategory = Math.max(breakdown.earlyBird, breakdown.dayWatcher, breakdown.primeTimer, breakdown.nightOwl);
  let personality = 'Prime Timer';
  let peakTime = '5pm-10pm';

  if (breakdown.earlyBird === maxCategory) {
    personality = 'Early Bird';
    peakTime = 'Before 9am';
  } else if (breakdown.dayWatcher === maxCategory) {
    personality = 'Day Watcher';
    peakTime = '9am-4pm';
  } else if (breakdown.primeTimer === maxCategory) {
    personality = 'Prime Timer';
    peakTime = '5pm-10pm';
  } else {
    personality = 'Night Owl';
    peakTime = 'After 10pm';
  }

  return {
    personality,
    breakdown,
    peakTime,
  };
}

// Get decade breakdown
export async function getDecadeBreakdown(
  config: JellyfinConfig,
  timeframe: Timeframe
): Promise<DecadeBreakdown> {
  const movies = await listMovies(config, timeframe);
  const shows = await listShows(config, timeframe);

  const allItems = [
    ...movies,
    ...shows.map((s) => s.item),
  ];

  // Group by time period
  const periods: Record<string, number> = {
    'Pre-2000': 0,
    '2000–2010': 0,
    '2010–2020': 0,
    '2020–Now': 0,
  };

  let totalYear = 0;
  let yearCount = 0;

  allItems.forEach((item) => {
    const year = item.productionYear;
    if (!year) return;

    totalYear += year;
    yearCount++;

    if (year < 2000) {
      periods['Pre-2000']++;
    } else if (year >= 2000 && year < 2010) {
      periods['2000–2010']++;
    } else if (year >= 2010 && year < 2020) {
      periods['2010–2020']++;
    } else {
      periods['2020–Now']++;
    }
  });

  const total = allItems.length;
  const periodBreakdown = Object.entries(periods).map(([period, count]) => ({
    period,
    count,
    percentage: yearCount > 0 ? Math.round((count / yearCount) * 100) : 0,
  }));

  const averageYear = yearCount > 0 ? Math.round(totalYear / yearCount) : 0;
  const topPeriod = periodBreakdown.reduce((max, p) => (p.count > max.count ? p : max), periodBreakdown[0]).period;

  // Determine personality and message
  let personality = '';
  let message = '';

  if (topPeriod === 'Pre-2000') {
    personality = 'Classic Lover';
    message = "Living in the past. You probably complain that 'they don't make 'em like this anymore' (spoiler: they do).";
  } else if (topPeriod === '2000–2010') {
    personality = 'Questionable Taste';
    message = "You have questionable taste. This was the decade that decided Shrek was a masterpiece. (Okay, fair point).";
  } else if (topPeriod === '2010–2020') {
    personality = 'Zero Adventurousness';
    message = "Zero adventurousness detected. You watched the same stuff everyone else watched 5 years ago.";
  } else {
    personality = 'Recency Bias';
    message = "Recency Bias: The Diagnosis. You have the object permanence of a goldfish—if it's not new, it doesn't exist.";
  }

  return {
    periodBreakdown,
    averageYear,
    topPeriod,
    personality,
    message,
  };
}

// Get watch evolution
export async function getWatchEvolution(
  config: JellyfinConfig,
  timeframe: Timeframe
): Promise<WatchEvolution> {
  // Get monthly watch time
  const monthlyQuery = `
    SELECT
      strftime('%Y-%m', DateCreated) as month,
      SUM(PlayDuration) as totalDuration
    FROM PlaybackActivity
    WHERE UserId = "${config.userId}"
    AND DateCreated > '${timeframe.startDate}'
    AND DateCreated <= '${timeframe.endDate}'
    GROUP BY month
    ORDER BY month
  `;

  const monthlyData = await executeSqlQuery(config, monthlyQuery);
  const monthIndex = monthlyData.colums.findIndex((i) => i === 'month');
  const durationIndex = monthlyData.colums.findIndex((i) => i === 'totalDuration');

  // Get movies and shows for genre analysis
  const movies = await listMovies(config, timeframe);
  const shows = await listShows(config, timeframe);

  // Get genre data by month
  const genreQuery = `
    SELECT
      strftime('%Y-%m', DateCreated) as month,
      ItemId
    FROM PlaybackActivity
    WHERE UserId = "${config.userId}"
    AND (ItemType = "Movie" OR ItemType = "Episode")
    AND DateCreated > '${timeframe.startDate}'
    AND DateCreated <= '${timeframe.endDate}'
    ORDER BY month
  `;

  const genreData = await executeSqlQuery(config, genreQuery);
  const genreMonthIndex = genreData.colums.findIndex((i) => i === 'month');
  const genreItemIdIndex = genreData.colums.findIndex((i) => i === 'ItemId');

  // Build item map
  const itemMap = new Map<string, SimpleItemDto>();
  movies.forEach((m) => {
    if (m.id) itemMap.set(m.id, m);
  });
  shows.forEach((s) => {
    if (s.item.id) itemMap.set(s.item.id, s.item);
  });

  // Group by month and count genres
  const monthGenreMap = new Map<string, Map<string, number>>();
  genreData.results.forEach((row) => {
    const month = row[genreMonthIndex];
    const itemId = row[genreItemIdIndex];
    const item = itemMap.get(itemId);
    
    if (!item || !item.genres) return;

    if (!monthGenreMap.has(month)) {
      monthGenreMap.set(month, new Map());
    }
    const genreMap = monthGenreMap.get(month)!;

    item.genres.forEach((genre) => {
      genreMap.set(genre, (genreMap.get(genre) || 0) + 1);
    });
  });

  // Build monthly data with top genre
  const monthlyDataResult = monthlyData.results.map((row) => {
    const month = row[monthIndex];
    const watchTimeMinutes = Math.round(parseInt(row[durationIndex]) / 60);
    
    const genreMap = monthGenreMap.get(month);
    let topGenre: string | undefined = undefined;
    if (genreMap && genreMap.size > 0) {
      const sortedGenres = Array.from(genreMap.entries()).sort((a, b) => b[1] - a[1]);
      topGenre = sortedGenres[0][0];
    }

    return {
      month: `${month}-01T12:00:00.000Z`,
      watchTimeMinutes,
      topGenre,
    };
  });

  // Build genre evolution
  const genreEvolution = Array.from(monthGenreMap.entries()).map(([month, genreMap]) => {
    const genres = Array.from(genreMap.entries())
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 genres per month

    return {
      month: `${month}-01T12:00:00.000Z`,
      genres,
    };
  });

  return {
    monthlyData: monthlyDataResult,
    genreEvolution,
  };
}

// Get viewing personality
export async function getPersonality(
  config: JellyfinConfig,
  timeframe: Timeframe
): Promise<ViewingPersonality> {
  const movies = await listMovies(config, timeframe);
  const shows = await listShows(config, timeframe);
  const calendarData = await getCalendarData(config);
  const punchCardData = await getPunchCardData(config, timeframe);

  // Analyze patterns
  const totalMovies = movies.length;
  const totalShows = shows.length;
  const totalItems = totalMovies + totalShows;
  const movieRatio = totalItems > 0 ? totalMovies / totalItems : 0;

  // Genre diversity
  const allGenres = new Set<string>();
  movies.forEach((m) => m.genres?.forEach((g) => allGenres.add(g)));
  shows.forEach((s) => s.item.genres?.forEach((g) => allGenres.add(g)));
  const genreDiversity = allGenres.size;

  // Binge patterns (consecutive days)
  const watchedDays = new Set(calendarData.map((d) => d.day));
  let maxConsecutive = 0;
  let currentConsecutive = 0;
  const sortedDays = Array.from(watchedDays).sort();
  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1]);
    const currDate = new Date(sortedDays[i]);
    const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 0;
    }
  }

  // Time preference
  let nightViewing = 0;
  let totalViewing = 0;
  punchCardData.forEach((p) => {
    totalViewing += p.count;
    if (p.hour >= 22 || p.hour < 6) {
      nightViewing += p.count;
    }
  });
  const nightRatio = totalViewing > 0 ? nightViewing / totalViewing : 0;

  // Content age
  let totalYear = 0;
  let yearCount = 0;
  movies.forEach((m) => {
    if (m.productionYear) {
      totalYear += m.productionYear;
      yearCount++;
    }
  });
  shows.forEach((s) => {
    if (s.item.productionYear) {
      totalYear += s.item.productionYear;
      yearCount++;
    }
  });
  const avgYear = yearCount > 0 ? totalYear / yearCount : new Date().getFullYear();
  const currentYear = new Date().getFullYear();
  const contentAge = currentYear - avgYear;

  // Determine personality
  let personality = 'Casual Viewer';
  let description = 'You enjoy a balanced mix of content.';
  const traits: string[] = [];

  if (movieRatio > 0.7) {
    personality = 'Movie Buff';
    description = 'You prefer the cinematic experience of movies over episodic content.';
    traits.push('Movie Enthusiast');
    traits.push('Quality over Quantity');
  } else if (movieRatio < 0.3) {
    personality = 'Binge Master';
    description = 'You love diving deep into TV series and can\'t get enough of episodic storytelling.';
    traits.push('Series Devotee');
    traits.push('Long-form Content Lover');
  }

  if (genreDiversity > 10) {
    traits.push('Genre Explorer');
  } else if (genreDiversity < 5) {
    traits.push('Genre Loyalist');
  }

  if (maxConsecutive > 7) {
    traits.push('Binge Champion');
  }

  if (nightRatio > 0.4) {
    traits.push('Night Owl');
  }

  if (contentAge > 20) {
    traits.push('Classic Lover');
  } else if (contentAge < 5) {
    traits.push('Trend Follower');
  }

  if (traits.length === 0) {
    traits.push('Balanced Viewer');
  }

  return {
    personality,
    description,
    traits,
  };
}

// Get fun comparisons
export async function getFunComparisons(
  config: JellyfinConfig,
  timeframe: Timeframe
): Promise<FunComparisons> {
  const movies = await listMovies(config, timeframe);
  const shows = await listShows(config, timeframe);

  // Calculate total watch time in minutes
  const movieTime = movies.reduce((sum, m) => sum + (m.totalWatchTimeSeconds || 0), 0) / 60;
  const showTime = shows.reduce((sum, s) => sum + (s.playbackTime || 0), 0) / 60;
  const totalMinutes = movieTime + showTime;
  const totalHours = totalMinutes / 60;
  const totalDays = totalHours / 24;

  const comparisons: Array<{ label: string; value: number; unit: string }> = [];

  // Movie theaters (assuming 2-hour movies, 100-seat theaters)
  const avgMovieLength = 120; // minutes
  const theaterCapacity = 100;
  const theaters = Math.round((totalMinutes / avgMovieLength) / theaterCapacity);
  if (theaters > 0) {
    comparisons.push({
      label: 'You watched enough to fill',
      value: theaters,
      unit: theaters === 1 ? 'movie theater' : 'movie theaters',
    });
  }

  // Work weeks (40 hours/week)
  const workWeeks = Math.round(totalHours / 40);
  if (workWeeks > 0) {
    comparisons.push({
      label: "That's",
      value: workWeeks,
      unit: workWeeks === 1 ? 'full work week' : 'full work weeks',
    });
  }

  // Complete TV series (average 8 seasons, 10 episodes, 45 min each = 60 hours)
  const avgSeriesLength = 60 * 60; // minutes
  const series = Math.round(totalMinutes / avgSeriesLength);
  if (series > 0) {
    comparisons.push({
      label: 'You could have watched',
      value: series,
      unit: series === 1 ? 'complete TV series' : 'complete TV series',
    });
  }

  // Full days
  if (totalDays >= 1) {
    comparisons.push({
      label: 'You watched the equivalent of',
      value: Math.round(totalDays),
      unit: Math.round(totalDays) === 1 ? 'full day' : 'full days',
    });
  }

  // Lord of the Rings trilogy (extended edition ~11 hours = 660 minutes)
  const lotrLength = 11 * 60; // minutes
  const lotrTimes = Math.round(totalMinutes / lotrLength);
  if (lotrTimes > 0) {
    comparisons.push({
      label: 'You could have watched',
      value: lotrTimes,
      unit: lotrTimes === 1 ? 'time the entire Lord of the Rings trilogy' : 'times the entire Lord of the Rings trilogy',
    });
  }

  return { comparisons };
}


