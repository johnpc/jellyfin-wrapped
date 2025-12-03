import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { useMusicVideos } from "@/hooks/queries/useMusicVideos";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { LoadingSpinner } from "../LoadingSpinner";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import PageContainer from "../PageContainer";

const NEXT_PAGE = "/actors";

export default function MusicVideoPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const { data: musicVideos, isLoading, error } = useMusicVideos();

  if (error) {
    showBoundary(error);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!musicVideos?.length) {
    void navigate(NEXT_PAGE);
    return null;
  }

  return (
    <PageContainer backgroundColor="var(--red-8)" nextPage={NEXT_PAGE} previousPage="/audio">
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              You Listened to {musicVideos.length} Music Videos
            </Title>
            <p style={{ fontSize: "1.125rem", color: "var(--gray-11)", marginTop: "0.5rem" }}>
              Your music video viewing collection
            </p>
          </div>

          <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
            {musicVideos.slice(0, 20).map((musicVideo: { id?: string }) => (
              <MovieCard key={musicVideo.id} item={musicVideo} />
            ))}
          </Grid>
        </Grid>
      </Container>
    </PageContainer>
  );
}
