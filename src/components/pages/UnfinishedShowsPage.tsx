import { useEffect, useState } from "react";
import { Container, Grid, Box, Button, Card, Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { useUnfinishedShows } from "@/hooks/queries/useUnfinishedShows";
import { LoadingSpinner } from "../LoadingSpinner";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { format } from "date-fns";
import { getImageUrlById, UnfinishedShowDto } from "@/lib/queries";

const NEXT_PAGE = "/device-stats";

type ShowWithPoster = UnfinishedShowDto & { posterUrl?: string };

export default function UnfinishedShowsPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const { data: shows, isLoading, error } = useUnfinishedShows();
  const [showsWithPosters, setShowsWithPosters] = useState<ShowWithPoster[]>(
    []
  );

  useEffect(() => {
    if (!shows) return;

    const fetchPosters = async () => {
      const withPosters = await Promise.all(
        shows.map(async (show: UnfinishedShowDto) => {
          const posterUrl = show.item.id
            ? await getImageUrlById(show.item.id)
            : undefined;
          return { ...show, posterUrl };
        })
      );
      setShowsWithPosters(withPosters);
    };

    void fetchPosters();
  }, [shows]);

  if (error) {
    showBoundary(error);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!showsWithPosters.length) {
    void navigate(NEXT_PAGE);
    return null;
  }

  return (
    <Box
      style={{ backgroundColor: "var(--indigo-8)" }}
      className="min-h-screen"
    >
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Shows You Started But Haven't Finished
            </Title>
          </div>

          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
            {showsWithPosters.slice(0, 12).map((show: ShowWithPoster) => (
              <Card key={show.item.id}>
                {show.posterUrl && (
                  <img
                    src={show.posterUrl}
                    alt={show.item.name ?? ""}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                )}
                <Text size="4" weight="bold">
                  {show.item.name}
                </Text>
                <Text size="2" color="gray">
                  {show.watchedEpisodes} / {show.totalEpisodes} episodes
                </Text>
                <Text size="1" color="gray">
                  Last watched: {format(show.lastWatchedDate, "MMM d, yyyy")}
                </Text>
              </Card>
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
