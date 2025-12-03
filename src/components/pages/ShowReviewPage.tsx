import { useState } from "react";
import { Container, Grid, Box, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { useShows } from "@/hooks/queries/useShows";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { LoadingSpinner } from "../LoadingSpinner";
import { getCachedHiddenIds, setCachedHiddenId } from "@/lib/cache";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";

const NEXT_PAGE = "/critically-acclaimed";

export default function ShowReviewPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const { data: shows, isLoading, error } = useShows();
  const [hiddenIds, setHiddenIds] = useState<string[]>(getCachedHiddenIds());

  if (error) {
    showBoundary(error);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const visibleShows =
    shows?.filter(
      (show: { item: { id?: string } }) =>
        !hiddenIds.includes(show.item.id ?? "")
    ) ?? [];

  if (!visibleShows.length) {
    void navigate(NEXT_PAGE);
    return null;
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
              You Watched {visibleShows.length} Shows
            </Title>
          </div>

          <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
            {visibleShows
              .slice(0, 20)
              .map(
                (show: {
                  item: { id?: string };
                  episodeCount: number;
                  playbackTime: number;
                }) => (
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
                )
              )}
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
