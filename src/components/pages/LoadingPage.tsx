import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { setAvailablePages, PageDataKey, getAvailablePages } from "../../lib/navigation";
import { getTopGenre } from "../../lib/genre-helpers";
import { getTopRatedContent } from "../../lib/rating-helpers";
import { getHolidayDates } from "../../lib/holiday-helpers";
import { SimpleItemDto } from "../../lib/queries/types";
import { styled } from "@stitches/react";
import { motion } from "framer-motion";
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
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

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
    !valentines.isLoading;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (allLoaded) {
      // Determine which pages have content
      const availablePages: PageDataKey[] = [];

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

      // Set the available pages
      setAvailablePages(availablePages);

      // Navigate to the first available page
      const firstPage = getAvailablePages()[0] || "/";
      void navigate(firstPage);
    }
  }, [allLoaded, topTen.data, movies.data, shows.data, actors.data, audio.data, 
      musicVideos.data, liveTV.data, unfinishedShows.data, deviceStats.data,
      monthlyShowStats.data, punchCard.data, 
      christmas.data, christmasEve.data, halloween.data, valentines.data, navigate]);

  return (
    <Container>
      {/* Background effects */}
      <BackgroundMesh />
      
      {/* Geometric patterns */}
      <GeometricLayer>
        <Ring
          as={motion.div}
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <Ring
          as={motion.div}
          style={{ width: "350px", height: "350px" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <HexGrid />
      </GeometricLayer>
      
      <OrbLayer>
        <Orb 
          as={motion.div}
          animate={{ 
            scale: [1, 1.25, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ 
            top: "30%", 
            left: "50%", 
            transform: "translateX(-50%)",
            width: "700px", 
            height: "700px", 
            background: "radial-gradient(circle, rgba(0, 240, 255, 0.1) 0%, transparent 70%)" 
          }}
        />
        <Orb 
          as={motion.div}
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ 
            top: "40%", 
            left: "30%", 
            width: "400px", 
            height: "400px", 
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)" 
          }}
        />
      </OrbLayer>
      
      <Content>
        {/* Floating emojis */}
        <EmojiContainer>
          {emojis.map((emoji, i) => (
            <FloatingEmoji
              key={i}
              as={motion.div}
              animate={{
                y: [-25, 25, -25],
                x: [0, 15, 0],
                rotate: [0, 8, -8, 0],
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeInOut",
              }}
              style={{
                left: `${8 + i * 13}%`,
              }}
            >
              {emoji}
            </FloatingEmoji>
          ))}
        </EmojiContainer>

        <MessageContainer>
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <LoadingMessage>{messages[messageIndex]}</LoadingMessage>
          </motion.div>
        </MessageContainer>

        <ProgressContainer>
          <ProgressTrack>
            <ProgressFill
              as={motion.div}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
            <ProgressGlow style={{ left: `${progress}%` }} />
          </ProgressTrack>
          
          <ProgressText>
            <span>{progress}%</span>
          </ProgressText>
        </ProgressContainer>

        {/* Animated dots */}
        <DotsContainer>
          {[0, 1, 2].map((i) => (
            <Dot
              key={i}
              as={motion.div}
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
        </DotsContainer>
      </Content>
    </Container>
  );
}

const Container = styled("div", {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
  background: "linear-gradient(180deg, #030304 0%, #08090c 50%, #030304 100%)",
});

const BackgroundMesh = styled("div", {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `
    radial-gradient(ellipse at 50% 30%, rgba(0, 240, 255, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 30% 70%, rgba(168, 85, 247, 0.04) 0%, transparent 40%),
    radial-gradient(ellipse at 70% 60%, rgba(245, 158, 11, 0.03) 0%, transparent 40%)
  `,
  pointerEvents: "none",
});

const GeometricLayer = styled("div", {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  pointerEvents: "none",
});

const Ring = styled("div", {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "280px",
  height: "280px",
  border: "1px dashed rgba(0, 240, 255, 0.08)",
  borderRadius: "50%",
});

const HexGrid = styled("div", {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='70' viewBox='0 0 60 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='rgba(0,240,255,0.015)' stroke-width='1'/%3E%3C/svg%3E")`,
  backgroundSize: "60px 70px",
  opacity: 0.6,
});

const OrbLayer = styled("div", {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: "hidden",
  pointerEvents: "none",
});

const Orb = styled("div", {
  position: "absolute",
  borderRadius: "50%",
  filter: "blur(100px)",
});

const Content = styled("div", {
  position: "relative",
  zIndex: 1,
  textAlign: "center",
  padding: "48px",
  maxWidth: "540px",
  width: "100%",
});

const EmojiContainer = styled("div", {
  position: "absolute",
  top: "-90px",
  left: 0,
  right: 0,
  height: "70px",
  pointerEvents: "none",
});

const FloatingEmoji = styled("div", {
  position: "absolute",
  fontSize: "2.25rem",
  filter: "drop-shadow(0 6px 16px rgba(0, 0, 0, 0.4))",
});

const MessageContainer = styled("div", {
  minHeight: "90px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const LoadingMessage = styled("h1", {
  fontSize: "clamp(1.85rem, 5vw, 2.75rem)",
  fontWeight: 700,
  letterSpacing: "-0.04em",
  background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 40%, #a855f7 70%, #f59e0b 100%)",
  backgroundSize: "250% 250%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "gradient-flow 5s ease infinite",
});

const ProgressContainer = styled("div", {
  marginTop: "56px",
});

const ProgressTrack = styled("div", {
  position: "relative",
  width: "100%",
  height: "8px",
  background: "rgba(255, 255, 255, 0.04)",
  borderRadius: "4px",
  overflow: "visible",
});

const ProgressFill = styled("div", {
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  background: "linear-gradient(90deg, #00f0ff, #22d3ee, #a855f7)",
  borderRadius: "4px",
  boxShadow: "0 0 30px rgba(0, 240, 255, 0.4)",
});

const ProgressGlow = styled("div", {
  position: "absolute",
  top: "50%",
  transform: "translate(-50%, -50%)",
  width: "20px",
  height: "20px",
  background: "#00f0ff",
  borderRadius: "50%",
  boxShadow: "0 0 25px rgba(0, 240, 255, 0.8), 0 0 50px rgba(0, 240, 255, 0.4)",
  transition: "left 0.35s ease-out",
});

const ProgressText = styled("div", {
  marginTop: "24px",
  fontSize: "1.75rem",
  fontWeight: 700,
  fontFamily: "'JetBrains Mono', monospace",
  color: "#00f0ff",
  textShadow: "0 0 40px rgba(0, 240, 255, 0.5)",
});

const DotsContainer = styled("div", {
  display: "flex",
  gap: "10px",
  justifyContent: "center",
  marginTop: "48px",
});

const Dot = styled("div", {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #00f0ff, #22d3ee)",
  boxShadow: "0 0 12px rgba(0, 240, 255, 0.5)",
});
