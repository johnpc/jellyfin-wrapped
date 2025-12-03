import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { useMovies } from "@/hooks/queries/useMovies";
import { LoadingSpinner } from "../LoadingSpinner";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Subtitle, Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import PageContainer from "../PageContainer";

const NEXT_PAGE = "/oldest-show";

export default function OldestMoviePage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const { data: movies, isLoading, error } = useMovies();

  if (error) {
    showBoundary(error);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const sortedMovies = [...(movies ?? [])].sort(
    (a: { date?: string | null }, b: { date?: string | null }) => {
      const aDate = new Date(a.date ?? new Date());
      const bDate = new Date(b.date ?? new Date());
      return aDate.getTime() - bDate.getTime();
    }
  );

  const movie = sortedMovies[0];

  if (!movie) {
    void navigate(NEXT_PAGE);
    return null;
  }

  return (
    <PageContainer backgroundColor="var(--teal-8)" nextPage={NEXT_PAGE} previousPage="/critically-acclaimed">
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
