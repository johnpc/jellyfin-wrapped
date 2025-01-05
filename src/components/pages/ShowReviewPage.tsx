import { useState, useEffect } from "react";
import { listShows, SimpleItemDto } from "@/lib/playback-reporting-queries";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Container, Grid, Box, Button, Spinner } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { getCachedHiddenIds, setCachedHiddenId } from "@/lib/cache";
import { itemVariants, Title } from "../ui/styled";

const NEXT_PAGE = "/oldest-show";
export default function ShowReviewPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hiddenIds, setHiddenIds] = useState<string[]>(getCachedHiddenIds());
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
        const shows = await listShows();
        const filteredShows = shows.filter(
          (show) => !hiddenIds.includes(show.item.id ?? ""),
        );
        setShows(filteredShows);
        if (!filteredShows.length) {
          void navigate(NEXT_PAGE);
        }
      } catch (e) {
        showBoundary(e);
      } finally {
        setIsLoading(false);
      }
    };
    void setup();
  }, [hiddenIds]);

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
                  onHide={() => {
                    setCachedHiddenId(show.item.id ?? "");
                    setHiddenIds([...hiddenIds, show.item.id ?? ""]);
                  }}
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
          void navigate(NEXT_PAGE);
        }}
      >
        Next
      </Button>
    </Box>
  );
}
