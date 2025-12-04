import { Container } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { ActorCard } from "./MoviesReviewPage/ActorCard";
import { Title, CenteredGrid } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import PageContainer from "../PageContainer";
import { generateGuid } from "@/lib/utils";
import { BaseItemPerson } from "@jellyfin/sdk/lib/generated-client";
import { SimpleItemDto } from "@/lib/queries";

export default function FavoriteActorsPage() {
  const { actors, isLoading } = useData();
  const { data: favoriteActors } = actors;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!favoriteActors?.length) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <Container size="4" p="4">
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Your Favorite Actors
            </Title>
            <p style={{ fontSize: "1.125rem", color: "#94a3b8", marginTop: "0.5rem" }}>
              The performers who appeared most in what you watched
            </p>
          </div>

          <CenteredGrid>
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
          </CenteredGrid>
        </div>
      </Container>
    </PageContainer>
  );
}
