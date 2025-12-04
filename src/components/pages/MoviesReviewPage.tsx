import { Container } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Title, CenteredGrid } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import PageContainer from "../PageContainer";
import { LoadingSpinner } from "../LoadingSpinner";

export default function MoviesReviewPage() {
  const { movies, isLoading } = useData();
  const { data: moviesData } = movies;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const visibleMovies = moviesData ?? [];

  if (!visibleMovies.length) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <Container size="4" p="4">
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              You Watched {visibleMovies.length} Movies
            </Title>
            <p style={{ fontSize: "1.125rem", color: "#94a3b8", marginTop: "0.5rem" }}>
              Your complete movie viewing history
            </p>
          </div>

          <CenteredGrid>
            {visibleMovies.map((movie: { id?: string; name?: string | null }) => (
              <MovieCard key={movie.id} item={movie} />
            ))}
          </CenteredGrid>
        </div>
      </Container>
    </PageContainer>
  );
}
