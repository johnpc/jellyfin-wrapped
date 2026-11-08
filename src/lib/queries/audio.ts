import {
  getCurrentUserId,
  getStartDate,
  getEndDate,
  formatDateForSql,
  formatEndDateForSql,
  playbackReportingSqlRequest,
} from "./utils";
import { getItemDtosByIds } from "./items";
import { SimpleItemDto } from "./types";

export type AudioPlayDto = {
  item: SimpleItemDto;
  // Plays recorded by the Playback Reporting plugin in the selected timeframe.
  playCount: number;
};

// Songs played in the timeframe, most played first. One entry per song: the
// plugin logs a row per play, so the count is the number of rows for the item.
export const listAudio = async (): Promise<AudioPlayDto[]> => {
  const userId = await getCurrentUserId();
  const startDate = getStartDate();
  const endDate = getEndDate();

  const queryString = `
  SELECT ItemId, COUNT(*) AS PlayCount
  FROM PlaybackActivity
  WHERE UserId = '${userId}'
  AND ItemType = 'Audio'
  AND DateCreated > '${formatDateForSql(startDate)}'
  AND DateCreated <= '${formatEndDateForSql(endDate)}'
  GROUP BY ItemId
  ORDER BY PlayCount DESC, MAX(rowid) DESC
  `;
  const data = await playbackReportingSqlRequest(queryString);

  const itemIdIndex = data.colums.findIndex((i: string) => i == "ItemId");
  const playCountIndex = data.colums.findIndex((i: string) => i == "PlayCount");
  const playCounts = new Map<string, number>();
  data.results.forEach((result: string[]) => {
    playCounts.set(result[itemIdIndex], Number(result[playCountIndex]) || 0);
  });

  // Hidden items are dropped here, as before; the counts are attached after.
  const items = await getItemDtosByIds(Array.from(playCounts.keys()));
  return items
    .map((item: SimpleItemDto) => ({
      item,
      playCount: playCounts.get(item.id ?? "") ?? 0,
    }))
    .sort((a, b) => b.playCount - a.playCount);
};

export const listMusicVideos = async (): Promise<SimpleItemDto[]> => {
  const userId = await getCurrentUserId();
  const startDate = getStartDate();
  const endDate = getEndDate();

  const queryString = `
  SELECT ROWID, *
  FROM PlaybackActivity
  WHERE UserId = '${userId}'
  AND ItemType = 'MusicVideo'
  AND DateCreated > '${formatDateForSql(startDate)}'
  AND DateCreated <= '${formatEndDateForSql(endDate)}'
  ORDER BY rowid DESC
  `;
  const data = await playbackReportingSqlRequest(queryString);

  const itemIdIndex = data.colums.findIndex((i: string) => i == "ItemId");
  const movieItemIds = data.results
    .map((result: string[]) => result[itemIdIndex])
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index
    );
  return getItemDtosByIds(movieItemIds);
};
