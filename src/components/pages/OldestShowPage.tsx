import { Container, Grid, Box, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { useShows } from "@/hooks/queries/useShows";
import { LoadingSpinner } from "../LoadingSpinner";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Subtitle, Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { SimpleItemDto } from "@/lib/queries";

const NEXT_PAGE = "/punch-card";

export default function OldestShowPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const { data: shows, isLoading, error } = useShows();

  if (error) {
    showBoundary(error);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const sortedShows = [...(shows ?? [])].sort(
    (a: { item: SimpleItemDto }, b: { item: SimpleItemDto }) => {
      const aDate = new Date(a.item.date ?? new Date());
      const bDate = new Date(b.item.date ?? new Date());
      return aDate.getTime() - bDate.getTime();
    }
  );

  const show = sortedShows[0];

  if (!show) {
    void navigate(NEXT_PAGE);
    return null;
  }

  return (
    <Box style={{ backgroundColor: "var(--lime-8)" }} className="min-h-screen">
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Oldest Show You Watched
            </Title>
            <Subtitle as={motion.p} variants={itemVariants}>
              Released in {show.item.productionYear}
            </Subtitle>
          </div>

          <Grid
            columns={{ initial: "1", sm: "1", md: "1", lg: "1" }}
            gap="4"
            style={{ justifyItems: "center" }}
          >
            <MovieCard
              item={show.item}
              episodeCount={show.episodeCount}
              playbackTime={show.playbackTime}
            />
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
