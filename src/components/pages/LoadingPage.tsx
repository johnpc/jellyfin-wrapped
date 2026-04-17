import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useMovies } from "../../hooks/queries/useMovies";
import { useShows } from "../../hooks/queries/useShows";
import { useFavoriteActors } from "../../hooks/queries/useFavoriteActors";
import { useAudio } from "../../hooks/queries/useAudio";
import { useLiveTvChannels } from "../../hooks/queries/useLiveTvChannels";
import { useUnfinishedShows } from "../../hooks/queries/useUnfinishedShows";
import { useTopTen } from "../../hooks/queries/useTopTen";
import { useMusicVideos } from "../../hooks/queries/useMusicVideos";
import { useDeviceStats } from "../../hooks/queries/useDeviceStats";
import { useMonthlyShowStats } from "../../hooks/queries/useMonthlyShowStats";
import { usePunchCard } from "../../hooks/queries/usePunchCard";
import { useWatchedOnDate } from "../../hooks/queries/useWatchedOnDate";
import { useStreaks } from "../../hooks/queries/useStreaks";
import { usePersonality } from "../../hooks/queries/usePersonality";
import { useDecades } from "../../hooks/queries/useDecades";
import { useWatchEvolution } from "../../hooks/queries/useWatchEvolution";
import { useTimePersonality } from "../../hooks/queries/useTimePersonality";
import { useComparisons } from "../../hooks/queries/useComparisons";
import { setAvailablePages, PageDataKey, getAvailablePages } from "../../lib/navigation";
import { getTopGenre } from "../../lib/genre-helpers";
import { getTopRatedContent } from "../../lib/rating-helpers";
import { getHolidayDates } from "../../lib/holiday-helpers";
import { SimpleItemDto } from "../../lib/queries/types";
import { motion } from "motion/react";
import { subDays } from "date-fns";

const messages = [
  "Scanning your library...",
  "Counting those binge sessions...",
  "Finding your favorites...",
  "Calculating watch time...",
  "Analyzing viewing patterns...",
  "Preparing your wrapped...",
  "Almost ready...",
];

const emojis = ["🎬", "📺", "🎵", "⭐", "🎭", "🎪", "✨"];

export function LoadingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const hasNavigated = useRef(false);

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

  // Invalidate and refetch all queries on mount to force data loading
  useEffect(() => {
    void queryClient.invalidateQueries();
    // Explicitly refetch all queries to ensure they run
    void queryClient.refetchQueries();
  }, [queryClient]);

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

  // Fetch new features data
  const streaks = useStreaks();
  const personality = usePersonality();
  const decades = useDecades();
  const watchEvolution = useWatchEvolution();
  const timePersonality = useTimePersonality();
  const comparisons = useComparisons();

  const allLoaded =
    !topTen.isLoading &&
    !movies.isLoading &&
    !shows.isLoading &&
    !actors.isLoading &&
    !audio.isLoading &&
    !musicVideos.isLoading &&
    !liveTV.isLoading &&
    !unfinishedShows.isLoading &&
    !deviceStats.isLoading &&
    !monthlyShowStats.isLoading &&
    !punchCard.isLoading &&
    !christmas.isLoading &&
    !christmasEve.isLoading &&
    !halloween.isLoading &&
    !valentines.isLoading &&
    !streaks.isLoading &&
    !personality.isLoading &&
    !decades.isLoading &&
    !watchEvolution.isLoading &&
    !timePersonality.isLoading &&
    !comparisons.isLoading;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        // If data is loaded and we're not at 100%, quickly move to 100%
        if (allLoaded) {
          if (prev >= 100) return 100;
          // Quickly animate to 100%
          return Math.min(prev + 10, 100);
        }

        // Normal progress behavior
        if (prev >= 99) return 99; // Cap at 99% until all data is loaded
        if (prev < 90) {
          // Quickly move to 90%
          return prev + 3;
        } else {
          // Slowly move from 90% to 99%
          return prev + 0.5;
        }
      });
    }, 200); // Faster interval for smoother animation

    return () => clearInterval(interval);
  }, [allLoaded]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // When all data is loaded, set progress to 100% and then navigate
  useEffect(() => {
    if (allLoaded && !hasNavigated.current) {
      // Set progress to 100%
      setProgress(100);

      // Wait a brief moment to show 100%, then navigate
      const timer = setTimeout(() => {
        // Get redirect URL from query params (read it here to ensure we get the latest value)
        const redirectUrl = searchParams.get("redirect");

        // Determine which pages have content
      const availablePages: PageDataKey[] = [];

      // Always include total time page first (if we have movies or shows)
      if ((movies.data?.length ?? 0) > 0 || (shows.data?.length ?? 0) > 0) {
        availablePages.push("totalTime");
      }

      // Streaks - if we have calendar data
      if (streaks.data && (streaks.data.longestStreak > 0 || streaks.data.currentStreak > 0)) {
        availablePages.push("streaks");
      }

      // Personality - if we have data
      if (personality.data) {
        availablePages.push("personality");
      }

      // TopTen - has content if there are movies or shows
      if ((topTen.data?.movies?.length ?? 0) > 0 || (topTen.data?.shows?.length ?? 0) > 0) {
        availablePages.push("topTen");
      }

      // Movies
      if ((movies.data?.length ?? 0) > 0) {
        availablePages.push("movies");
      }

      // Shows
      if ((shows.data?.length ?? 0) > 0) {
        availablePages.push("shows");
      }

      // Decades - if we have data
      if (decades.data && decades.data.periodBreakdown.length > 0) {
        availablePages.push("decades");
      }

      // Watch Evolution - if we have data
      if (watchEvolution.data && watchEvolution.data.monthlyData.length > 0) {
        availablePages.push("watchEvolution");
      }

      // Audio/Music
      if ((audio.data?.length ?? 0) > 0) {
        availablePages.push("audio");
      }

      // Music Videos
      if ((musicVideos.data?.length ?? 0) > 0) {
        availablePages.push("musicVideos");
      }

      // Favorite Actors
      if ((actors.data?.length ?? 0) > 0) {
        availablePages.push("actors");
      }

      // Genres - check if we have genre data from movies/shows
      const showItems: SimpleItemDto[] = shows.data?.map((s: { item: SimpleItemDto }) => s.item) ?? [];
      const topGenre = getTopGenre(movies.data ?? [], showItems);
      if (topGenre) {
        availablePages.push("genres");
      }

      // Live TV
      if ((liveTV.data?.length ?? 0) > 0) {
        availablePages.push("liveTv");
      }

      // Critically Acclaimed - check if there's rated content
      const topRated = getTopRatedContent(movies.data ?? [], shows.data ?? []);
      if (topRated.length > 0) {
        availablePages.push("criticallyAcclaimed");
      }

      // Oldest Movie - if we have movies with dates
      const moviesWithDates = movies.data?.filter((m: { date?: string | null }) => m.date) ?? [];
      if (moviesWithDates.length > 0) {
        availablePages.push("oldestMovie");
      }

      // Oldest Show - if we have shows with dates
      const showsWithDates = shows.data?.filter((s: { item: { date?: string | null } }) => s.item.date) ?? [];
      if (showsWithDates.length > 0) {
        availablePages.push("oldestShow");
      }

      // Holidays - check if any holiday has content
      const hasHolidayContent =
        (christmas.data?.length ?? 0) > 0 ||
        (christmasEve.data?.length ?? 0) > 0 ||
        (halloween.data?.length ?? 0) > 0 ||
        (valentines.data?.length ?? 0) > 0;
      if (hasHolidayContent) {
        availablePages.push("holidays");
      }

      // Show of the Month
      if ((monthlyShowStats.data?.length ?? 0) > 0) {
        availablePages.push("showOfTheMonth");
      }

      // Unfinished Shows
      if ((unfinishedShows.data?.length ?? 0) > 0) {
        availablePages.push("unfinishedShows");
      }

      // Device Stats
      if (deviceStats.data && (
        deviceStats.data.deviceUsage?.length > 0 ||
        deviceStats.data.browserUsage?.length > 0 ||
        deviceStats.data.osUsage?.length > 0
      )) {
        availablePages.push("deviceStats");
      }

      // Punch Card / Activity Calendar
      if ((punchCard.data?.length ?? 0) > 0) {
        availablePages.push("punchCard");
      }

      // Share page - always available if we have any data
      if (
        (movies.data?.length ?? 0) > 0 ||
        (shows.data?.length ?? 0) > 0 ||
        personality.data ||
        topTen.data
      ) {
        availablePages.push("share");
      }

      // Set the available pages
      setAvailablePages(availablePages);

      // Determine where to navigate
      let targetPage = "/";

      if (redirectUrl && redirectUrl !== "/loading") {
        // Use the provided redirect URL if it's not /loading
        targetPage = redirectUrl;
      } else {
        // Otherwise use the first available page
        const firstPage = getAvailablePages()[0];
        if (firstPage) {
          // Convert page key to route path
          const pageToRoute: Record<string, string> = {
            totalTime: "/total-time",
            streaks: "/streaks",
            personality: "/personality",
            topTen: "/TopTen",
            movies: "/movies",
            shows: "/shows",
            decades: "/decades",
            watchEvolution: "/watch-evolution",
            audio: "/audio",
            musicVideos: "/music-videos",
            actors: "/actors",
            genres: "/genres",
            liveTv: "/tv",
            criticallyAcclaimed: "/critically-acclaimed",
            oldestMovie: "/oldest-movie",
            oldestShow: "/oldest-show",
            holidays: "/holidays",
            showOfTheMonth: "/show-of-the-month",
            unfinishedShows: "/unfinished-shows",
            deviceStats: "/device-stats",
            punchCard: "/punch-card",
            share: "/share",
          };
          targetPage = pageToRoute[firstPage] || "/total-time";
        } else {
          targetPage = "/total-time";
        }
      }

      // Never redirect back to /loading
      if (targetPage === "/loading") {
        targetPage = "/total-time";
      }

        // Mark that we've navigated to prevent multiple navigations
        hasNavigated.current = true;

        // Mark that we've completed the loading cycle to prevent redirect loops
        sessionStorage.setItem("hasCompletedLoading", "true");
        void navigate(targetPage);
      }, 500); // Wait 500ms to show 100% before navigating

      return () => clearTimeout(timer);
    }
  }, [allLoaded, topTen.data, movies.data, shows.data, actors.data, audio.data,
      musicVideos.data, liveTV.data, unfinishedShows.data, deviceStats.data,
      monthlyShowStats.data, punchCard.data,
      christmas.data, christmasEve.data, halloween.data, valentines.data,
      streaks.data, personality.data, decades.data, watchEvolution.data, navigate, searchParams]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", background: "linear-gradient(180deg, #030304 0%, #08090c 50%, #030304 100%)" }}>
      {/* Background effects */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "radial-gradient(ellipse at 50% 30%, rgba(0, 240, 255, 0.06) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, rgba(168, 85, 247, 0.04) 0%, transparent 40%), radial-gradient(ellipse at 70% 60%, rgba(245, 158, 11, 0.03) 0%, transparent 40%)", pointerEvents: "none" }} />

      {/* Geometric patterns */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "220px",
            height: "220px",
            border: "1px dashed rgba(0, 240, 255, 0.08)",
            borderRadius: "50%",
            animation: "spin 25s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "350px",
            height: "350px",
            border: "1px dashed rgba(0, 240, 255, 0.08)",
            borderRadius: "50%",
            animation: "spin-reverse 30s linear infinite",
          }}
        />
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='70' viewBox='0 0 60 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='rgba(0,240,255,0.015)' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: "60px 70px", opacity: 0.6 }} />
      </div>

      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "50%",
            transform: "translateX(-50%) translateZ(0)",
            WebkitTransform: "translateX(-50%) translateZ(0)",
            width: "700px",
            height: "700px",
            background: "radial-gradient(circle, rgba(0, 240, 255, 0.1) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(100px)",
            animation: "pulse-scale 5s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "30%",
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)",
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)",
            borderRadius: "50%",
            filter: "blur(100px)",
            animation: "pulse-scale 7s ease-in-out infinite 1s",
          }}
        />
      </div>

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "48px", maxWidth: "540px", width: "100%" }}>
        {/* Floating emojis */}
        <div style={{ position: "absolute", top: "-90px", left: 0, right: 0, height: "70px", pointerEvents: "none" }}>
          {emojis.map((emoji, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                fontSize: "2.25rem",
                filter: "drop-shadow(0 6px 16px rgba(0, 0, 0, 0.4))",
                left: `${8 + i * 13}%`,
                animation: `float-emoji ${5 + i}s ease-in-out infinite ${i * 0.4}s`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>

        <div style={{ minHeight: "90px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const }}
          >
            <h1 style={{ fontSize: "clamp(1.85rem, 5vw, 2.75rem)", fontWeight: 700, letterSpacing: "-0.04em", background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 40%, #a855f7 70%, #f59e0b 100%)", backgroundSize: "250% 250%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "gradient-flow 5s ease infinite" }}>
              {messages[messageIndex]}
            </h1>
          </motion.div>
        </div>

        <div style={{ marginTop: "56px" }}>
          <div style={{ position: "relative", width: "100%", height: "8px", background: "rgba(255, 255, 255, 0.04)", borderRadius: "4px", overflow: "visible" }}>
            <motion.div
              style={{ position: "absolute", top: 0, left: 0, height: "100%", background: "linear-gradient(90deg, #00f0ff, #22d3ee, #a855f7)", borderRadius: "4px", boxShadow: "0 0 30px rgba(0, 240, 255, 0.4)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
            <div style={{ position: "absolute", top: "50%", transform: "translate(-50%, -50%)", width: "20px", height: "20px", background: "#00f0ff", borderRadius: "50%", boxShadow: "0 0 25px rgba(0, 240, 255, 0.8), 0 0 50px rgba(0, 240, 255, 0.4)", transition: "left 0.35s ease-out", left: `${progress}%` }} />
          </div>

          <div style={{ marginTop: "24px", fontSize: "1.75rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#00f0ff", textShadow: "0 0 40px rgba(0, 240, 255, 0.5)" }}>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Animated dots */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "48px" }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              style={{ width: "10px", height: "10px", borderRadius: "50%", background: "linear-gradient(135deg, #00f0ff, #22d3ee)", boxShadow: "0 0 12px rgba(0, 240, 255, 0.5)" }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
