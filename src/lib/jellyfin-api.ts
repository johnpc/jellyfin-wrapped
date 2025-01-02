import { Api, Jellyfin } from "@jellyfin/sdk";
import { generateFingerprint } from "./utils";

let api: Api | null = null;

export const getAuthenticatedJellyfinApi = async (): Promise<Api> => {
  if (api) {
    return api;
  }

  const serverUrl = localStorage.getItem("jellyfinServerUrl");
  const username = localStorage.getItem("jellyfinUsername");
  const password = localStorage.getItem("jellyfinPassword");
  const jellyfinAuthToken = localStorage.getItem("jellyfinAuthToken");

  if (!serverUrl || !username || !password || !jellyfinAuthToken) {
    throw new Error(
      "Missing credentials in localStorage. Please configure your Jellyfin connection.",
    );
  }

  // Attempt to authenticate with stored credentials
  if (jellyfinAuthToken) {
    await authenticateByAuthToken(serverUrl, jellyfinAuthToken);
  } else {
    await authenticateByUserName(serverUrl, username, password);
  }
  return api!;
};

export const authenticateByAuthToken = async (
  serverUrl: string,
  jellyfinApiKey: string,
) => {
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
      id: await generateFingerprint(),
    },
  });
  api = jellyfin.createApi(serverUrl);
  api.accessToken = jellyfinApiKey;
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
        id: await generateFingerprint(),
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
