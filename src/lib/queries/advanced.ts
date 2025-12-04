import {
  fetchMonthlyShows,
  fetchUnfinishedShows,
  MonthlyShowStats as BackendMonthlyShowStats,
  UnfinishedShow as BackendUnfinishedShow,
} from "../backend-api";
import { SimpleItemDto, UnfinishedShowDto } from "./types";

export const getMonthlyShowStats = async (): Promise<
  {
    month: Date;
    topShow: {
      item: SimpleItemDto;
      watchTimeMinutes: number;
    };
    totalWatchTimeMinutes: number;
  }[]
> => {
  const stats = await fetchMonthlyShows();
  return stats.map((stat: BackendMonthlyShowStats) => ({
    month: new Date(stat.month),
    topShow: {
      item: stat.topShow.item as unknown as SimpleItemDto,
      watchTimeMinutes: stat.topShow.watchTimeMinutes,
    },
    totalWatchTimeMinutes: stat.totalWatchTimeMinutes,
  }));
};

export async function getUnfinishedShows(): Promise<UnfinishedShowDto[]> {
  const shows = await fetchUnfinishedShows();
  return shows.map((show: BackendUnfinishedShow) => ({
    item: show.item as unknown as SimpleItemDto,
    watchedEpisodes: show.watchedEpisodes,
    totalEpisodes: show.totalEpisodes,
    lastWatchedDate: new Date(show.lastWatchedDate),
  }));
}
