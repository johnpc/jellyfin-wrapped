import {
  fetchShows,
} from "../backend-api";
import { SimpleItemDto } from "./types";

export const listShows = async (): Promise<
  {
    showName: string;
    episodeCount: number;
    playbackTime: number;
    item: SimpleItemDto;
  }[]
> => {
  const shows = await fetchShows();
  return shows as unknown as {
    showName: string;
    episodeCount: number;
    playbackTime: number;
    item: SimpleItemDto;
  }[];
};
