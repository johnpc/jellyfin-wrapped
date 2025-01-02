import { Api, Jellyfin } from "@jellyfin/sdk";
import { generateGuid } from "./utils";
import {
  getCacheValue,
  JELLYFIN_AUTH_TOKEN_CACHE_KEY,
  JELLYFIN_PASSWORD_CACHE_KEY,
  JELLYFIN_SERVER_URL_CACHE_KEY,
  JELLYFIN_USERNAME_CACHE_KEY,
} from "./cache";

let api: Api | null = null;
const sleep = (durationMs: number) =>
  new Promise((resolve) => setTimeout(resolve, durationMs));
export const getAuthenticatedJellyfinApi = async (): Promise<Api> => {
  if (api && api.accessToken) {
    return api;
  }

  const serverUrl = getCacheValue(JELLYFIN_SERVER_URL_CACHE_KEY);
  const username = getCacheValue(JELLYFIN_USERNAME_CACHE_KEY) ?? "";
  const password = getCacheValue(JELLYFIN_PASSWORD_CACHE_KEY) ?? "";
  const jellyfinAuthToken = getCacheValue(JELLYFIN_AUTH_TOKEN_CACHE_KEY);

  if (!serverUrl || (!username && !jellyfinAuthToken)) {
    throw new Error(
      "Missing credentials in localStorage. Please configure your Jellyfin connection.",
    );
  }

  // Attempt to authenticate with stored credentials
  if (jellyfinAuthToken) {
    api = authenticateByAuthToken(serverUrl, jellyfinAuthToken);
  } else {
    api = await authenticateByUserName(serverUrl, username, password);
    // No, I cannot explain why this needs to happen twice with long delay.
    // However, if omitted, you cannot refresh the page from a specific route.
    await sleep(1000);
    api = await authenticateByUserName(serverUrl, username, password);
  }
  return api;
};

export const authenticateByAuthToken = (
  serverUrl: string,
  jellyfinApiKey: string,
): Api => {
  const jellyfin = new Jellyfin({
    clientInfo: {
      name: "Jellyfin-Wrapped",
      version: "1.0.0",
    },
    deviceInfo: {
      name: "Jellyfin-Wrapped",
      id: generateGuid(),
    },
  });
  api = jellyfin.createApi(serverUrl, jellyfinApiKey);
  return api;
};

export const authenticateByUserName = async (
  serverUrl: string,
  username: string,
  password: string,
): Promise<Api> => {
  if (api) {
    return api;
  }
  const jellyfin = new Jellyfin({
    clientInfo: {
      name: "Jellyfin-Wrapped",
      version: "1.0.0",
    },
    deviceInfo: {
      name: "Jellyfin-Wrapped",
      id: generateGuid(),
    },
  });
  console.log("Connecting to server...", { serverUrl, username });
  api = jellyfin.createApi(serverUrl);

  try {
    // Authentication state is persisted on the api object
    await api.authenticateUserByName(username, password);
  } catch (error) {
    console.error("Connection failed:", error);
    alert(error);
    throw error;
  }

  return api;
};
