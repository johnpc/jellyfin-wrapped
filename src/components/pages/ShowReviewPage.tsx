import { useState, useEffect } from "react";
import { listShows, SimpleItemDto } from "@/lib/playback-reporting-queries";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Container, Grid, Box, Button, Spinner } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { styled } from "@stitches/react";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";

export default function ShowReviewPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [shows, setShows] = useState<
    {
      showName: string;
      episodeCount: number;
      playbackTime: number;
      item: SimpleItemDto;
    }[]
  >([]);

  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      try {
        setShows(await listShows());
      } catch (e) {
        showBoundary(e);
      } finally {
        setIsLoading(false);
      }
    };
    setup();
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
    background: "linear-gradient(90deg, #FFD700 0%, #00E1FF 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 0 30px rgba(255, 215, 0, 0.3)",
  });

  return (
    <Box
      style={{ backgroundColor: "var(--yellow-8)" }}
      className="min-h-screen"
    >
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              You Watched {shows.length} Shows This Year
            </Title>
          </div>

          <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
            {shows.map((show) => (
              <>
                <MovieCard
                  key={show.item.id}
                  item={show.item}
                  episodeCount={show.episodeCount}
                  playbackTime={show.playbackTime}
                />
              </>
            ))}
          </Grid>
        </Grid>
      </Container>
      <Button
        size={"4"}
        style={{ width: "100%" }}
        onClick={() => {
          navigate("/oldest-show");
        }}
      >
        Review Oldest Show
      </Button>
    </Box>
  );
}
