import { useQuery } from "@tanstack/react-query";
import { getUnfinishedShows } from "@/lib/queries";

export function useUnfinishedShows() {
  return useQuery({
    queryKey: ["unfinishedShows"],
    queryFn: getUnfinishedShows,
  });
}
