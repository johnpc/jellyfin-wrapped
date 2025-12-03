import { Container, Grid, Box, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { useMusicVideos } from "@/hooks/queries/useMusicVideos";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { LoadingSpinner } from "../LoadingSpinner";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";

const NEXT_PAGE = "/minutes-per-day";

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
    <Box
      style={{
        backgroundColor: "var(--red-8)",
        minWidth: "100vw",
        minHeight: "100vh",
      }}
      className="min-h-screen"
    >
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              You Listened to {musicVideos.length} Music Videos
            </Title>
          </div>

          <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
            {musicVideos.slice(0, 20).map((musicVideo: { id?: string }) => (
              <MovieCard key={musicVideo.id} item={musicVideo} />
            ))}
          </Grid>
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
