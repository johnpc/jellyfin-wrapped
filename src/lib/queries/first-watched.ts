import { getCachedHiddenIds } from "../cache";
import {
  getCurrentUserId,
  getStartDate,
  getEndDate,
  formatDateForSql,
  playbackReportingSqlRequest,
} from "./utils";
import { getItemDtosByIds } from "./items";
import { SimpleItemDto } from "./types";

export type FirstWatched = {
  kind: "movie" | "show";
  // The movie, or the series an episode belongs to.
  item: SimpleItemDto;
  // Set for shows: the episode that was played first.
  episodeName?: string | null;
  watchedAt: Date;
};

// A play shorter than this is treated as a mis-click, not the first thing watched.
const MIN_PLAY_SECONDS = 5 * 60;
// How many of the earliest plays to look at, in case some items are hidden or gone.
const CANDIDATES = 25;

// The plugin stores local time as "YYYY-MM-DD HH:MM:SS[.ffffff]".
const parsePluginDate = (value: string): Date =>
  new Date(value.replace(" ", "T").replace(/(\.\d{3})\d+$/, "$1"));

export const getFirstWatched = async (): Promise<FirstWatched | null> => {
  const userId = await getCurrentUserId();
  const startDate = getStartDate();
  const endDate = getEndDate();

  const queryString = `
SELECT ItemId, ItemType, DateCreated
FROM PlaybackActivity
WHERE UserId = '${userId}'
AND ItemType IN ('Movie', 'Episode')
AND PlayDuration >= ${MIN_PLAY_SECONDS}
AND DateCreated > '${formatDateForSql(startDate)}'
AND DateCreated <= '${formatDateForSql(endDate)}'
ORDER BY DateCreated ASC
LIMIT ${CANDIDATES}
`;
  const data = await playbackReportingSqlRequest(queryString);
  const itemIdIndex = data.colums.findIndex((i: string) => i == "ItemId");
  const typeIndex = data.colums.findIndex((i: string) => i == "ItemType");
  const dateIndex = data.colums.findIndex((i: string) => i == "DateCreated");

  const hiddenIds = getCachedHiddenIds();
  const ids = data.results.map((row: string[]) => row[itemIdIndex]);
  const items = await getItemDtosByIds(ids.filter((id) => !!id));

  for (const row of data.results) {
    const played = items.find((i: SimpleItemDto) => i.id === row[itemIdIndex]);
    if (!played) continue;
    const watchedAt = parsePluginDate(row[dateIndex]);

    if (row[typeIndex] === "Movie") {
      return { kind: "movie", item: played, watchedAt };
    }

    // Episode -> season -> series, as in listShows.
    const [season] = await getItemDtosByIds(
      played.parentId ? [played.parentId] : []
    );
    const [series] = await getItemDtosByIds(
      season?.parentId ? [season.parentId] : []
    );
    if (!series || hiddenIds.includes(series.id ?? "")) continue;
    return { kind: "show", item: series, episodeName: played.name, watchedAt };
  }
  return null;
};
