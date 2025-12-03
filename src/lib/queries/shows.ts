import {
  getCurrentUserId,
  getStartDate,
  getEndDate,
  formatDateForSql,
  playbackReportingSqlRequest,
} from "./utils";
import { getItemDtosByIds } from "./items";
import { SimpleItemDto } from "./types";

export const listShows = async (): Promise<
  {
    showName: string;
    episodeCount: number;
    playbackTime: number;
    item: SimpleItemDto;
  }[]
> => {
  const userId = await getCurrentUserId();
  const startDate = getStartDate();
  const endDate = getEndDate();

  // Query only for episodes to get playback data
  const queryString = `
  SELECT ROWID, *
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND ItemType = "Episode"
  AND DateCreated > '${formatDateForSql(startDate)}'
  AND DateCreated <= '${formatDateForSql(endDate)}'
  ORDER BY rowid DESC
  `;
  const data = await playbackReportingSqlRequest(queryString);

  const playDurationIndex = data.colums.findIndex(
    (i: string) => i == "PlayDuration"
  );
  const itemIdIndex = data.colums.findIndex((i: string) => i == "ItemId");
  const showItemIds = data.results
    .map((result: string[]) => result[itemIdIndex])
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index
    );
  const episodes = await getItemDtosByIds(showItemIds);
  const seasonIds: string[] = episodes
    .map((episode: SimpleItemDto) => episode.parentId ?? "")
    .filter((v: string) => v)
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index
    );
  const seasons = await getItemDtosByIds(seasonIds);

  const showIds: string[] = seasons
    .map((season: SimpleItemDto) => season.parentId ?? "")
    .filter((v: string) => v)
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index
    );
  const shows = await getItemDtosByIds(showIds);
  const showInfo: {
    showName: string;
    episodeCount: number;
    playbackTime: number;
    item: SimpleItemDto;
  }[] = shows.map((show: SimpleItemDto) => {
    const showEpisodes = episodes.filter((episode: SimpleItemDto) => {
      const season = seasons.find(
        (s: SimpleItemDto) => s.id === episode.parentId
      );
      return season?.parentId === show.id;
    });

    const uniqueEpisodeIds = new Set();
    data.results.forEach((result: string[]) => {
      const episodeId = result[itemIdIndex];
      if (
        showEpisodes.some((episode: SimpleItemDto) => episode.id === episodeId)
      ) {
        uniqueEpisodeIds.add(episodeId);
      }
    });

    const showPlaybackDuration = data.results
      .filter((result: string[]) => {
        const showEpisodeIds = showEpisodes.map(
          (episode: SimpleItemDto) => episode.id
        );
        return showEpisodeIds.includes(result[itemIdIndex]);
      })
      .map((result: string[]) => {
        const duration = parseInt(result[playDurationIndex]);
        const zeroBoundDuration = Math.max(0, duration);
        const maxShowRuntime =
          showEpisodes.find(
            (show: SimpleItemDto) => show.id === result[itemIdIndex]
          )?.durationSeconds || zeroBoundDuration;
        const playBackBoundDuration = Math.min(
          zeroBoundDuration,
          maxShowRuntime
        );
        return playBackBoundDuration;
      })
      .reduce((acc: number, curr: number) => acc + curr, 0);
    return {
      showName: show.name ?? "",
      episodeCount: uniqueEpisodeIds.size,
      playbackTime: showPlaybackDuration,
      item: show,
    };
  });

  showInfo.sort(
    (a: { episodeCount: number }, b: { episodeCount: number }) =>
      b.episodeCount - a.episodeCount
  );

  return showInfo;
};
