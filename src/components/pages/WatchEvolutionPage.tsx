import React from "react";
import { useWatchEvolution } from "@/hooks/queries/useWatchEvolution";
import { LoadingSpinner } from "../LoadingSpinner";
import PageContainer from "../PageContainer";
import { Container } from "@radix-ui/themes";
import { motion } from "motion/react";
import { Sparkles, TrendingUp } from "lucide-react";
import { LineChart } from "../charts/LineChart";
import { useMemo, useState, useEffect } from "react";
import { getCurrentTimeframe } from "@/lib/timeframe";

export default function WatchEvolutionPage() {
  const { data, isLoading } = useWatchEvolution();
  const timeframe = getCurrentTimeframe();
  const [chartWidth, setChartWidth] = useState(800);
  const [chartHeight, setChartHeight] = useState(400);

  useEffect(() => {
    const updateChartSize = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setChartWidth(Math.min(320, width - 40));
        setChartHeight(250);
      } else if (width < 768) {
        setChartWidth(Math.min(600, width - 60));
        setChartHeight(300);
      } else {
        setChartWidth(800);
        setChartHeight(400);
      }
    };

    updateChartSize();
    window.addEventListener("resize", updateChartSize);
    return () => window.removeEventListener("resize", updateChartSize);
  }, []);

  // Move hooks before early returns
  const chartData = useMemo(() => {
    if (!data?.monthlyData?.length) return [];
    // Filter out months with no watch time to avoid zero-dip artifacts in the chart
    const activeMonths = data.monthlyData.filter((item) => item.watchTimeMinutes > 0);
    return activeMonths.map((item, index) => {
      // Extract month from ISO date string (e.g., "2024-01-01T12:00:00.000Z" -> "2024-01")
      const monthStr = item.month.substring(0, 7);
      return {
        x: index,
        y: item.watchTimeMinutes / 60, // Convert minutes to hours
        label: monthStr,
      };
    });
  }, [data?.monthlyData]);

  // Find first and last months with valid genres (skip undefined or empty)
  const monthsWithGenres = useMemo(() => {
    if (!data?.monthlyData) return [];
    return data.monthlyData.filter((item) => item.topGenre && item.topGenre.trim() !== "");
  }, [data?.monthlyData]);

  // Only show the evolution message if we have valid genres
  const showEvolutionMessage = monthsWithGenres.length > 0;
  const firstGenre = monthsWithGenres[0]?.topGenre;
  const lastGenre = monthsWithGenres[monthsWithGenres.length - 1]?.topGenre;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!data || !data.monthlyData.length) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <Container size="4" p="4">
        <motion.div
          style={{ textAlign: "center", marginBottom: "3rem", paddingTop: "2rem" }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "10px 20px", background: "rgba(0, 240, 255, 0.06)", border: "1px solid rgba(0, 240, 255, 0.12)", borderRadius: "999px", fontSize: "0.85rem", fontWeight: 600, color: "#00f0ff", marginBottom: "1.5rem", backdropFilter: "blur(12px)" }}>
            <BadgeIcon>
              <Sparkles size={14} />
            </BadgeIcon>
            <span>Your Watch Evolution</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.25rem, 6vw, 4rem)", fontWeight: 800, marginBottom: "0.5rem", letterSpacing: "-0.04em", background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 50%, #a855f7 100%)", backgroundSize: "200% 200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "gradient-flow 8s ease infinite" }}>Watch Time Evolution</h1>
          <p style={{ fontSize: "1.15rem", color: "#94a3b8", fontWeight: 400 }}>How your viewing habits changed over time</p>
        </motion.div>

        <motion.div
          style={{ background: "rgba(18, 21, 28, 0.65)", backdropFilter: "blur(24px) saturate(180%)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "24px", padding: "2rem", marginBottom: "2rem", display: "flex", flexDirection: "column", alignItems: "center", overflow: "visible", width: "100%" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#f8fafc", marginBottom: "2rem", textAlign: "center" }}>Monthly Watch Time</h2>
          <LineChart
            data={chartData}
            width={chartWidth}
            height={chartHeight}
            xLabel="Month"
            yLabel="Hours"
            lineColor="#00f0ff"
            areaColor="rgba(0, 240, 255, 0.1)"
          />
        </motion.div>

        {showEvolutionMessage && firstGenre && lastGenre && (
          <motion.div
            style={{ background: "rgba(18, 21, 28, 0.65)", backdropFilter: "blur(24px) saturate(180%)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "24px", padding: "2rem", display: "flex", alignItems: "center", gap: "1.5rem", textAlign: "center", justifyContent: "center" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)", border: "1px solid rgba(0, 240, 255, 0.2)", color: "#00f0ff", flexShrink: 0 }}>
              <TrendingUp size={24} />
            </div>
            <p style={{ fontSize: "1.25rem", color: "#f8fafc", lineHeight: 1.6, margin: 0 }}>
              {firstGenre === lastGenre ? (
                <>
                  You started and ended {timeframe.name} with <span style={{ color: "#00f0ff", fontWeight: 700 }}>{firstGenre}</span>.{" "}
                  Talk about consistency... or maybe you just forgot to explore anything else?
                </>
              ) : (
                <>
                  You started {timeframe.name} with <span style={{ color: "#00f0ff", fontWeight: 700 }}>{firstGenre}</span>, ended with{" "}
                  <span style={{ color: "#00f0ff", fontWeight: 700 }}>{lastGenre}</span>
                </>
              )}
            </p>
          </motion.div>
        )}
      </Container>
    </PageContainer>
  );
}

const BadgeIcon = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "7px", background: "rgba(0, 240, 255, 0.15)", ...style }} {...props}>{children}</span>
);
