import { BaseItemPerson } from "@jellyfin/sdk/lib/generated-client";
import { listMovies } from "./movies";
import { listShows } from "./shows";
import { SimpleItemDto } from "./types";

export const listFavoriteActors = async (): Promise<
  {
    name: string;
    count: number;
    details: BaseItemPerson;
    seenInMovies: SimpleItemDto[];
    seenInShows: SimpleItemDto[];
  }[]
> => {
  const movies = await listMovies();
  const shows = await listShows();
  const people = [
    ...shows.flatMap((show: { item: SimpleItemDto }) => show.item.people),
    movies.flatMap((movie: SimpleItemDto) => movie.people),
  ].flat();

  const counts = people.reduce(
    (acc: Map<string, number>, person: BaseItemPerson | null | undefined) => {
      if (!person?.Name) return acc;

      const name: string = person.Name;
      acc.set(name, (acc.get(name) || 0) + 1);
      return acc;
    },
    new Map()
  );

  const peopleWithCounts = Array.from(counts.entries()).map(([name]) => {
    const movieCount = movies.reduce(
      (acc: number, movie: SimpleItemDto) =>
        acc +
        (movie.people?.some(
          (person: BaseItemPerson | null | undefined) => person?.Name === name
        )
          ? 1
          : 0),
      0
    );

    const showCount = shows.reduce(
      (acc: number, show: { item: SimpleItemDto }) =>
        acc +
        (show.item.people?.some(
          (person: BaseItemPerson | null | undefined) => person?.Name === name
        )
          ? 1
          : 0),
      0
    );

    return {
      name: name as string,
      count: movieCount + showCount,
      details: people.find(
        (p: BaseItemPerson | null | undefined) => p?.Name === name
      ),
      seenInMovies: movies.filter((movie: SimpleItemDto) =>
        movie.people?.some(
          (person: BaseItemPerson | null | undefined) => person?.Name === name
        )
      ),
      seenInShows: shows
        .filter((show: { item: SimpleItemDto }) =>
          show.item.people?.some(
            (person: BaseItemPerson | null | undefined) => person?.Name === name
          )
        )
        .map((s: { item: SimpleItemDto }) => s.item),
    };
  });

  peopleWithCounts.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.name.localeCompare(b.name);
  });

  return peopleWithCounts
    .filter((p) => p.details)
    .filter((p) => p.count > 1) as {
    name: string;
    count: number;
    details: BaseItemPerson;
    seenInMovies: SimpleItemDto[];
    seenInShows: SimpleItemDto[];
  }[];
};
