import {
  getCurrentUserId,
  getStartDate,
  getEndDate,
  formatDateForSql,
  playbackReportingSqlRequest,
} from "./utils";
import { getItemDtosByIds } from "./items";
import { SimpleItemDto } from "./types";

export type MovieWithStats = SimpleItemDto & {
  playCount: number;
  completedWatches: number;
  totalWatchTimeSeconds: number;
};

export const listMovies = async (): Promise<MovieWithStats[]> => {
  const userId = await getCurrentUserId();
  const startDate = getStartDate();
  const endDate = getEndDate();

  // Query with aggregation to get play count and total watch time per movie
  const queryString = `
    SELECT 
      ItemId,
      COUNT(*) as PlayCount,
      SUM(PlayDuration) as TotalWatchTime
    FROM PlaybackActivity
    WHERE UserId = "${userId}"
    AND ItemType = "Movie"
    AND DateCreated > '${formatDateForSql(startDate)}'
    AND DateCreated <= '${formatDateForSql(endDate)}'
    GROUP BY ItemId
    ORDER BY TotalWatchTime DESC
  `;
  const data = await playbackReportingSqlRequest(queryString);

  const itemIdIndex = data.colums.findIndex((i: string) => i === "ItemId");
  const playCountIndex = data.colums.findIndex((i: string) => i === "PlayCount");
  const watchTimeIndex = data.colums.findIndex((i: string) => i === "TotalWatchTime");

  const movieItemIds = data.results.map((result: string[]) => result[itemIdIndex]);
  const movies = await getItemDtosByIds(movieItemIds);

  // Create a map of movie stats
  const statsMap = new Map<string, { playCount: number; totalWatchTimeSeconds: number }>();
  data.results.forEach((result: string[]) => {
    statsMap.set(result[itemIdIndex], {
      playCount: parseInt(result[playCountIndex]) || 1,
      totalWatchTimeSeconds: parseInt(result[watchTimeIndex]) || 0,
    });
  });

  // Enrich movies with stats
  const moviesWithStats: MovieWithStats[] = movies.map((movie: SimpleItemDto) => {
    const stats = statsMap.get(movie.id ?? "") || { playCount: 1, totalWatchTimeSeconds: 0 };
    const movieDuration = movie.durationSeconds ?? 0;
    
    // Calculate completed watches: total watch time divided by movie duration
    // Round up if watched more than 50% of the movie, otherwise round down
    let completedWatches = 0;
    if (movieDuration > 0) {
      // Use Math.round - rounds up if >= 50%, rounds down if < 50%
      completedWatches = Math.round(stats.totalWatchTimeSeconds / movieDuration);
    } else {
      // Fallback if we don't have duration data
      completedWatches = stats.playCount;
    }
    
    return {
      ...movie,
      playCount: stats.playCount,
      completedWatches: Math.max(1, completedWatches), // At least 1 if it appears in history
      totalWatchTimeSeconds: stats.totalWatchTimeSeconds,
    };
  });

  // Sort by:
  // 1. Completed watches (descending) - movies watched more times come first
  // 2. Movie duration (descending) - for equal watch counts, longer movies come first
  moviesWithStats.sort((a, b) => {
    // First compare by completed watches
    if (b.completedWatches !== a.completedWatches) {
      return b.completedWatches - a.completedWatches;
    }
    // If completed watches are equal, compare by movie duration
    return (b.durationSeconds ?? 0) - (a.durationSeconds ?? 0);
  });

  return moviesWithStats;
};
