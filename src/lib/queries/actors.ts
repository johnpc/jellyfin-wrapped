import { BaseItemPerson } from "@jellyfin/sdk/lib/generated-client";
import {
  fetchActors,
} from "../backend-api";
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
  const actors = await fetchActors();
  return actors as unknown as {
    name: string;
    count: number;
    details: BaseItemPerson;
    seenInMovies: SimpleItemDto[];
    seenInShows: SimpleItemDto[];
  }[];
};
