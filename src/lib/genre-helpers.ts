import { SimpleItemDto } from "./queries/types";

export function getTopGenre(
  movies: SimpleItemDto[],
  shows: SimpleItemDto[]
): { genre: string; items: SimpleItemDto[] } | null {
  const genreCounts = new Map<string, SimpleItemDto[]>();

  [...movies, ...shows].forEach((item: SimpleItemDto) => {
    item.genres?.forEach((genre: string) => {
      const existing = genreCounts.get(genre) || [];
      genreCounts.set(genre, [...existing, item]);
    });
  });

  let topGenre = "";
  let maxCount = 0;

  genreCounts.forEach((items: SimpleItemDto[], genre: string) => {
    if (items.length > maxCount) {
      maxCount = items.length;
      topGenre = genre;
    }
  });

  if (!topGenre) return null;

  return {
    genre: topGenre,
    items: genreCounts.get(topGenre) || [],
  };
}
