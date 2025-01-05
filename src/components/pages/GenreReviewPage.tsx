import { useState, useEffect } from "react";
import {
  listMovies,
  listShows,
  SimpleItemDto,
} from "@/lib/playback-reporting-queries";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Container, Grid, Box, Spinner, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { itemVariants, Title } from "../ui/styled";
import { useNavigate } from "react-router-dom";
import { generateGuid } from "@/lib/utils";
import { useErrorBoundary } from "react-error-boundary";
import { getCachedHiddenIds, setCachedHiddenId } from "@/lib/cache";

const NEXT_PAGE = '/holidays';
export default function GenreReviewPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [movies, setMovies] = useState<SimpleItemDto[]>([]);
  const [shows, setShows] = useState<SimpleItemDto[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>(getCachedHiddenIds());

  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      try {
        const movies = await listMovies();
        setMovies(
          movies.filter((movie) => !hiddenIds.includes(movie.id ?? "")),
        );
        const shows = await listShows();
        setShows(
          shows
            .map((show) => show.item)
            .filter((show) => !hiddenIds.includes(show.id ?? "")),
        );
        if (!movies.length && !shows.length) {
          void navigate(NEXT_PAGE);
        }
      } catch (error) {
        showBoundary(error);
      } finally {
        setIsLoading(false);
      }
    };
    void setup();
  }, [hiddenIds]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Spinner size={"3"} />
      </div>
    );
  }

  const allGenres = movies.flatMap((movie) => movie.genres).filter((g) => g);
  const genreCounts = allGenres.reduce(
    (counts, genre) => {
      if (!genre) return counts;
      counts[genre] = (counts[genre] || 0) + 1;
      return counts;
    },
    {} as Record<string, number>,
  );

  const sortedGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([genre]) => genre);

  const itemsByGenre = sortedGenres.map((genre) => ({
    genre,
    count: [...movies, ...shows].filter((movie) =>
      movie.genres?.includes(genre),
    ).length,
    items: [...movies, ...shows].filter((movie) =>
      movie.genres?.includes(genre),
    ),
  }));

  return (
    <Box
      style={{ backgroundColor: "var(--orange-8)" }}
      className="min-h-screen"
    >
      <Container size="4" p="4">
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {itemsByGenre.map(({ genre, count, items }) => (
            <div
              key={genre}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <Title as={motion.h1} variants={itemVariants}>
                {genre} ({count} {count === 1 ? "items" : "items"})
              </Title>
              <Grid
                columns={{ initial: "2", sm: "3", md: "4", lg: "5" }}
                gap="4"
              >
                {items.map((movie) => (
                  <MovieCard
                    key={generateGuid()}
                    item={movie}
                    onHide={() => {
                      setCachedHiddenId(movie.id ?? "");
                      setHiddenIds([...hiddenIds, movie.id ?? ""]);
                    }}
                  />
                ))}
              </Grid>
            </div>
          ))}
        </div>
      </Container>
      <Button
        size={"4"}
        style={{ width: "100%" }}
        onClick={() => {
          void navigate(NEXT_PAGE);
        }}
      >
        Review Holidays
      </Button>
    </Box>
  );
}
