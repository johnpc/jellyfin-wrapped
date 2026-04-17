import { Container } from "@radix-ui/themes";
import { motion } from "motion/react";
import { useData } from "@/contexts/DataContext";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { CenteredGrid } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import PageContainer from "../PageContainer";
import { LoadingSpinner } from "../LoadingSpinner";

export default function MoviesReviewPage() {
  const { movies, isLoading } = useData();
  const { data: moviesData } = movies;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const visibleMovies = moviesData ?? [];

  if (!visibleMovies.length) {
    return <LoadingSpinner />;
  }

  // Fun messages based on movie count
  const getMovieMessage = (count: number): string => {
    if (count >= 100) return "A century of cinema! You're a true movie buff 🎬";
    if (count >= 50) return "50+ movies? That's a film festival worth of content!";
    if (count >= 25) return "You've watched enough movies to fill a whole month!";
    if (count >= 10) return "Double digits! Your watchlist is impressive.";
    return "Every movie counts! Your cinematic journey continues.";
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
              You Watched {visibleMovies.length} Movies
            </motion.h1>
            <p style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)", color: "#94a3b8", marginTop: "0.5rem" }}>
              {getMovieMessage(visibleMovies.length)}
            </p>
          </div>

          <CenteredGrid>
            {visibleMovies.map((movie: { id?: string; name?: string | null }) => (
              <MovieCard key={movie.id} item={movie} />
            ))}
          </CenteredGrid>
        </div>
      </Container>
    </PageContainer>
  );
}
