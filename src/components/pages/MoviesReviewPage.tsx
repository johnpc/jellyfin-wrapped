import { useState, useEffect } from "react";
import { listMovies, SimpleItemDto } from "@/lib/playback-reporting-queries";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Container, Grid, Box, Spinner, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { itemVariants, Title } from "../ui/styled";
import { useNavigate } from "react-router-dom";
import { generateGuid } from "@/lib/utils";
import { useErrorBoundary } from "react-error-boundary";
import { getCachedHiddenIds, setCachedHiddenId } from "@/lib/cache";

const NEXT_PAGE = "/shows";
export default function MoviesReviewPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [movies, setMovies] = useState<SimpleItemDto[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>(getCachedHiddenIds());

  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      try {
        const movies = await listMovies();
        setMovies(
          movies.filter((movie) => !hiddenIds.includes(movie.id ?? "")),
        );
        if (!movies.length) {
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
        <Box
          style={{
            backgroundColor: "var(--green-8)",
            minHeight: "100vh",
            minWidth: "100vw",
          }}
          className="min-h-screen"
        >
          <Spinner size={"3"} />
        </Box>
      </div>
    );
  }

  return (
    <Box
      style={{ backgroundColor: "var(--purple-8)" }}
      className="min-h-screen"
    >
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              You Watched {movies.length} Movies This Year
            </Title>
          </div>

          <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
            {movies.map((movie) => (
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
