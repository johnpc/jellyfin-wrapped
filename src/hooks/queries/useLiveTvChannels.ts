import { useQuery } from "@tanstack/react-query";
import { listLiveTvChannels } from "@/lib/queries";

export function useLiveTvChannels() {
  return useQuery({
    queryKey: ["liveTvChannels"],
    queryFn: listLiveTvChannels,
  });
}
