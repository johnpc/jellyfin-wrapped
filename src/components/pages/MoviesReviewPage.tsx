import { useState, useEffect } from "react";
import { listMovies, SimpleItemDto } from "@/lib/playback-reporting-queries";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Container, Grid, Box, Spinner, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { itemVariants, Title } from "../ui/styled";
import { useNavigate } from "react-router-dom";
import { generateGuid } from "@/lib/utils";

export default function MoviesReviewPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [movies, setMovies] = useState<SimpleItemDto[]>([]);

  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      setMovies(await listMovies());
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
              <MovieCard key={generateGuid()} item={movie} />
            ))}
          </Grid>
        </Grid>
      </Container>
      <Button
        size={"4"}
        style={{ width: "100%" }}
        onClick={() => {
          navigate("/oldest-movie");
        }}
      >
        Review Oldest Movie
      </Button>
    </Box>
  );
}
