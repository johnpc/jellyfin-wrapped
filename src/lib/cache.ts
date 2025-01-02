export const JELLYFIN_SERVER_URL_CACHE_KEY = "jellyfinServerUrl";
export const JELLYFIN_AUTH_TOKEN_CACHE_KEY = "jellyfinAuthToken";
export const JELLYFIN_USERNAME_CACHE_KEY = "jellyfinUsername";
export const JELLYFIN_PASSWORD_CACHE_KEY = "jellyfinPassword";
export const JELLYFIN_CURRENT_USER_CACHE_KEY = "jellyfinwrapped_current_user";
export const JELLYFIN_HIDDEN_ITEMS = "jellyfinwrapped_hidden_items";
const localCache: Record<string, string> = {};
export const setCacheValue = (key: string, value: string) => {
  const userConfigCacheKeys = [
    JELLYFIN_SERVER_URL_CACHE_KEY,
    JELLYFIN_AUTH_TOKEN_CACHE_KEY,
    JELLYFIN_USERNAME_CACHE_KEY,
    JELLYFIN_PASSWORD_CACHE_KEY,
  ];
  try {
    localCache[key] = value;
    localStorage.setItem(key, value);
    if (userConfigCacheKeys.includes(key)) {
      localStorage.removeItem(JELLYFIN_CURRENT_USER_CACHE_KEY);
    }
  } catch (error) {
    console.warn(`Error setting cache value for key ${key}:`, error);
    if (userConfigCacheKeys.includes(key)) {
      throw new Error(`Error setting cache value for key ${key}: ${error}`);
    }
  }
};

export const getCacheValue = (key: string): string | null => {
  // Check if the value is in the local cache
  if (localCache[key]) {
    return localCache[key];
  }

  // If not, check if the value is in localStorage
  const value = localStorage.getItem(key);
  if (value) {
    // Store the value in the local cache for future use
    localCache[key] = value;
    return value;
  }

  // If the value is not in localStorage, return null
  return null;
};

export const getCachedHiddenIds = (): string[] => {
  return getCacheValue(JELLYFIN_HIDDEN_ITEMS)?.split(",") ?? [];
};

export const setCachedHiddenId = (id: string) => {
  const hiddenIds = getCachedHiddenIds();
  hiddenIds.push(id);
  setCacheValue(JELLYFIN_HIDDEN_ITEMS, hiddenIds.join(","));
};
