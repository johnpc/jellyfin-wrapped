import { useQuery } from "@tanstack/react-query";
import { getMonthlyShowStats } from "@/lib/queries";

export function useMonthlyShowStats() {
  return useQuery({
    queryKey: ["monthlyShowStats"],
    queryFn: getMonthlyShowStats,
  });
}
