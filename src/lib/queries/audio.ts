import {
  fetchAudio,
  fetchMusicVideos,
} from "../backend-api";
import { SimpleItemDto } from "./types";

export const listAudio = async (): Promise<SimpleItemDto[]> => {
  const audio = await fetchAudio();
  return audio as unknown as SimpleItemDto[];
};

export const listMusicVideos = async (): Promise<SimpleItemDto[]> => {
  const videos = await fetchMusicVideos();
  return videos as unknown as SimpleItemDto[];
};
