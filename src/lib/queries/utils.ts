import { format } from "date-fns";
import { getCurrentTimeframe } from "../timeframe";
import { getCurrentUser } from "../backend-api";
import { getCacheValue, setCacheValue, JELLYFIN_CURRENT_USER_CACHE_KEY } from "../cache";

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
  const cachedUserId = getCacheValue(JELLYFIN_CURRENT_USER_CACHE_KEY);
  if (cachedUserId) {
    return cachedUserId;
  }

  const user = await getCurrentUser();
  const userId = user.id ?? "";
  setCacheValue(JELLYFIN_CURRENT_USER_CACHE_KEY, userId);
  return userId;
};
