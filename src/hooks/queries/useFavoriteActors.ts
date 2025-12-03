import { useQuery } from "@tanstack/react-query";
import { listFavoriteActors } from "@/lib/queries";

export function useFavoriteActors() {
  return useQuery({
    queryKey: ["favoriteActors"],
    queryFn: listFavoriteActors,
  });
}
