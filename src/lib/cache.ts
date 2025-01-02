export const JELLYFIN_SERVER_URL_CACHE_KEY = "jellyfinServerUrl";
export const JELLYFIN_AUTH_TOKEN_CACHE_KEY = "jellyfinAuthToken";
export const JELLYFIN_USERNAME_CACHE_KEY = "jellyfinUsername";
export const JELLYFIN_PASSWORD_CACHE_KEY = "jellyfinPassword";
export const JELLYFIN_CURRENT_USER_CACHE_KEY = "jellyfinwrapped_current_user";
const localCache: Record<string, string> = {};
export const setCacheValue = (key: string, value: string) => {
  try {
    localCache[key] = value;
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Error setting cache value for key ${key}:`, error);
    const necessaryCacheKeys = [
      JELLYFIN_SERVER_URL_CACHE_KEY,
      JELLYFIN_AUTH_TOKEN_CACHE_KEY,
      JELLYFIN_USERNAME_CACHE_KEY,
      JELLYFIN_PASSWORD_CACHE_KEY,
    ];
    if (necessaryCacheKeys.includes(key)) {
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
