import { format } from "date-fns";
import {
  fetchWatchedOnDate,
} from "../backend-api";
import { SimpleItemDto } from "./types";

export const listWatchedOnDate = async (
  date: Date
): Promise<SimpleItemDto[]> => {
  const dateStr = format(date, "yyyy-MM-dd");
  const items = await fetchWatchedOnDate(dateStr);
  return items as unknown as SimpleItemDto[];
};
