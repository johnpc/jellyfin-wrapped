import { useQuery } from "@tanstack/react-query";
import { getPunchCardData } from "@/lib/queries";

export function usePunchCard() {
  return useQuery({
    queryKey: ["punchCard"],
    queryFn: getPunchCardData,
  });
}
