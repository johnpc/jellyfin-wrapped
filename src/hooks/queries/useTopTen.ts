import { useQuery } from "@tanstack/react-query";
import { listMovies, listShows } from "@/lib/queries";

export const useTopTen = () => {
  return useQuery({
    queryKey: ["topTen"],
    queryFn: async () => {
      const [movies, shows] = await Promise.all([listMovies(), listShows()]);
      return {
        movies: movies.slice(0, 10),
        shows: shows.slice(0, 10),
      };
    },
  });
};
