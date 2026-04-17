import { Container } from "@radix-ui/themes";
import { motion } from "motion/react";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { CenteredGrid } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { generateGuid } from "@/lib/utils";
import { getTopGenre } from "@/lib/genre-helpers";
import PageContainer from "../PageContainer";
import { getCurrentTimeframe } from "@/lib/timeframe";

export default function GenreReviewPage() {
  const { movies, shows, isLoading } = useData();
  const { data: moviesData } = movies;
  const { data: showsData } = shows;
  const timeframe = getCurrentTimeframe();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const visibleMovies = moviesData ?? [];
  const visibleShows = showsData?.map((show: { item: { id?: string } }) => show.item) ?? [];
  const topGenreData = getTopGenre(visibleMovies, visibleShows);

  if (!topGenreData) {
    return <LoadingSpinner />;
  }

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
              Your Top Genre: {topGenreData.genre}
            </motion.h1>
            <p style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)", color: "#94a3b8", marginTop: "0.5rem" }}>
              The genre you watched most in {timeframe.name}
            </p>
            <p style={{ fontSize: "clamp(1.25rem, 3vw, 1.5rem)", color: "#00f0ff", marginTop: "0.5rem", fontWeight: 600 }}>
              {topGenreData.count} items watched
            </p>
          </div>

          <CenteredGrid>
            {topGenreData.items.slice(0, 20).map((item: { id?: string }) => (
              <MovieCard key={generateGuid()} item={item} />
            ))}
          </CenteredGrid>

          {topGenreData.honorableMentions.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <h2 style={{ fontSize: "clamp(1.25rem, 3vw, 1.5rem)", fontWeight: "bold", color: "#f8fafc", marginBottom: "1rem" }}>
                Honorable Mentions
              </h2>
              <div style={{ display: "flex", justifyContent: "center", gap: "clamp(1rem, 2vw, 2rem)", flexWrap: "wrap" }}>
                {topGenreData.honorableMentions.map((mention) => (
                  <div key={mention.genre} style={{ 
                    background: "rgba(15, 18, 25, 0.8)",
                    padding: "clamp(12px, 2vw, 16px) clamp(16px, 3vw, 24px)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.06)"
                  }}>
                    <div style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)", fontWeight: "600", color: "#f8fafc" }}>{mention.genre}</div>
                    <div style={{ fontSize: "clamp(0.875rem, 2vw, 1rem)", color: "#94a3b8" }}>{mention.count} items</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </PageContainer>
  );
}
