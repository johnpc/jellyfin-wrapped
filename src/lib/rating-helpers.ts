import { SimpleItemDto } from "./queries/types";

export type TopContent = {
  item: SimpleItemDto;
  type: "movie" | "show";
};

export function getTopRatedContent(
  movies: SimpleItemDto[],
  shows: { item: SimpleItemDto }[]
): TopContent[] {
  const topMovie = movies
    .filter(
      (movie: SimpleItemDto) =>
        movie.communityRating != null && movie.id != null
    )
    .sort(
      (a: SimpleItemDto, b: SimpleItemDto) =>
        (b.communityRating ?? 0) - (a.communityRating ?? 0)
    )[0];

  const topShow = shows
    .filter(
      (show: { item: SimpleItemDto }) =>
        show.item.communityRating != null && show.item.id != null
    )
    .sort(
      (a: { item: SimpleItemDto }, b: { item: SimpleItemDto }) =>
        (b.item.communityRating ?? 0) - (a.item.communityRating ?? 0)
    )[0];

  const result: TopContent[] = [];

  if (topMovie) {
    result.push({ item: topMovie, type: "movie" });
  }

  if (topShow) {
    result.push({ item: topShow.item, type: "show" });
  }

  return result;
}
