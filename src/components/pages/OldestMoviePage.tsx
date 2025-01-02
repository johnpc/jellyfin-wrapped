import { useState, useEffect } from "react";
import { listMovies, SimpleItemDto } from "@/lib/playback-reporting-queries";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Container, Grid, Box, Button, Spinner } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { styled } from "@stitches/react";
import { useNavigate } from "react-router-dom";
import { Subtitle } from "../ui/styled";

export default function OldestMoviePage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [movie, setMovie] = useState<SimpleItemDto>();

  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      const movies = await listMovies();
      movies.sort((a, b) => {
        const aDate = new Date(a.date!);
        const bDate = new Date(b.date!);
        return aDate.getTime() - bDate.getTime();
      });
      const m = movies.find((s) => s)!;
      setMovie(m);
      setIsLoading(false);
    };
    setup();
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
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };
  const Title = styled("h1", {
    fontSize: "4rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    background: "linear-gradient(90deg, #FFD700 0%, #00E1FF 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 0 30px rgba(255, 215, 0, 0.3)",
  });

  return (
    <Box
      style={{ backgroundColor: "var(--yellow-8)" }}
      className="min-h-screen"
    >
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              It's {new Date().getFullYear()}, but you've time traveled back to {movie?.productionYear}
            </Title>

            <Subtitle
              style={{ backgroundColor: "palevioletred", borderRadius: "10px" }}
              as={motion.p}
              variants={itemVariants}
            >
              {movie?.name} came out on{" "}
              {new Date(movie?.date ?? '').toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Subtitle>
          </div>
          <MovieCard
            key={movie!.id}
            item={movie!}
          />
        </Grid>
      </Container>
      <Button
        size={"4"}
        style={{ width: "100%" }}
        onClick={() => {
          navigate("/shows");
        }}
      >
        Review Shows
      </Button>
    </Box>
  );
}
