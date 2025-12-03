import { addDays, format, startOfDay } from "date-fns";
import { getCurrentUserId, playbackReportingSqlRequest } from "./utils";
import { getItemDtosByIds } from "./items";
import { SimpleItemDto } from "./types";

export const listWatchedOnDate = async (
  date: Date
): Promise<SimpleItemDto[]> => {
  const startOfDate = startOfDay(date);
  const endOfDate = addDays(startOfDate, 1);

  const userId = await getCurrentUserId();

  const queryString = `
SELECT ROWID, *
FROM PlaybackActivity
WHERE UserId = "${userId}"
AND ItemType = "Movie"
AND DateCreated > '${format(startOfDate, "yyyy-MM-dd")}'
AND DateCreated < '${format(endOfDate, "yyyy-MM-dd")}'
ORDER BY rowid DESC
`;
  const data = await playbackReportingSqlRequest(queryString);

  const queryString2 = `
  SELECT ROWID, *
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND ItemType = "Episode"
  AND DateCreated > '${format(startOfDate, "yyyy-MM-dd")}'
  AND DateCreated < '${format(endOfDate, "yyyy-MM-dd")}'
  ORDER BY rowid DESC
  `;
  const data2 = await playbackReportingSqlRequest(queryString2);
  const itemIdIndex2 = data2.colums.findIndex((i: string) => i == "ItemId");
  const showItemIds = data2.results
    .map((result: string[]) => result[itemIdIndex2])
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
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index
    );
  const shows = await getItemDtosByIds(showIds);
  const itemIdIndex = data.colums.findIndex((i: string) => i == "ItemId");
  const movieItemIds = data.results
    .map((result: string[]) => result[itemIdIndex])
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index
    );
  const movies = await getItemDtosByIds(movieItemIds);

  return [...movies, ...shows];
};
