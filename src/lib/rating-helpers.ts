import { SimpleItemDto } from "./queries/types";

export type TopContent = {
  item: SimpleItemDto;
  type: "movie" | "show";
};

export function getTopRatedContent(
  movies: SimpleItemDto[],
  shows: { item: SimpleItemDto }[]
): TopContent[] {
  // Get top rated movies (minimum rating of 8.0)
  const topMovies = movies
    .filter(
      (movie: SimpleItemDto) =>
        movie.communityRating != null && 
        movie.communityRating >= 8.0 && 
        movie.id != null
    )
    .sort(
      (a: SimpleItemDto, b: SimpleItemDto) =>
        (b.communityRating ?? 0) - (a.communityRating ?? 0)
    )
    .slice(0, 10)
    .map((movie): TopContent => ({ item: movie, type: "movie" }));

  // Get top rated shows (minimum rating of 8.0)
  const topShows = shows
    .filter(
      (show: { item: SimpleItemDto }) =>
        show.item.communityRating != null && 
        show.item.communityRating >= 8.0 && 
        show.item.id != null
    )
    .sort(
      (a: { item: SimpleItemDto }, b: { item: SimpleItemDto }) =>
        (b.item.communityRating ?? 0) - (a.item.communityRating ?? 0)
    )
    .slice(0, 10)
    .map((show): TopContent => ({ item: show.item, type: "show" }));

  // Group by type, with the larger group first
  // Each group is sorted by rating internally
  if (topMovies.length >= topShows.length) {
    return [...topMovies, ...topShows];
  } else {
    return [...topShows, ...topMovies];
  }
}
