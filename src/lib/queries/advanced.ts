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

  const seasonIds = Array.from(
    new Set(
      episodes
        .map((episode: SimpleItemDto) => episode.parentId)
        .filter((id): id is string => id !== null && id !== undefined)
    )
  );

  const seasons = await getItemDtosByIds(seasonIds);

  const showIds = Array.from(
    new Set(
      seasons
        .map((season: SimpleItemDto) => season.parentId)
        .filter((id): id is string => id !== null && id !== undefined)
    )
  );

  const shows = await getItemDtosByIds(showIds);

  const episodeToShow = new Map<string, SimpleItemDto>();
  episodes.forEach((episode: SimpleItemDto) => {
    const season = seasons.find(
      (s: SimpleItemDto) => s.id === episode.parentId
    );
    if (season) {
      const show = shows.find((s: SimpleItemDto) => s.id === season.parentId);
      if (show && episode.id) {
        episodeToShow.set(episode.id, show);
      }
    }
  });

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

      return {
        month: new Date(month + "-01"),
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
