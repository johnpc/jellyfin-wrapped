import { useQuery } from "@tanstack/react-query";
import { getCalendarData } from "@/lib/queries";

export function useCalendar() {
  return useQuery({
    queryKey: ["calendar"],
    queryFn: getCalendarData,
  });
}
