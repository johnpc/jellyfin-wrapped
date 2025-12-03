import { useQuery } from "@tanstack/react-query";
import { listWatchedOnDate } from "@/lib/queries";

export function useWatchedOnDate(date: Date) {
  return useQuery({
    queryKey: ["watchedOnDate", date.toISOString()],
    queryFn: () => listWatchedOnDate(date),
    enabled: !!date,
  });
}
