import { useQuery } from "@tanstack/react-query";
import { getDeviceStats } from "@/lib/queries";

export function useDeviceStats() {
  return useQuery({
    queryKey: ["deviceStats"],
    queryFn: getDeviceStats,
  });
}
