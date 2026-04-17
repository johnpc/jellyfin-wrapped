import { Container } from "@radix-ui/themes";
import { motion } from "motion/react";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { ActorCard } from "./MoviesReviewPage/ActorCard";
import { CenteredGrid } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import PageContainer from "../PageContainer";
import { generateGuid } from "@/lib/utils";
import { SimpleItemDto, PersonDto } from "@/lib/queries";

export default function FavoriteActorsPage() {
  const { actors, isLoading } = useData();
  const { data: favoriteActors } = actors;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!favoriteActors?.length) {
    return <LoadingSpinner />;
  }

  const topActor = favoriteActors[0];
  const topActorCount = topActor?.count || 0;

  // Fun messages based on actor appearances
  const getActorMessage = (count: number): string => {
    if (count >= 10) return `Your top actor appeared in ${count} titles! That's some serious star power ⭐`;
    if (count >= 5) return `Your favorite performer showed up ${count} times. They must be good!`;
    return "The faces that kept appearing in your watchlist 🎭";
  };

  return (
    <PageContainer>
      <Container size="4" p="4">
        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(1.5rem, 3vw, 2rem)" }}>
          <div style={{ textAlign: "center" }}>
            <motion.h1 variants={itemVariants} style={{
              fontSize: "clamp(2.75rem, 8vw, 5.5rem)",
              fontWeight: 800,
              marginBottom: "1.75rem",
              lineHeight: 0.95,
              letterSpacing: "-0.05em",
              background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 35%, #a855f7 55%, #f59e0b 80%, #f43f5e 100%)",
              backgroundSize: "250% 250%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradient-flow 8s ease infinite",
              filter: "drop-shadow(0 0 50px rgba(0, 240, 255, 0.25))",
            }}>
              Your Favorite Actors
            </motion.h1>
            <p style={{ fontSize: "clamp(1rem, 2vw, 1.125rem)", color: "#94a3b8", marginTop: "0.5rem" }}>
              {getActorMessage(topActorCount)}
            </p>
          </div>

          <CenteredGrid>
            {favoriteActors
              .slice(0, 20)
              .map(
                (actor: {
                  name: string;
                  count: number;
                  details: PersonDto;
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
