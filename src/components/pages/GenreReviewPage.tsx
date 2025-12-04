import { Container } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Title, CenteredGrid } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { generateGuid } from "@/lib/utils";
import { getTopGenre } from "@/lib/genre-helpers";
import PageContainer from "../PageContainer";

export default function GenreReviewPage() {
  const { movies, shows, isLoading } = useData();
  const { data: moviesData } = movies;
  const { data: showsData } = shows;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const visibleMovies = moviesData ?? [];
  const visibleShows = showsData?.map((show: { item: { id?: string } }) => show.item) ?? [];
  const topGenreData = getTopGenre(visibleMovies, visibleShows);

  if (!topGenreData) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <Container size="4" p="4">
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Your Top Genre: {topGenreData.genre}
            </Title>
            <p style={{ fontSize: "1.125rem", color: "#94a3b8", marginTop: "0.5rem" }}>
              The genre you watched most this year
            </p>
            <p style={{ fontSize: "1.5rem", color: "#00f0ff", marginTop: "0.5rem", fontWeight: 600 }}>
              {topGenreData.count} items watched
            </p>
          </div>

          <CenteredGrid>
            {topGenreData.items.slice(0, 20).map((item: { id?: string }) => (
              <MovieCard key={generateGuid()} item={item} />
            ))}
          </CenteredGrid>

          {topGenreData.honorableMentions.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#f8fafc", marginBottom: "1rem" }}>
                Honorable Mentions
              </h2>
              <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
                {topGenreData.honorableMentions.map((mention) => (
                  <div key={mention.genre} style={{ 
                    background: "rgba(15, 18, 25, 0.8)",
                    padding: "16px 24px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.06)"
                  }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: "600", color: "#f8fafc" }}>{mention.genre}</div>
                    <div style={{ fontSize: "1rem", color: "#94a3b8" }}>{mention.count} items</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </PageContainer>
  );
}
