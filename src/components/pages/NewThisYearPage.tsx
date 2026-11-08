import EmptyState from "../EmptyState";
import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useErrorBoundary } from "react-error-boundary";
import { useNewThisYear } from "@/hooks/queries/useNewThisYear";
import { LoadingSpinner } from "../LoadingSpinner";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { NewLibraryItem } from "@/lib/queries";
import { getCurrentTimeframe } from "@/lib/timeframe";
import PageContainer from "../PageContainer";

const NEXT_PAGE = "/holidays";
const PREVIOUS_PAGE = "/oldest-show";
const BACKGROUND = "var(--sky-8)";
// Per section; a busy library can add hundreds of titles in a year.
const MAX_DISPLAY_ITEMS = 20;

const plural = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;

function AddedSection({
  heading,
  entries,
}: {
  heading: string;
  entries: NewLibraryItem[];
}) {
  if (!entries.length) return null;
  return (
    <div>
      <h2
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "0.5rem",
          color: "white",
        }}
      >
        {heading}
      </h2>
      {entries.length > MAX_DISPLAY_ITEMS && (
        <p style={{ color: "var(--gray-12)", marginBottom: "1rem" }}>
          Showing the first {MAX_DISPLAY_ITEMS} of {entries.length}
        </p>
      )}
      <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
        {entries.slice(0, MAX_DISPLAY_ITEMS).map((entry: NewLibraryItem) => (
          <div key={entry.item.id}>
            <MovieCard item={entry.item} />
            <p
              style={{
                textAlign: "center",
                marginTop: "0.5rem",
                fontSize: "0.875rem",
                color: "var(--gray-12)",
              }}
            >
              Added {format(entry.addedAt, "MMM d, yyyy")}
            </p>
          </div>
        ))}
      </Grid>
    </div>
  );
}

export default function NewThisYearPage() {
  const { showBoundary } = useErrorBoundary();
  const { data: added, isLoading, error } = useNewThisYear();

  if (error) {
    showBoundary(error);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const movies = added?.filter((entry) => entry.kind === "movie") ?? [];
  const shows = added?.filter((entry) => entry.kind === "show") ?? [];

  if (!movies.length && !shows.length) {
    return (
      <EmptyState
        title="Nothing New in the Library"
        message="No movies or shows were added to Jellyfin in this timeframe."
        backgroundColor={BACKGROUND}
        nextPage={NEXT_PAGE}
        previousPage={PREVIOUS_PAGE}
      />
    );
  }

  return (
    <PageContainer
      backgroundColor={BACKGROUND}
      nextPage={NEXT_PAGE}
      previousPage={PREVIOUS_PAGE}
    >
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              New This Year
            </Title>
            <p
              style={{
                fontSize: "1.125rem",
                color: "var(--gray-11)",
                marginTop: "0.5rem",
              }}
            >
              {plural(movies.length, "movie")} and{" "}
              {plural(shows.length, "show")} joined your library (
              {getCurrentTimeframe().description}), in the order they arrived
            </p>
          </div>

          <AddedSection heading="Movies" entries={movies} />
          <AddedSection heading="Shows" entries={shows} />
        </Grid>
      </Container>
    </PageContainer>
  );
}
