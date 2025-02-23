import { useState, useEffect } from "react";
import {
  listFavoriteActors,
  SimpleItemDto,
} from "@/lib/playback-reporting-queries";
import { Container, Grid, Box, Spinner, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { itemVariants, Title } from "../ui/styled";
import { useNavigate } from "react-router-dom";
import { generateGuid } from "@/lib/utils";
import { BaseItemPerson } from "@jellyfin/sdk/lib/generated-client";
import { ActorCard } from "./MoviesReviewPage/ActorCard";
import { useErrorBoundary } from "react-error-boundary";
const NEXT_PAGE = "/genres";
export default function FavoriteActorsPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteActors, setFavoriteActors] = useState<
    {
      name: string;
      count: number;
      details: BaseItemPerson;
      seenInMovies: SimpleItemDto[];
      seenInShows: SimpleItemDto[];
    }[]
  >([]);

  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      try {
        const fetched = await listFavoriteActors();
        if (!fetched.length) {
          void navigate(NEXT_PAGE);
        }
        setFavoriteActors(fetched);
      } catch (e) {
        showBoundary(e);
      } finally {
        setIsLoading(false);
      }
    };
    void setup();
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
        <Box
          style={{
            backgroundColor: "var(--green-8)",
            minHeight: "100vh",
            minWidth: "100vw",
          }}
          className="min-h-screen"
        >
          <Spinner size={"3"} />
        </Box>
      </div>
    );
  }

  return (
    <Box
      style={{ backgroundColor: "var(--purple-8)" }}
      className="min-h-screen"
    >
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              You Watched {favoriteActors.length} Actors That Appeared In
              Multiple Productions
            </Title>
          </div>

          <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
            {favoriteActors.map((actor) => (
              <ActorCard
                key={generateGuid()}
                name={actor.name}
                count={actor.count}
                details={actor.details}
                seenInMovies={actor.seenInMovies}
                seenInShows={actor.seenInShows}
              />
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
