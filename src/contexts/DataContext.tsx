import { createContext, useContext, ReactNode, useState, useEffect, useMemo } from "react";
import { useMovies } from "@/hooks/queries/useMovies";
import { useShows } from "@/hooks/queries/useShows";
import { useFavoriteActors } from "@/hooks/queries/useFavoriteActors";
import { useAudio } from "@/hooks/queries/useAudio";
import { useLiveTvChannels } from "@/hooks/queries/useLiveTvChannels";
import { useUnfinishedShows } from "@/hooks/queries/useUnfinishedShows";
import { useTopTen } from "@/hooks/queries/useTopTen";
import { useMusicVideos } from "@/hooks/queries/useMusicVideos";
import { useDeviceStats } from "@/hooks/queries/useDeviceStats";
import { useMonthlyShowStats } from "@/hooks/queries/useMonthlyShowStats";
import { usePunchCard } from "@/hooks/queries/usePunchCard";
import { useWatchedOnDate } from "@/hooks/queries/useWatchedOnDate";
import { getHolidayDates } from "@/lib/holiday-helpers";
import { subDays } from "date-fns";

// Holiday data type
type HolidayData = {
  christmas: ReturnType<typeof useWatchedOnDate>;
  christmasEve: ReturnType<typeof useWatchedOnDate>;
  halloween: ReturnType<typeof useWatchedOnDate>;
  valentines: ReturnType<typeof useWatchedOnDate>;
  hasContent: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DataContextType = {
  isLoading: boolean;
  isReady: boolean;
  topTen: ReturnType<typeof useTopTen>;
  movies: ReturnType<typeof useMovies>;
  shows: ReturnType<typeof useShows>;
  actors: ReturnType<typeof useFavoriteActors>;
  audio: ReturnType<typeof useAudio>;
  musicVideos: ReturnType<typeof useMusicVideos>;
  liveTV: ReturnType<typeof useLiveTvChannels>;
  unfinishedShows: ReturnType<typeof useUnfinishedShows>;
  deviceStats: ReturnType<typeof useDeviceStats>;
  monthlyShowStats: ReturnType<typeof useMonthlyShowStats>;
  punchCard: ReturnType<typeof usePunchCard>;
  holidays: HolidayData;
};

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  
  // Compute holiday dates once
  const holidayDates = useMemo(() => {
    const today = new Date();
    const holidays = getHolidayDates(today);
    return {
      christmas: holidays.christmas,
      christmasEve: subDays(holidays.christmas, 1),
      halloween: holidays.halloween,
      valentines: holidays.valentines,
    };
  }, []);
  
  // Fetch all data
  const topTen = useTopTen();
  const movies = useMovies();
  const shows = useShows();
  const actors = useFavoriteActors();
  const audio = useAudio();
  const musicVideos = useMusicVideos();
  const liveTV = useLiveTvChannels();
  const unfinishedShows = useUnfinishedShows();
  const deviceStats = useDeviceStats();
  const monthlyShowStats = useMonthlyShowStats();
  const punchCard = usePunchCard();
  
  // Fetch holiday data
  const christmas = useWatchedOnDate(holidayDates.christmas);
  const christmasEve = useWatchedOnDate(holidayDates.christmasEve);
  const halloween = useWatchedOnDate(holidayDates.halloween);
  const valentines = useWatchedOnDate(holidayDates.valentines);

  const isLoading =
    topTen.isLoading ||
    movies.isLoading ||
    shows.isLoading ||
    actors.isLoading ||
    audio.isLoading ||
    musicVideos.isLoading ||
    liveTV.isLoading ||
    unfinishedShows.isLoading ||
    deviceStats.isLoading ||
    monthlyShowStats.isLoading ||
    punchCard.isLoading ||
    christmas.isLoading ||
    christmasEve.isLoading ||
    halloween.isLoading ||
    valentines.isLoading;

  // Check if any holiday has content
  const holidayHasContent = 
    (christmas.data?.length ?? 0) > 0 ||
    (christmasEve.data?.length ?? 0) > 0 ||
    (halloween.data?.length ?? 0) > 0 ||
    (valentines.data?.length ?? 0) > 0;

  const holidays: HolidayData = {
    christmas,
    christmasEve,
    halloween,
    valentines,
    hasContent: holidayHasContent,
  };

  useEffect(() => {
    if (!isLoading) {
      setIsReady(true);
    }
  }, [isLoading]);

  return (
    <DataContext.Provider
      value={{
        isLoading,
        isReady,
        topTen,
        movies,
        shows,
        actors,
        audio,
        musicVideos,
        liveTV,
        unfinishedShows,
        deviceStats,
        monthlyShowStats,
        punchCard,
        holidays,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
