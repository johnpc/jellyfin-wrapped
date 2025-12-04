import { Container } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { LoadingSpinner } from "../LoadingSpinner";
import { Title, CenteredGrid } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import PageContainer from "../PageContainer";

const MAX_DISPLAY_ITEMS = 20;

export default function AudioReviewPage() {
  const { audio, isLoading } = useData();
  const { data: audios } = audio;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!audios?.length) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <Container size="4" p="4">
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              You Listened to {audios.length} Songs
            </Title>
            <p style={{ fontSize: "1.125rem", color: "#94a3b8", marginTop: "0.5rem" }}>
              Your music listening history
            </p>
            {audios.length > MAX_DISPLAY_ITEMS && (
              <p style={{ color: "#64748b" }}>
                Showing top {MAX_DISPLAY_ITEMS} songs
              </p>
            )}
          </div>

          <CenteredGrid>
            {audios
              .slice(0, MAX_DISPLAY_ITEMS)
              .map((audioItem: { id?: string }) => (
                <MovieCard key={audioItem.id} item={audioItem} />
              ))}
          </CenteredGrid>
        </div>
      </Container>
    </PageContainer>
  );
}
