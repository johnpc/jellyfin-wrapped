import { useQuery } from "@tanstack/react-query";
import { getFirstWatched } from "@/lib/queries";

export function useFirstWatched() {
  return useQuery({
    queryKey: ["firstWatched"],
    queryFn: getFirstWatched,
  });
}
