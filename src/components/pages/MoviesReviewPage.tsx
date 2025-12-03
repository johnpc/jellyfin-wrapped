import { useState } from "react";
import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { useMovies } from "@/hooks/queries/useMovies";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import PageContainer from "../PageContainer";
import { LoadingSpinner } from "../LoadingSpinner";
import { getCachedHiddenIds, setCachedHiddenId } from "@/lib/cache";
import { generateGuid } from "@/lib/utils";

const NEXT_PAGE = "/shows";

export default function MoviesReviewPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const { data: movies, isLoading, error } = useMovies();
  const [hiddenIds, setHiddenIds] = useState<string[]>(getCachedHiddenIds());

  if (error) {
    showBoundary(error);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const visibleMovies =
    movies?.filter(
      (movie: { id?: string }) => !hiddenIds.includes(movie.id ?? "")
    ) ?? [];

  if (!visibleMovies.length) {
    void navigate(NEXT_PAGE);
    return null;
  }

  return (
    <PageContainer backgroundColor="var(--purple-8)" nextPage={NEXT_PAGE} previousPage="/TopTen">
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              You Watched {visibleMovies.length} Movies
            </Title>
            <p style={{ fontSize: "1.125rem", color: "var(--gray-11)", marginTop: "0.5rem" }}>
              Your complete movie viewing history
            </p>
          </div>

          <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
            {visibleMovies.map(
              (movie: { id?: string; name?: string | null }) => (
                <MovieCard
                  key={generateGuid()}
                  item={movie}
                  onHide={() => {
                    setCachedHiddenId(movie.id ?? "");
                    setHiddenIds([...hiddenIds, movie.id ?? ""]);
                  }}
                />
              )
            )}
          </Grid>
        </Grid>
      </Container>
    </PageContainer>
  );
}
