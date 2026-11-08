import { getItemsApi } from "@jellyfin/sdk/lib/utils/api";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client";
import { addDays, isSameDay } from "date-fns";
import { getAuthenticatedJellyfinApi } from "../jellyfin-api";
import { getCachedHiddenIds } from "../cache";
import { getCurrentUserId, getStartDate, getEndDate } from "./utils";
import { SimpleItemDto } from "./types";

export type NewLibraryItem = {
  kind: "movie" | "show";
  item: SimpleItemDto;
  // When Jellyfin added the item to the library (the item's DateCreated).
  addedAt: Date;
};

const toSimpleItemDto = (item: BaseItemDto): SimpleItemDto => ({
  id: item.Id,
  parentId: item.ParentId,
  name: item.Name,
  productionYear: item.ProductionYear,
  communityRating: item.CommunityRating,
  date: item.PremiereDate,
  genres: item.Genres,
  genreItems: item.GenreItems,
  durationSeconds: Math.floor((item.RunTimeTicks ?? 0) / 10000000),
});

// Movies and series added to the library in the selected timeframe, oldest first.
// This reads the library itself, not the Playback Reporting plugin, so it also
// lists things that were added but never watched.
export const listNewThisYear = async (): Promise<NewLibraryItem[]> => {
  const api = await getAuthenticatedJellyfinApi();
  const userId = await getCurrentUserId();
  const startDate = getStartDate();
  const endDate = getEndDate();
  // Same allowance as formatEndDateForSql: for timeframes that end now, the
  // server's clock may already be a day ahead of the browser.
  const upperBound = isSameDay(endDate, new Date())
    ? addDays(endDate, 1)
    : endDate;

  const response = await getItemsApi(api).getItems({
    userId,
    includeItemTypes: ["Movie", "Series"],
    recursive: true,
    sortBy: ["DateCreated"],
    sortOrder: ["Ascending"],
    // An item is never saved before it is created, so this only trims the
    // response; the exact DateCreated window is applied below.
    minDateLastSaved: startDate.toISOString(),
    fields: ["DateCreated", "ParentId", "Genres"],
    enableImages: false,
    enableUserData: false,
  });

  const hiddenIds = getCachedHiddenIds();
  const added: NewLibraryItem[] = [];
  for (const dto of response.data.Items ?? []) {
    if (!dto.Id || !dto.DateCreated || hiddenIds.includes(dto.Id)) continue;
    const addedAt = new Date(dto.DateCreated);
    if (addedAt < startDate || addedAt > upperBound) continue;
    added.push({
      kind: dto.Type === "Series" ? "show" : "movie",
      item: toSimpleItemDto(dto),
      addedAt,
    });
  }
  return added.sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime());
};
