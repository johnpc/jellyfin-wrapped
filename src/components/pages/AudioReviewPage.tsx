import { useState, useEffect } from "react";
import { listAudio, SimpleItemDto } from "@/lib/playback-reporting-queries";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Container, Grid, Box, Spinner, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { styled } from "@stitches/react";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";

const NEXT_PAGE = '/music-videos'

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
        }}
      >
        <Spinner size={"3"} />
      </div>
    );
  }
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };
  const Title = styled("h1", {
    fontSize: "4rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    // Updated gradient with yellow to blue
    background: "linear-gradient(90deg, #FFD700 0%, #00E1FF 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 0 30px rgba(255, 215, 0, 0.3)",
  });

  return (
    <Box style={{ backgroundColor: "var(--red-8)" }} className="min-h-screen">
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              You Listened to {audios.length} Songs This Year
            </Title>
          </div>

          <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
            {audios.map((audio) => (
              <MovieCard key={audio.id} item={audio} />
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
        Review Music Videos
      </Button>
    </Box>
  );
}
