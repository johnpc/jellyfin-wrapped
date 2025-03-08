import { useState, useEffect } from "react";
import {
  UnfinishedShowDto,
  getUnfinishedShows,
  getImageUrlById,
} from "@/lib/playback-reporting-queries";
import { Container, Grid, Box, Button, Spinner } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { itemVariants, Title } from "../ui/styled";
import { format } from "date-fns";

const NEXT_PAGE = "/device-stats";

type ShowWithPoster = UnfinishedShowDto & {
  posterUrl?: string;
};

export default function UnfinishedShowsPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [unfinishedShows, setUnfinishedShows] = useState<ShowWithPoster[]>([]);

  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      try {
        const shows = await getUnfinishedShows();

        // Fetch poster URLs for each show
        const showsWithPosters = await Promise.all(
          shows.map(async (show) => {
            const posterUrl = show.item.id
              ? await getImageUrlById(show.item.id)
              : undefined;
            return { ...show, posterUrl };
          }),
        );

        setUnfinishedShows(showsWithPosters);
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
            backgroundColor: "var(--violet-8)",
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
      style={{ backgroundColor: "var(--violet-8)" }}
      className="min-h-screen"
    >
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Shows You Never Finished
            </Title>
          </div>

          <Grid columns={{ initial: "2", sm: "2" }} gap="4" align={"center"}>
            {unfinishedShows.slice(0, 20).map((show) => (
              <motion.div
                key={show.item.id}
                variants={itemVariants}
                className="bg-white/10 rounded-lg p-6"
                style={{
                  textAlign: "center",
                }}
              >
                <div className="flex flex-col gap-6 items-center">
                  {show.posterUrl && (
                    <div className="w-40 h-60 flex-shrink-0">
                      <img
                        src={show.posterUrl}
                        alt={`${show.item.name} poster`}
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                        style={{
                          width: "50%",
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 w-full space-y-4">
                    <h3 className="text-2xl font-bold text-yellow-400 text-center">
                      {show.item.name}
                    </h3>
                    <p className="text-lg opacity-80 text-center">
                      You watched <b>{show.watchedEpisodes}</b> out of{" "}
                      <b>{show.totalEpisodes}</b> episodes
                    </p>
                    <p className="text-sm opacity-60 text-center">
                      Last watched on{" "}
                      {format(show.lastWatchedDate, "MMMM d, yyyy")}
                    </p>
                  </div>
                  <hr />
                </div>
              </motion.div>
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
