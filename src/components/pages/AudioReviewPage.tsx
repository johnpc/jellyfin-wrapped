import EmptyState from "../EmptyState";
import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useErrorBoundary } from "react-error-boundary";
import { useAudio } from "@/hooks/queries/useAudio";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { LoadingSpinner } from "../LoadingSpinner";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { AudioPlayDto } from "@/lib/queries";
import PageContainer from "../PageContainer";

const NEXT_PAGE = "/music-videos";
const MAX_DISPLAY_ITEMS = 20;

export default function AudioReviewPage() {
  const { showBoundary } = useErrorBoundary();
  const { data: audios, isLoading, error } = useAudio();

  if (error) {
    showBoundary(error);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const totalPlays =
    audios?.reduce((sum, audio) => sum + audio.playCount, 0) ?? 0;

  if (!audios?.length) {
    return (
      <EmptyState
        title="No Audio Listening History"
        backgroundColor="var(--red-8)"
        nextPage={NEXT_PAGE}
        previousPage="/shows"
      />
    );
  }

  return (
    <PageContainer
      backgroundColor="var(--red-8)"
      nextPage={NEXT_PAGE}
      previousPage="/shows"
    >
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              You Listened to {audios.length} Songs
            </Title>
            <p
              style={{
                fontSize: "1.125rem",
                color: "var(--gray-11)",
                marginTop: "0.5rem",
              }}
            >
              {totalPlays} plays across your music listening history
            </p>
            {audios.length > MAX_DISPLAY_ITEMS && (
              <p style={{ color: "var(--gray-12)" }}>
                Showing your {MAX_DISPLAY_ITEMS} most played songs
              </p>
            )}
          </div>

          <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
            {audios.slice(0, MAX_DISPLAY_ITEMS).map((audio: AudioPlayDto) => (
              <MovieCard
                key={audio.item.id}
                item={audio.item}
                playCount={audio.playCount}
              />
            ))}
          </Grid>
        </Grid>
      </Container>
    </PageContainer>
  );
}
