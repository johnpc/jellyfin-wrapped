import { useState } from "react";
import { Container, Grid } from "@radix-ui/themes";
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
import PageContainer from "../PageContainer";

const NEXT_PAGE = "/tv";

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
    <PageContainer backgroundColor="var(--pink-8)" nextPage={NEXT_PAGE} previousPage="/actors">
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Your Top Genre: {topGenreData.genre}
            </Title>
            <p style={{ fontSize: "1.125rem", color: "var(--gray-11)", marginTop: "0.5rem" }}>
              The genre you watched most this year
            </p>
            <p style={{ fontSize: "1.5rem", color: "white", marginTop: "0.5rem" }}>
              {topGenreData.count} items watched
            </p>
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

          {topGenreData.honorableMentions.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white", marginBottom: "1rem" }}>
                Honorable Mentions
              </h2>
              <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
                {topGenreData.honorableMentions.map((mention) => (
                  <div key={mention.genre} style={{ color: "white" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: "600" }}>{mention.genre}</div>
                    <div style={{ fontSize: "1rem", opacity: 0.8 }}>{mention.count} items</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Grid>
      </Container>
    </PageContainer>
  );
}
