import { useQuery } from "@tanstack/react-query";
import { listNewThisYear } from "@/lib/queries";

export function useNewThisYear() {
  return useQuery({
    queryKey: ["newThisYear"],
    queryFn: listNewThisYear,
  });
}
