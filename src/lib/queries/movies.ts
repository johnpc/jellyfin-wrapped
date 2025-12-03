import {
  getCurrentUserId,
  getStartDate,
  getEndDate,
  formatDateForSql,
  playbackReportingSqlRequest,
} from "./utils";
import { getItemDtosByIds } from "./items";
import { SimpleItemDto } from "./types";

export const listMovies = async (): Promise<SimpleItemDto[]> => {
  const userId = await getCurrentUserId();
  const startDate = getStartDate();
  const endDate = getEndDate();

  const queryString = `
SELECT ROWID, *
FROM PlaybackActivity
WHERE UserId = "${userId}"
AND ItemType = "Movie"
AND DateCreated > '${formatDateForSql(startDate)}'
AND DateCreated <= '${formatDateForSql(endDate)}'
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
