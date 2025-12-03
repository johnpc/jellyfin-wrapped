import { getUserLibraryApi } from "@jellyfin/sdk/lib/utils/api";
import { getAuthenticatedJellyfinApi } from "../jellyfin-api";
import { getCacheValue, setCacheValue, getCachedHiddenIds } from "../cache";
import { getCurrentUserId } from "./utils";
import { SimpleItemDto } from "./types";

export const getItemDtosByIds = async (
  ids: string[]
): Promise<SimpleItemDto[]> => {
  const hiddenIds = getCachedHiddenIds();
  const authenticatedApi = await getAuthenticatedJellyfinApi();
  const userId = await getCurrentUserId();
  const itemsApi = getUserLibraryApi(authenticatedApi);

  const itemPromises = ids
    .filter((id: string) => !hiddenIds.includes(id))
    .map(async (itemId: string) => {
      try {
        const cachedItem = getCacheValue(`item_${itemId}`);

        if (cachedItem) {
          return JSON.parse(cachedItem) as SimpleItemDto;
        } else {
          const item = await itemsApi.getItem({
            itemId,
            userId,
          });
          const ticks = item.data.RunTimeTicks ?? 0;
          const durationSeconds = Math.floor(ticks / 10000000);

          const simpleItem: SimpleItemDto = {
            id: item.data.Id,
            parentId: item.data.ParentId,
            name: item.data.Name,
            productionYear: item.data.ProductionYear,
            communityRating: item.data.CommunityRating,
            people: item.data.People,
            date: item.data.PremiereDate,
            genres: item.data.Genres,
            genreItems: item.data.GenreItems,
            durationSeconds,
          };
          setCacheValue(`item_${itemId}`, JSON.stringify(simpleItem));

          return simpleItem;
        }
      } catch {
        console.debug(`Item ${itemId} not found, skipping`);
        return null;
      }
    });
  const movieItems = await Promise.all(itemPromises);
  return movieItems.filter((item): item is SimpleItemDto => item !== null);
};
