import { SimpleItemDto } from "./queries/types";

export function getTopGenre(
  movies: SimpleItemDto[],
  shows: SimpleItemDto[]
): { genre: string; items: SimpleItemDto[]; count: number; honorableMentions: { genre: string; count: number }[] } | null {
  const genreCounts = new Map<string, SimpleItemDto[]>();

  [...movies, ...shows].forEach((item: SimpleItemDto) => {
    item.genres?.forEach((genre: string) => {
      const existing = genreCounts.get(genre) || [];
      genreCounts.set(genre, [...existing, item]);
    });
  });

  // Sort genres by count
  const sortedGenres = Array.from(genreCounts.entries())
    .sort((a, b) => b[1].length - a[1].length);

  if (sortedGenres.length === 0) return null;

  const [topGenre, topItems] = sortedGenres[0];
  const honorableMentions = sortedGenres.slice(1, 4).map(([genre, items]) => ({
    genre,
    count: items.length,
  }));

  return {
    genre: topGenre,
    items: topItems,
    count: topItems.length,
    honorableMentions,
  };
}
