import {
  fetchMovies,
} from "../backend-api";
import { SimpleItemDto } from "./types";

export type MovieWithStats = SimpleItemDto & {
  playCount: number;
  completedWatches: number;
  totalWatchTimeSeconds: number;
};

export const listMovies = async (): Promise<MovieWithStats[]> => {
  const movies = await fetchMovies();
  return movies as unknown as MovieWithStats[];
};
