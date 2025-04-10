import { useState, useEffect } from "react";
import { listMovies, listShows, SimpleItemDto } from "@/lib/playback-reporting-queries";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Container, Grid, Spinner, Tabs, Box } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { itemVariants, Title } from "../ui/styled";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import PageContainer from "../PageContainer";

const NEXT_PAGE = "/movies";

export default function TopTenPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [topMovies, setTopMovies] = useState<SimpleItemDto[]>([]);
  const [topShows, setTopShows] = useState<{
    showName: string;
    episodeCount: number;
    playbackTime: number;
    item: SimpleItemDto;
  }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch movies and shows in parallel
        const [movies, shows] = await Promise.all([
          listMovies(),
          listShows()
        ]);
        
        // Take only the top 10 movies
        setTopMovies(movies.slice(0, 10));
        
        // Take only the top 10 shows
        setTopShows(shows.slice(0, 10));
      } catch (error) {
        showBoundary(error);
      } finally {
        setIsLoading(false);
      }
    };
    
    void fetchData();
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "var(--blue-8)",
        }}
      >
        <Spinner size={"3"} />
      </div>
    );
  }

  return (
    <PageContainer backgroundColor="var(--blue-8)" nextPage={NEXT_PAGE}>
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Your Top 10 Movies & Shows
            </Title>
          </div>

          <Tabs.Root defaultValue="movies">
            <Tabs.List>
              <Tabs.Trigger value="movies">Top 10 Movies</Tabs.Trigger>
              <Tabs.Trigger value="shows">Top 10 Shows</Tabs.Trigger>
            </Tabs.List>
            
            <Box pt="4">
              <Tabs.Content value="movies">
                <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
                  {topMovies.map((movie, index) => (
                    <div key={movie.id} className="relative">
                      <div className="absolute top-0 left-0 bg-blue-600 text-white font-bold rounded-br-lg px-3 py-1 z-10">
                        #{index + 1}
                      </div>
                      <MovieCard item={movie} />
                    </div>
                  ))}
                </Grid>
                
                {topMovies.length === 0 && (
                  <div className="text-center p-8">
                    <p>No movies found in your watch history.</p>
                  </div>
                )}
              </Tabs.Content>
              
              <Tabs.Content value="shows">
                <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
                  {topShows.map((show, index) => (
                    <div key={show.item.id} className="relative">
                      <div className="absolute top-0 left-0 bg-blue-600 text-white font-bold rounded-br-lg px-3 py-1 z-10">
                        #{index + 1}
                      </div>
                      <MovieCard 
                        item={show.item} 
                        episodeCount={show.episodeCount}
                        playbackTime={show.playbackTime}
                      />
                    </div>
                  ))}
                </Grid>
                
                {topShows.length === 0 && (
                  <div className="text-center p-8">
                    <p>No shows found in your watch history.</p>
                  </div>
                )}
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </Grid>
      </Container>
    </PageContainer>
  );
}
