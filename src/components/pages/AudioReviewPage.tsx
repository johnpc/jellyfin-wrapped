import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { useAudio } from "@/hooks/queries/useAudio";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { LoadingSpinner } from "../LoadingSpinner";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import PageContainer from "../PageContainer";

const NEXT_PAGE = "/music-videos";
const MAX_DISPLAY_ITEMS = 20;

export default function AudioReviewPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const { data: audios, isLoading, error } = useAudio();

  if (error) {
    showBoundary(error);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!audios?.length) {
    void navigate(NEXT_PAGE);
    return null;
  }

  return (
    <PageContainer backgroundColor="var(--red-8)" nextPage={NEXT_PAGE} previousPage="/shows">
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              You Listened to {audios.length} Songs
            </Title>
            <p style={{ fontSize: "1.125rem", color: "var(--gray-11)", marginTop: "0.5rem" }}>
              Your music listening history
            </p>
            {audios.length > MAX_DISPLAY_ITEMS && (
              <p style={{ color: "var(--gray-12)" }}>
                Showing top {MAX_DISPLAY_ITEMS} songs
              </p>
            )}
          </div>

          <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
            {audios
              .slice(0, MAX_DISPLAY_ITEMS)
              .map((audio: { id?: string }) => (
                <MovieCard key={audio.id} item={audio} />
              ))}
          </Grid>
        </Grid>
      </Container>
    </PageContainer>
  );
}
