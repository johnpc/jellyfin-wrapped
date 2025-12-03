import { format } from "date-fns";
import { getCurrentTimeframe } from "../timeframe";
import { getAdminJellyfinApi, getEnvVar } from "../jellyfin-api";

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
  const { getAuthenticatedJellyfinApi } = await import("../jellyfin-api");
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

export const playbackReportingSqlRequest = async (
  queryString: string
): Promise<{
  colums: string[];
  results: string[][];
}> => {
  const adminApi = getAdminJellyfinApi();
  const res = await fetch(
    `${adminApi.basePath}/user_usage_stats/submit_custom_query?stamp=${Date.now()}`,
    {
      method: "POST",
      headers: {
        "X-Emby-Token": `${getEnvVar("JELLYFIN_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        CustomQueryString: queryString,
        ReplaceUserId: true,
      }),
    }
  );

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
