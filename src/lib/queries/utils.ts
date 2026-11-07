import { format } from "date-fns";
import { getCurrentTimeframe } from "../timeframe";
import {
  getAdminJellyfinApi,
  getAuthenticatedJellyfinApi,
  getEnvVar,
} from "../jellyfin-api";

export const getStartDate = (): Date => {
  return getCurrentTimeframe().startDate;
};

export const getEndDate = (): Date => {
  return getCurrentTimeframe().endDate;
};

export const formatDateForSql = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};

export const getCurrentUserId = async (): Promise<string> => {
  const { getUserApi } = await import("@jellyfin/sdk/lib/utils/api");
  const { getCacheValue, setCacheValue, JELLYFIN_CURRENT_USER_CACHE_KEY } =
    await import("../cache");

  const cachedUserId = getCacheValue(JELLYFIN_CURRENT_USER_CACHE_KEY);
  if (cachedUserId) {
    return cachedUserId;
  }

  const authenticatedApi = await getAuthenticatedJellyfinApi();
  const userApi = getUserApi(authenticatedApi);
  const user = await userApi.getCurrentUser();
  const userId = user.data.Id ?? "";
  setCacheValue(JELLYFIN_CURRENT_USER_CACHE_KEY, userId);
  return userId;
};

// Direct mode: the admin API key is in the browser and the plugin is called as-is.
const fetchWithAdminKey = (queryString: string): Promise<Response> => {
  const adminApi = getAdminJellyfinApi();
  return fetch(
    `${adminApi.basePath}/user_usage_stats/submit_custom_query?stamp=${Date.now()}`,
    {
      method: "POST",
      headers: {
        // Jellyfin 12 only accepts the Authorization header; older servers also
        // accept it, so send it alongside the legacy header.
        Authorization: `MediaBrowser Client="Jellyfin Wrapped", Device="Web", DeviceId="jellyfin-wrapped", Version="1.0.0", Token="${getEnvVar("JELLYFIN_API_KEY")}"`,
        "X-Emby-Token": `${getEnvVar("JELLYFIN_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        CustomQueryString: queryString,
        ReplaceUserId: true,
      }),
    }
  );
};

// Server mode: no admin key in the browser. The backend checks the user's own
// Jellyfin token and only runs the query against that user's playback data.
const fetchThroughServer = async (queryString: string): Promise<Response> => {
  const api = await getAuthenticatedJellyfinApi();
  const res = await fetch("/api/playback-report", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${api.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: queryString }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(
      `Playback report request failed (${res.status}): ${detail.substring(0, 200)}`
    );
  }
  return res;
};

export const playbackReportingSqlRequest = async (
  queryString: string
): Promise<{
  colums: string[];
  results: string[][];
}> => {
  const res = getEnvVar("JELLYFIN_API_KEY")
    ? await fetchWithAdminKey(queryString)
    : await fetchThroughServer(queryString);

  const text = await res.text();

  if (!text) {
    throw new Error("Empty response from Jellyfin server");
  }

  try {
    return JSON.parse(text) as {
      colums: string[];
      results: string[][];
    };
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    console.error("Response was:", text);
    throw new Error(`Invalid JSON response: ${text.substring(0, 200)}`);
  }
};
