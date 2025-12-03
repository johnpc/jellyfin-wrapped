import { useQuery } from "@tanstack/react-query";
import { listAudio } from "@/lib/queries";

export function useAudio() {
  return useQuery({
    queryKey: ["audio"],
    queryFn: listAudio,
  });
}
