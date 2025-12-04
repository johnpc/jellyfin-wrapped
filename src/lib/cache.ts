// Cache keys for user preferences and session data
// Note: Sensitive data like passwords are NEVER stored client-side
export const JELLYFIN_USERNAME_CACHE_KEY = "jellyfinUsername";
export const JELLYFIN_CURRENT_USER_CACHE_KEY = "jellyfinwrapped_current_user";
export const JELLYFIN_HIDDEN_ITEMS = "jellyfinwrapped_hidden_items";

const localCache: Record<string, string> = {};

export const setCacheValue = (key: string, value: string) => {
  try {
    localCache[key] = value;
    localStorage.setItem(key, value);
    // Clear user cache when username changes (forces re-fetch)
    if (key === JELLYFIN_USERNAME_CACHE_KEY) {
      localStorage.removeItem(JELLYFIN_CURRENT_USER_CACHE_KEY);
    }
  } catch (error) {
    console.warn(`Error setting cache value for key ${key}:`, error);
  }
};

export const getCacheValue = (key: string): string | null => {
  // Check if the value is in the local cache
  if (localCache[key]) {
    return localCache[key];
  }

  const value = localStorage.getItem(key);
  if (value) {
    localCache[key] = value;
    return value;
  }

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
