import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Subtitle, Title } from "../ui/styled";
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
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Oldest Movie You Watched
            </Title>
            <p style={{ fontSize: "1.125rem", color: "var(--gray-11)", marginTop: "0.5rem" }}>
              The most vintage film in your viewing history
            </p>
            <Subtitle as={motion.p} variants={itemVariants}>
              Released in {movie.productionYear}
            </Subtitle>
          </div>

          <Grid
            columns={{ initial: "1", sm: "1", md: "1", lg: "1" }}
            gap="4"
            style={{ justifyItems: "center" }}
          >
            <MovieCard item={movie} />
          </Grid>
        </Grid>
      </Container>
    </PageContainer>
  );
}
