import { getCacheValue, setCacheValue } from "../cache";

// Get Jellyfin server URL from environment
function getJellyfinServerUrl(): string {
  if (typeof window !== "undefined" && "ENV" in window) {
    const env = (window as { ENV?: Record<string, string> }).ENV;
    if (env?.JELLYFIN_SERVER_URL) {
      return env.JELLYFIN_SERVER_URL;
    }
  }
  return import.meta.env.VITE_JELLYFIN_SERVER_URL || "";
}

export const getImageUrlById = async (id: string): Promise<string> => {
  const cacheKey = `imageUrlCache_${id}`;
  const cachedUrl = getCacheValue(cacheKey);
  if (cachedUrl) {
    return cachedUrl;
  }

  const serverUrl = getJellyfinServerUrl();
  if (!serverUrl) {
    console.warn("JELLYFIN_SERVER_URL not configured - images may not load");
    return "";
  }

  // Construct direct image URL (Jellyfin images are typically public)
  const url = `${serverUrl}/Items/${id}/Images/Primary?maxWidth=300&width=300&quality=90`;
  setCacheValue(cacheKey, url);
  return url;
};
