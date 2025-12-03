import { getImageApi } from "@jellyfin/sdk/lib/utils/api";
import { ImageType } from "@jellyfin/sdk/lib/generated-client";
import { getAuthenticatedJellyfinApi } from "../jellyfin-api";
import { getCacheValue, setCacheValue } from "../cache";

export const getImageUrlById = async (id: string): Promise<string> => {
  const cacheKey = `imageUrlCache_${id}`;
  const cachedUrl = getCacheValue(cacheKey);
  if (cachedUrl) {
    return cachedUrl;
  }
  const api = getImageApi(await getAuthenticatedJellyfinApi());
  const url = api.getItemImageUrlById(id, ImageType.Primary, {
    maxWidth: 300,
    width: 300,
    quality: 90,
  });
  setCacheValue(cacheKey, url);
  return url;
};
