import EmptyState from "../EmptyState";
import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useErrorBoundary } from "react-error-boundary";
import { useFirstWatched } from "@/hooks/queries/useFirstWatched";
import { LoadingSpinner } from "../LoadingSpinner";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Subtitle, Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import PageContainer from "../PageContainer";

const NEXT_PAGE = "/movies";
const PREVIOUS_PAGE = "/TopTen";

export default function FirstWatchedPage() {
  const { showBoundary } = useErrorBoundary();
  const { data: first, isLoading, error } = useFirstWatched();

  if (error) {
    showBoundary(error);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!first) {
    return (
      <EmptyState
        title="Nothing Watched Yet"
        backgroundColor="var(--mint-8)"
        nextPage={NEXT_PAGE}
        previousPage={PREVIOUS_PAGE}
      />
    );
  }

  return (
    <PageContainer
      backgroundColor="var(--mint-8)"
      nextPage={NEXT_PAGE}
      previousPage={PREVIOUS_PAGE}
    >
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Where It Started
            </Title>
            <p
              style={{
                fontSize: "1.125rem",
                color: "var(--gray-11)",
                marginTop: "0.5rem",
              }}
            >
              The first {first.kind === "movie" ? "movie" : "show"} you watched
            </p>
            <Subtitle as={motion.p} variants={itemVariants}>
              {format(first.watchedAt, "MMMM d, yyyy")}
              {first.kind === "show" && first.episodeName
                ? ` · ${first.episodeName}`
                : ""}
            </Subtitle>
          </div>

          <Grid
            columns={{ initial: "1", sm: "1", md: "1", lg: "1" }}
            gap="4"
            style={{ justifyItems: "center" }}
          >
            <MovieCard item={first.item} />
          </Grid>
        </Grid>
      </Container>
    </PageContainer>
  );
}
