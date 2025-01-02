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

export const getAuthenticatedJellyfinApi = async (): Promise<Api> => {
  if (api) {
    return api;
  }

  const serverUrl = getCacheValue(JELLYFIN_SERVER_URL_CACHE_KEY);
  const username = getCacheValue(JELLYFIN_USERNAME_CACHE_KEY);
  const password = getCacheValue(JELLYFIN_PASSWORD_CACHE_KEY);
  const jellyfinAuthToken = getCacheValue(JELLYFIN_AUTH_TOKEN_CACHE_KEY);

  if (!serverUrl || (!(username && password) && !jellyfinAuthToken)) {
    throw new Error(
      "Missing credentials in localStorage. Please configure your Jellyfin connection.",
    );
  }

  // Attempt to authenticate with stored credentials
  if (jellyfinAuthToken) {
    await authenticateByAuthToken(serverUrl, jellyfinAuthToken);
  } else {
    await authenticateByUserName(serverUrl, username!, password!);
  }
  return api!;
};

export const authenticateByAuthToken = async (
  serverUrl: string,
  jellyfinApiKey: string,
) => {
  const jellyfin = new Jellyfin({
    clientInfo: {
      name: "Jellyfin-Wrapped",
      version: "1.0.0",
    },
    deviceInfo: {
      name: "Jellyfin-Wrapped",
      id: await generateGuid(),
    },
  });
  api = jellyfin.createApi(serverUrl, jellyfinApiKey);
  return api;
};

export const authenticateByUserName = async (
  serverUrl: string,
  username: string,
  password: string,
) => {
  try {
    if (api) {
      return;
    }
    const jellyfin = new Jellyfin({
      clientInfo: {
        name: "Jellyfin-Wrapped",
        version: "1.0.0",
      },
      deviceInfo: {
        name: "Jellyfin-Wrapped",
        id: await generateGuid(),
      },
    });
    console.log("Connecting to server...", { serverUrl, username });
    api = jellyfin.createApi(serverUrl);

    // Authentication state is persisted on the api object
    await api.authenticateUserByName(username, password);
  } catch (error) {
    console.error("Connection failed:", error);
    alert(error);
  }
};
