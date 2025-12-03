import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { useFavoriteActors } from "@/hooks/queries/useFavoriteActors";
import { LoadingSpinner } from "../LoadingSpinner";
import { ActorCard } from "./MoviesReviewPage/ActorCard";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import PageContainer from "../PageContainer";
import { generateGuid } from "@/lib/utils";
import { BaseItemPerson } from "@jellyfin/sdk/lib/generated-client";
import { SimpleItemDto } from "@/lib/queries";
import { useEffect } from "react";

const NEXT_PAGE = "/genres";

export default function FavoriteActorsPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const { data: favoriteActors, isLoading, error } = useFavoriteActors();

  useEffect(() => {
    if (!isLoading && !error && favoriteActors && !favoriteActors.length) {
      void navigate(NEXT_PAGE);
    }
  }, [isLoading, error, favoriteActors, navigate]);

  if (error) {
    showBoundary(error);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!favoriteActors?.length) {
    return null;
  }

  return (
    <PageContainer backgroundColor="var(--orange-8)" nextPage={NEXT_PAGE} previousPage="/music-videos">
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Your Favorite Actors
            </Title>
            <p style={{ fontSize: "1.125rem", color: "var(--gray-11)", marginTop: "0.5rem" }}>
              The performers who appeared most in what you watched
            </p>
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
    </PageContainer>
  );
}
