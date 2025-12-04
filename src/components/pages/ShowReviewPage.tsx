import { Container } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { LoadingSpinner } from "../LoadingSpinner";
import { Title, CenteredGrid } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import PageContainer from "../PageContainer";

export default function ShowReviewPage() {
  const { shows, isLoading } = useData();
  const { data: showsData } = shows;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const visibleShows = showsData ?? [];

  if (!visibleShows.length) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <Container size="4" p="4">
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              You Watched {visibleShows.length} Shows
            </Title>
            <p style={{ fontSize: "1.125rem", color: "#94a3b8", marginTop: "0.5rem" }}>
              All the TV series you enjoyed this year
            </p>
          </div>

          <CenteredGrid>
            {visibleShows
              .slice(0, 20)
              .map(
                (show: {
                  item: { id?: string };
                  episodeCount: number;
                  playbackTime: number;
                }) => (
                  <MovieCard
                    key={show.item.id}
                    item={show.item}
                    episodeCount={show.episodeCount}
                    playbackTime={show.playbackTime}
                  />
                )
              )}
          </CenteredGrid>
        </div>
      </Container>
    </PageContainer>
  );
}
