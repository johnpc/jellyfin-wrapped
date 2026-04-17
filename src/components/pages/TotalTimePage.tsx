import { useMemo } from "react";
import { useData } from "@/contexts/DataContext";
import { useComparisons } from "@/hooks/queries/useComparisons";
import { LoadingSpinner } from "../LoadingSpinner";
import PageContainer from "../PageContainer";
import { motion } from "motion/react";
import { formatWatchTime } from "@/lib/time-helpers";
import { getCurrentTimeframe } from "@/lib/timeframe";

// Fun messages based on total watch time
function getWatchTimeMessage(totalMinutes: number): { message: string; emoji: string } {
  const totalHours = totalMinutes / 60;
  const totalDays = totalHours / 24;

  if (totalDays >= 365) {
    return {
      message: "You've watched over a YEAR of content. That's dedication! 🎬",
      emoji: "🏆"
    };
  } else if (totalDays >= 180) {
    return {
      message: "Half a year of watching? You're a true cinephile!",
      emoji: "🎭"
    };
  } else if (totalDays >= 90) {
    return {
      message: "A quarter of a year spent in front of the screen. Impressive!",
      emoji: "⭐"
    };
  } else if (totalDays >= 30) {
    return {
      message: "A full month of entertainment! That's what we call commitment.",
      emoji: "📺"
    };
  } else if (totalDays >= 7) {
    return {
      message: "A whole week of content! You've been busy.",
      emoji: "🎪"
    };
  } else if (totalHours >= 24) {
    return {
      message: "A full day of watching! Time well spent.",
      emoji: "🎬"
    };
  } else if (totalHours >= 12) {
    return {
      message: "Half a day of entertainment. Nice start!",
      emoji: "✨"
    };
  } else {
    return {
      message: "Every minute counts! Your entertainment journey begins.",
      emoji: "✨"
    };
  }
}

export default function TotalTimePage() {
  const { movies, shows, isLoading } = useData();
  const { data: comparisons, isLoading: comparisonsLoading } = useComparisons();
  const timeframe = getCurrentTimeframe();

  const totalWatchTime = useMemo(() => {
    if (isLoading || !movies.data || !shows.data) return 0;

    // Calculate total from movies (totalWatchTimeSeconds)
    const movieTime = (movies.data as Array<{ totalWatchTimeSeconds?: number }>)
      .reduce((sum, movie) => sum + (movie.totalWatchTimeSeconds || 0), 0);

    // Calculate total from shows (playbackTime is in seconds)
    const showTime = (shows.data as Array<{ playbackTime?: number }>)
      .reduce((sum, show) => sum + (show.playbackTime || 0), 0);

    // Convert to minutes
    return (movieTime + showTime) / 60;
  }, [movies.data, shows.data, isLoading]);

  if (isLoading || comparisonsLoading) {
    return <LoadingSpinner />;
  }

  const { message } = getWatchTimeMessage(totalWatchTime);
  const totalHours = totalWatchTime / 60;
  const totalDays = totalHours / 24;

  return (
    <PageContainer>
      <motion.div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 8rem)", textAlign: "center", padding: "0.75rem 1rem 0.25rem 1rem", width: "100%", maxWidth: "100%", margin: "0 auto", boxSizing: "border-box" }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }}
      >
          <motion.div
            style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "10px 20px", background: "rgba(0, 240, 255, 0.06)", border: "1px solid rgba(0, 240, 255, 0.12)", borderRadius: "999px", fontSize: "0.85rem", fontWeight: 600, color: "#00f0ff", marginBottom: "1rem", backdropFilter: "blur(12px)" }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span>{timeframe.name} in Review</span>
          </motion.div>

          <motion.h1
            style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", fontWeight: 700, marginBottom: "1rem", letterSpacing: "-0.04em", background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 50%, #a855f7 100%)", backgroundSize: "200% 200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "gradient-flow 8s ease infinite", textAlign: "center", width: "100%" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            You Watched
          </motion.h1>

          <motion.div
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1.5rem", marginBottom: "1rem", flexWrap: "wrap", width: "100%", maxWidth: "100%" }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }}
          >
            <div style={{ fontSize: "clamp(3rem, 10vw, 6rem)", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#00f0ff", textShadow: "0 0 60px rgba(0, 240, 255, 0.5), 0 0 120px rgba(0, 240, 255, 0.3)", letterSpacing: "-0.02em", textAlign: "center", lineHeight: 1.2 }}>
              {formatWatchTime(totalWatchTime)}
            </div>
          </motion.div>

          {totalDays >= 1 && (
            <motion.div
              style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "1rem", padding: "1rem 1.5rem", background: "rgba(18, 21, 28, 0.5)", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.05)", backdropFilter: "blur(12px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#00f0ff" }}>{Math.round(totalDays)}</div>
                <div style={{ fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Days</div>
              </div>
              <div style={{ width: "1px", height: "40px", background: "rgba(255, 255, 255, 0.1)" }} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#00f0ff" }}>{Math.round(totalHours)}</div>
                <div style={{ fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Hours</div>
              </div>
              <div style={{ width: "1px", height: "40px", background: "rgba(255, 255, 255, 0.1)" }} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#00f0ff" }}>{Math.round(totalWatchTime)}</div>
                <div style={{ fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Minutes</div>
              </div>
            </motion.div>
          )}

          <motion.p
            style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 500, color: "#f8fafc", maxWidth: "600px", lineHeight: 1.6, marginBottom: "1rem", marginLeft: "auto", marginRight: "auto", textAlign: "center" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            {message}
          </motion.p>

          {comparisons && comparisons.comparisons.length > 0 && (
            <motion.div
              style={{ width: "100%", maxWidth: "900px", marginTop: "1rem", marginBottom: "0.5rem" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                {comparisons.comparisons.map((comparison, index) => (
                  <motion.div
                    key={index}
                    style={{ background: "rgba(18, 21, 28, 0.5)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "16px", padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.5rem", transition: "all 0.3s ease" }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.7 + index * 0.1, duration: 0.4 }}
                  >
                    <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.5rem" }}>{comparison.label}</div>
                    <div style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#00f0ff", textShadow: "0 0 30px rgba(0, 240, 255, 0.4)" }}>{comparison.value}</div>
                    <div style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500 }}>{comparison.unit}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
    </PageContainer>
  );
}
