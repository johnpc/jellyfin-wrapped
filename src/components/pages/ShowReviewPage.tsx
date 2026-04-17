import { Container } from "@radix-ui/themes";
import { motion } from "motion/react";
import { useData } from "@/contexts/DataContext";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { LoadingSpinner } from "../LoadingSpinner";
import { CenteredGrid } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import PageContainer from "../PageContainer";

export default function ShowReviewPage() {
  const { shows, isLoading } = useData();
  const { data: showsData } = shows;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const visibleShows = showsData ?? [];

  if (!visibleShows.length) {
    return <LoadingSpinner />;
  }

  // Calculate total episodes watched
  const totalEpisodes = visibleShows.reduce(
    (sum: number, show: { episodeCount?: number }) => sum + (show.episodeCount || 0),
    0
  );

  // Fun messages based on show count and episodes
  const getShowMessage = (showCount: number, episodes: number): string => {
    if (episodes >= 500) return `Over ${episodes} episodes across ${showCount} shows. That's some serious binge-watching! 📺`;
    if (episodes >= 200) return `${episodes} episodes? You've basically watched a whole network!`;
    if (showCount >= 20) return `${showCount} shows and ${episodes} episodes. You're a serial binge-watcher!`;
    if (showCount >= 10) return "Double-digit shows! Your watchlist is impressive.";
    return "Every show tells a story. Here's yours!";
  };

  return (
    <PageContainer>
      <Container size="4" p="4">
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(1.5rem, 3vw, 2rem)" }}>
          <div style={{ textAlign: "center" }}>
            <motion.h1 variants={itemVariants} style={{
              fontSize: "clamp(2.75rem, 8vw, 5.5rem)",
              fontWeight: 800,
              marginBottom: "1.75rem",
              lineHeight: 0.95,
              letterSpacing: "-0.05em",
              background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 35%, #a855f7 55%, #f59e0b 80%, #f43f5e 100%)",
              backgroundSize: "250% 250%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradient-flow 8s ease infinite",
              filter: "drop-shadow(0 0 50px rgba(0, 240, 255, 0.25))",
            }}>
              You Watched {visibleShows.length} Shows
            </motion.h1>
            <p style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)", color: "#94a3b8", marginTop: "0.5rem" }}>
              {getShowMessage(visibleShows.length, totalEpisodes)}
            </p>
          </div>

          <CenteredGrid>
            {visibleShows
              .slice(0, 20)
              .map(
                (show: {
                  item: { id?: string };
                  episodeCount: number;
                  playbackTime: number;
                }) => (
                  <MovieCard
                    key={show.item.id}
                    item={show.item}
                    episodeCount={show.episodeCount}
                    playbackTime={show.playbackTime}
                  />
                )
              )}
          </CenteredGrid>
        </div>
      </Container>
    </PageContainer>
  );
}
