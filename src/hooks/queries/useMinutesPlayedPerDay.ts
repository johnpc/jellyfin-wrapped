import { useQuery } from "@tanstack/react-query";
import { getMinutesPlayedPerDay } from "@/lib/queries";

export function useMinutesPlayedPerDay() {
  return useQuery({
    queryKey: ["minutesPlayedPerDay"],
    queryFn: getMinutesPlayedPerDay,
  });
}
