import { useQuery } from "@tanstack/react-query";
import { listShows } from "@/lib/queries";

export function useShows() {
  return useQuery({
    queryKey: ["shows"],
    queryFn: listShows,
    staleTime: 0,
    gcTime: 0,
  });
}
