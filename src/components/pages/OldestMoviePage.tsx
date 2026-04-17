import { Container, Grid } from "@radix-ui/themes";
import { motion } from "motion/react";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { itemVariants } from "@/lib/styled-variants";
import PageContainer from "../PageContainer";

export default function OldestMoviePage() {
  const { movies, isLoading } = useData();
  const { data: moviesData } = movies;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const sortedMovies = [...(moviesData ?? [])]
    .filter((m: { productionYear?: number | null }) => m.productionYear != null)
    .sort(
      (a: { productionYear?: number | null }, b: { productionYear?: number | null }) => {
        return (a.productionYear ?? 9999) - (b.productionYear ?? 9999);
      }
    );

  const movie = sortedMovies[0];

  if (!movie) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <Container size="4" p="4">
        <Grid gap="3">
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
              Oldest Movie You Watched
            </motion.h1>
            <p style={{ fontSize: "1.125rem", color: "var(--gray-11)", marginTop: "0.5rem" }}>
              The most vintage film in your viewing history
            </p>
            <motion.p variants={itemVariants} style={{
              fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
              marginBottom: "3rem",
              lineHeight: 1.7,
              color: "#94a3b8",
              maxWidth: "620px",
              margin: "0 auto 3rem",
              fontWeight: 400,
            }}>
              Released in {movie.productionYear}
            </motion.p>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ maxWidth: "200px", width: "100%" }}>
              <MovieCard item={movie} />
            </div>
          </div>
        </Grid>
      </Container>
    </PageContainer>
  );
}
