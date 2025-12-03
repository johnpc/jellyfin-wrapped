import {
  Container,
  Grid,
  Box,
  Button,
  Text,
  Card,
  Flex,
} from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { useMovies } from "@/hooks/queries/useMovies";
import { useShows } from "@/hooks/queries/useShows";
import { LoadingSpinner } from "../LoadingSpinner";
import { ContentImage } from "../ContentImage";
import { getTopRatedContent, TopContent } from "@/lib/rating-helpers";

const NEXT_PAGE = "/actors";

export default function CriticallyAcclaimedPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const {
    data: movies,
    isLoading: moviesLoading,
    error: moviesError,
  } = useMovies();
  const {
    data: shows,
    isLoading: showsLoading,
    error: showsError,
  } = useShows();

  if (moviesError) showBoundary(moviesError);
  if (showsError) showBoundary(showsError);

  if (moviesLoading || showsLoading) {
    return <LoadingSpinner />;
  }

  const topContent = getTopRatedContent(movies ?? [], shows ?? []);

  if (!topContent.length) {
    void navigate(NEXT_PAGE);
    return null;
  }

  return (
    <Box style={{ backgroundColor: "var(--teal-8)" }} className="min-h-screen">
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Critically Acclaimed Content You Watched
            </Title>
          </div>

          <Grid columns={{ initial: "1", sm: "2" }} gap="4">
            {topContent.map((content: TopContent) => (
              <Card key={content.item.id}>
                <Flex gap="4" align="center">
                  <ContentImage item={content.item} />
                  <Flex direction="column" gap="2">
                    <Text size="5" weight="bold">
                      {content.item.name}
                    </Text>
                    <Text size="3" color="gray">
                      {content.type === "movie" ? "Movie" : "TV Show"}
                    </Text>
                    <Text size="4" weight="bold" color="amber">
                      ⭐ {content.item.communityRating?.toFixed(1)} / 10
                    </Text>
                    {content.item.productionYear && (
                      <Text size="2" color="gray">
                        {content.item.productionYear}
                      </Text>
                    )}
                  </Flex>
                </Flex>
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
