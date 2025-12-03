import { Container, Grid, Box, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { useFavoriteActors } from "@/hooks/queries/useFavoriteActors";
import { LoadingSpinner } from "../LoadingSpinner";
import { ActorCard } from "./MoviesReviewPage/ActorCard";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { generateGuid } from "@/lib/utils";
import { BaseItemPerson } from "@jellyfin/sdk/lib/generated-client";
import { SimpleItemDto } from "@/lib/queries";

const NEXT_PAGE = "/genres";

export default function FavoriteActorsPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const { data: favoriteActors, isLoading, error } = useFavoriteActors();

  if (error) {
    showBoundary(error);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!favoriteActors?.length) {
    void navigate(NEXT_PAGE);
    return null;
  }

  return (
    <Box
      style={{ backgroundColor: "var(--orange-8)" }}
      className="min-h-screen"
    >
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Your Favorite Actors
            </Title>
          </div>

          <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
            {favoriteActors
              .slice(0, 20)
              .map(
                (actor: {
                  name: string;
                  count: number;
                  details: BaseItemPerson;
                  seenInMovies: SimpleItemDto[];
                  seenInShows: SimpleItemDto[];
                }) => (
                  <ActorCard
                    key={generateGuid()}
                    name={actor.name}
                    count={actor.count}
                    details={actor.details}
                    seenInMovies={actor.seenInMovies}
                    seenInShows={actor.seenInShows}
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
