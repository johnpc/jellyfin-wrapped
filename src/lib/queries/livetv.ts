import {
  fetchLiveTv,
} from "../backend-api";

export const listLiveTvChannels = async (): Promise<
  {
    channelName: string;
    duration: number;
  }[]
> => {
  return fetchLiveTv();
};
