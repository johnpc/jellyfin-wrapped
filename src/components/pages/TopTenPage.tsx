import { useState, useEffect } from "react";
import { Container, Grid, Spinner, Tabs } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { itemVariants, Title } from "../ui/styled";
import { useErrorBoundary } from "react-error-boundary";
import PageContainer from "../PageContainer";
import { listMovies, listShows, SimpleItemDto } from "@/lib/playback-reporting-queries";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { generateGuid } from "@/lib/utils";
import { getCachedHiddenIds, setCachedHiddenId } from "@/lib/cache";

const NEXT_PAGE = "/movies";

export default function TopTenPage() {
  const { showBoundary } = useErrorBoundary();
  const [isLoading, setIsLoading] = useState(true);
  const [topMovies, setTopMovies] = useState<SimpleItemDto[]>([]);
  const [topShows, setTopShows] = useState<{
    showName: string;
    episodeCount: number;
    playbackTime: number;
    item: SimpleItemDto;
  }[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>(getCachedHiddenIds());
  const [activeTab, setActiveTab] = useState("movies");
  console.log({activeTab});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch movies and shows in parallel
        const [moviesData, showsData] = await Promise.all([
          listMovies(),
          listShows()
        ]);

        // Filter out hidden items and take top 10
        const filteredMovies = moviesData
          .filter(movie => !hiddenIds.includes(movie.id ?? ""))
          .slice(0, 10);

        const filteredShows = showsData
          .filter(show => !hiddenIds.includes(show.item.id ?? ""))
          .slice(0, 10);

        setTopMovies(filteredMovies);
        setTopShows(filteredShows);
      } catch (error) {
        showBoundary(error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [hiddenIds]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "var(--cyan-8)",
        }}
      >
        <Spinner size={"3"} />
      </div>
    );
  }

  const handleHideMovie = (id: string) => {
    setCachedHiddenId(id);
    setHiddenIds([...hiddenIds, id]);
  };

  const handleHideShow = (id: string) => {
    setCachedHiddenId(id);
    setHiddenIds([...hiddenIds, id]);
  };

  return (
    <PageContainer backgroundColor="var(--cyan-8)" nextPage={NEXT_PAGE}>
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Your Top 10 of the Year
            </Title>
          </div>

          <Tabs.Root defaultValue="movies" onValueChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Trigger value="movies">Movies</Tabs.Trigger>
              <Tabs.Trigger value="shows">TV Shows</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="movies">
              <div style={{ marginTop: "20px" }}>
                <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
                  {topMovies.map((movie, index) => (
                    <div key={generateGuid()}>
                      <div style={{
                        position: "relative",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                        marginBottom: "-15px",
                        zIndex: 1,
                        marginLeft: "10px"
                      }}>
                        #{index + 1}
                      </div>
                      <MovieCard
                        item={movie}
                        onHide={() => handleHideMovie(movie.id ?? "")}
                      />
                    </div>
                  ))}
                </Grid>
                {topMovies.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <p>No movie data available for this timeframe.</p>
                  </div>
                )}
              </div>
            </Tabs.Content>

            <Tabs.Content value="shows">
              <div style={{ marginTop: "20px" }}>
                <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
                  {topShows.map((show, index) => (
                    <div key={generateGuid()}>
                      <div style={{
                        position: "relative",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                        marginBottom: "-15px",
                        zIndex: 1,
                        marginLeft: "10px"
                      }}>
                        #{index + 1}
                      </div>
                      <MovieCard
                        item={show.item}
                        onHide={() => handleHideShow(show.item.id ?? "")}
                      />
                    </div>
                  ))}
                </Grid>
                {topShows.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <p>No TV show data available for this timeframe.</p>
                  </div>
                )}
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </Grid>
      </Container>
    </PageContainer>
  );
}
