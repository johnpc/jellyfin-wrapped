import { useState } from "react";
import { Container, Grid, Box, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { useMovies } from "@/hooks/queries/useMovies";
import { useShows } from "@/hooks/queries/useShows";
import { LoadingSpinner } from "../LoadingSpinner";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { generateGuid } from "@/lib/utils";
import { getCachedHiddenIds, setCachedHiddenId } from "@/lib/cache";
import { getTopGenre } from "@/lib/genre-helpers";

const NEXT_PAGE = "/holidays";

export default function GenreReviewPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const {
    data: movies,
    isLoading: moviesLoading,
    error: moviesError,
  } = useMovies();
  const {
    data: shows,
    isLoading: showsLoading,
    error: showsError,
  } = useShows();
  const [hiddenIds, setHiddenIds] = useState<string[]>(getCachedHiddenIds());

  if (moviesError) showBoundary(moviesError);
  if (showsError) showBoundary(showsError);

  if (moviesLoading || showsLoading) {
    return <LoadingSpinner />;
  }

  const visibleMovies =
    movies?.filter(
      (movie: { id?: string }) => !hiddenIds.includes(movie.id ?? "")
    ) ?? [];

  const visibleShows =
    shows
      ?.map((show: { item: { id?: string } }) => show.item)
      .filter((show: { id?: string }) => !hiddenIds.includes(show.id ?? "")) ??
    [];

  const topGenreData = getTopGenre(visibleMovies, visibleShows);

  if (!topGenreData) {
    void navigate(NEXT_PAGE);
    return null;
  }

  return (
    <Box style={{ backgroundColor: "var(--pink-8)" }} className="min-h-screen">
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Your Top Genre: {topGenreData.genre}
            </Title>
          </div>

          <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
            {topGenreData.items.slice(0, 20).map((item: { id?: string }) => (
              <MovieCard
                key={generateGuid()}
                item={item}
                onHide={() => {
                  setCachedHiddenId(item.id ?? "");
                  setHiddenIds([...hiddenIds, item.id ?? ""]);
                }}
              />
            ))}
          </Grid>
        </Grid>
      </Container>
      <Button
        size={"4"}
        style={{ width: "100%" }}
        onClick={() => {
          void navigate(NEXT_PAGE);
        }}
      >
        Next
      </Button>
    </Box>
  );
}
