import React from "react";
import { useStreaks } from "@/hooks/queries/useStreaks";
import { LoadingSpinner } from "../LoadingSpinner";
import PageContainer from "../PageContainer";
import { motion } from "motion/react";
import { Flame, Calendar, Clock, Sparkles } from "lucide-react";

export default function StreaksPage() {
  const { data, isLoading } = useStreaks();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <motion.div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 8rem)",
          textAlign: "center",
          padding: "0.75rem 1rem 0.25rem 1rem",
          width: "100%",
          maxWidth: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }}
      >
        <motion.div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 20px",
            background: "rgba(0, 240, 255, 0.06)",
            border: "1px solid rgba(0, 240, 255, 0.12)",
            borderRadius: "999px",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "#00f0ff",
            marginBottom: "1rem",
            backdropFilter: "blur(12px)",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <BadgeIcon>
            <Sparkles size={14} />
          </BadgeIcon>
          <span>Your Binge Streaks</span>
        </motion.div>

        <motion.h1
          style={{
            fontSize: "clamp(2rem, 6vw, 3.5rem)",
            fontWeight: 700,
            marginBottom: "1.5rem",
            letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 50%, #a855f7 100%)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "gradient-flow 8s ease infinite",
            textAlign: "center",
            width: "100%",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          Your Viewing Streaks
        </motion.h1>

        <StatsGrid>
          <motion.div
            style={{
              background: "rgba(18, 21, 28, 0.65)",
              backdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "24px",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              transition: "all 0.3s ease",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <StatIcon>
              <Flame size={24} />
            </StatIcon>
            <StatValue>{data.longestStreak}</StatValue>
            <StatLabel>Longest Streak</StatLabel>
            <StatSubtext>consecutive days</StatSubtext>
          </motion.div>

          <motion.div
            style={{
              background: "rgba(18, 21, 28, 0.65)",
              backdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "24px",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              transition: "all 0.3s ease",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <StatIcon>
              <Clock size={24} />
            </StatIcon>
            <StatValue>{data.currentStreak}</StatValue>
            <StatLabel>Current Streak</StatLabel>
            <StatSubtext>
              {data.streakStartDate
                ? `since ${new Date(data.streakStartDate).toLocaleDateString()}`
                : "days in a row"}
            </StatSubtext>
          </motion.div>

          <motion.div
            style={{
              background: "rgba(18, 21, 28, 0.65)",
              backdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "24px",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              transition: "all 0.3s ease",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <StatIcon>
              <Calendar size={24} />
            </StatIcon>
            <StatValue>{data.longestBreak}</StatValue>
            <StatLabel>Longest Break</StatLabel>
            <StatSubtext>days without watching</StatSubtext>
          </motion.div>
        </StatsGrid>

        <motion.p
          style={{
            fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
            fontWeight: 500,
            color: "#f8fafc",
            maxWidth: "600px",
            lineHeight: 1.6,
            marginTop: "0.5rem",
            marginBottom: "0.5rem",
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "center",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.4 }}
        >
          {data.currentStreak > 0
            ? `You're on a ${data.currentStreak}-day streak! Keep it going! 🔥`
            : data.longestStreak > 0
            ? `Your longest binge streak was ${data.longestStreak} days. Impressive!`
            : "Start your first streak today!"}
        </motion.p>
      </motion.div>
    </PageContainer>
  );
}

const BadgeIcon = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "24px",
      height: "24px",
      borderRadius: "7px",
      background: "rgba(0, 240, 255, 0.15)",
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);

const StatsGrid = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "1.5rem",
      width: "100%",
      maxWidth: "900px",
      marginBottom: "1rem",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const StatIcon = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "64px",
      height: "64px",
      borderRadius: "16px",
      background: "linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)",
      border: "1px solid rgba(0, 240, 255, 0.2)",
      color: "#00f0ff",
      backdropFilter: "blur(12px)",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const StatValue = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      fontSize: "3rem",
      fontWeight: 800,
      fontFamily: "'JetBrains Mono', monospace",
      color: "#00f0ff",
      textShadow: "0 0 40px rgba(0, 240, 255, 0.5)",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const StatLabel = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      fontSize: "1.1rem",
      fontWeight: 600,
      color: "#f8fafc",
      marginTop: "0.5rem",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const StatSubtext = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      fontSize: "0.85rem",
      color: "#64748b",
      textAlign: "center",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);
