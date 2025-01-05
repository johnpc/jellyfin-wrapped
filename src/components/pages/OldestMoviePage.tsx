import { useState, useEffect } from "react";
import { listMovies, SimpleItemDto } from "@/lib/playback-reporting-queries";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Container, Grid, Box, Button, Spinner } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { itemVariants, Subtitle, Title } from "../ui/styled";
import { useErrorBoundary } from "react-error-boundary";

const NEXT_PAGE = "/shows";
export default function OldestMoviePage() {
  const { showBoundary } = useErrorBoundary();

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [movie, setMovie] = useState<SimpleItemDto>();

  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      try {
        const movies = await listMovies();
        movies.sort((a, b) => {
          const aDate = new Date(a.date ?? new Date());
          const bDate = new Date(b.date ?? new Date());
          return aDate.getTime() - bDate.getTime();
        });
        const m = movies.find((s) => s);
        if (!m) {
          void navigate(NEXT_PAGE);
        }
        setMovie(m);
      } catch (e) {
        showBoundary(e);
      } finally {
        setIsLoading(false);
      }
    };
    void setup();
  }, []);

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

  if (!movie?.id) {
    return (
      <>
        <>No movies watched.</>{" "}
        <Button
          size={"4"}
          style={{ width: "100%" }}
          onClick={() => {
            void navigate(NEXT_PAGE);
          }}
        >
          Next
        </Button>
      </>
    );
  }

  return (
    <Box
      style={{ backgroundColor: "var(--yellow-8)" }}
      className="min-h-screen"
    >
      <Container size="4" p="4">
      <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              It's {new Date().getFullYear()}, but you've time traveled back to{" "}
              {movie?.productionYear}
            </Title>

            <Subtitle
              style={{ backgroundColor: "palevioletred", borderRadius: "10px" }}
              as={motion.p}
              variants={itemVariants}
            >
              {movie?.name} came out on{" "}
              {new Date(movie?.date ?? "").toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Subtitle>
          </div>
          <div style={{
    display: "flex",
    justifyContent: "center",
    width: "100%"
  }}>
    <div style={{
      maxWidth: "50%",
      width: "100%"
    }}>
      <MovieCard key={movie.id} item={movie} />
    </div>
  </div>
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
