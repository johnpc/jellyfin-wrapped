import { useState, useEffect } from "react";
import { listAudio, SimpleItemDto } from "@/lib/playback-reporting-queries";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Container, Grid, Spinner } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { itemVariants, Title } from "../ui/styled";
import PageContainer from "../PageContainer";

const NEXT_PAGE = "/music-videos";
const MAX_DISPLAY_ITEMS = 20;

export default function AudioReviewPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [audios, setAudios] = useState<SimpleItemDto[]>([]);

  useEffect(() => {
    const setup = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const fetched = await listAudio();
        if (!fetched.length) {
          void navigate(NEXT_PAGE);
        }
        setAudios(fetched);
      } catch (e) {
        showBoundary(e);
      } finally {
        setIsLoading(false);
      }
    };
    void setup();
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "var(--green-8)",
        }}
      >
        <Spinner size={"3"} />
      </div>
    );
  }

  return (
    <PageContainer backgroundColor="var(--red-8)" nextPage={NEXT_PAGE}>
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              You Listened to {audios.length} Songs
            </Title>
            {audios.length > MAX_DISPLAY_ITEMS && (
              <p style={{ color: "var(--gray-12)" }}>
                Showing top {MAX_DISPLAY_ITEMS} songs
              </p>
            )}
          </div>

          <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
            {audios.slice(0, MAX_DISPLAY_ITEMS).map((audio) => (
              <MovieCard key={audio.id} item={audio} />
            ))}
          </Grid>
        </Grid>
      </Container>
    </PageContainer>
  );
}
