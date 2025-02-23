import { useState, useEffect } from "react";
import {
  listMusicVideos,
  SimpleItemDto,
} from "@/lib/playback-reporting-queries";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Container, Grid, Box, Spinner, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { itemVariants, Title } from "../ui/styled";

const NEXT_PAGE = "/minutes-per-day";
export default function MusicVideoPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [musicVideos, setMusicVideos] = useState<SimpleItemDto[]>([]);

  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      try {
        const fetched = await listMusicVideos();
        if (!fetched.length) {
          void navigate(NEXT_PAGE);
        }
        setMusicVideos(fetched);
      } catch (error) {
        showBoundary(error);
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
        }}
      >
        <Box
          style={{
            backgroundColor: "var(--green-8)",
            minHeight: "100vh",
            minWidth: "100vw",
          }}
          className="min-h-screen"
        >
          <Spinner size={"3"} />
        </Box>
      </div>
    );
  }

  return (
    <Box style={{ backgroundColor: "var(--red-8)" }} className="min-h-screen">
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              You Listened to {musicVideos.length} Music Videos This Year
            </Title>
          </div>

          <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
            {musicVideos.map((musicVideo) => (
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
