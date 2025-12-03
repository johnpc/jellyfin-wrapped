import { useQuery } from "@tanstack/react-query";
import { listMovies, SimpleItemDto } from "@/lib/queries";
import { getCachedHiddenIds } from "@/lib/cache";

export function useMovies() {
  return useQuery({
    queryKey: ["movies"],
    queryFn: async (): Promise<SimpleItemDto[]> => {
      const movies = await listMovies();
      const hiddenIds = getCachedHiddenIds();
      return movies.filter(
        (movie: SimpleItemDto) => !hiddenIds.includes(movie.id ?? "")
      );
    },
  });
}
