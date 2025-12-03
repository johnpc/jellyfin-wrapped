import { useQuery } from "@tanstack/react-query";
import { listMusicVideos } from "@/lib/queries";

export function useMusicVideos() {
  return useQuery({
    queryKey: ["musicVideos"],
    queryFn: listMusicVideos,
  });
}
