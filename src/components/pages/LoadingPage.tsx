import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMovies } from "../../hooks/queries/useMovies";
import { useShows } from "../../hooks/queries/useShows";
import { useFavoriteActors } from "../../hooks/queries/useFavoriteActors";
import { useAudio } from "../../hooks/queries/useAudio";
import { useLiveTvChannels } from "../../hooks/queries/useLiveTvChannels";
import { useUnfinishedShows } from "../../hooks/queries/useUnfinishedShows";
import { Container } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Title } from "../ui/styled";
import PageContainer from "../PageContainer";

const messages = [
  "Crunching the numbers...",
  "Analyzing your viewing habits...",
  "Counting all those binge sessions...",
  "Calculating your watch time...",
  "Finding your favorites...",
  "Tallying up the episodes...",
  "Processing your year in review...",
  "Almost there...",
];

export function LoadingPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const movies = useMovies();
  const shows = useShows();
  const actors = useFavoriteActors();
  const audio = useAudio();
  const liveTV = useLiveTvChannels();
  const unfinishedShows = useUnfinishedShows();

  const allLoaded =
    !movies.isLoading &&
    !shows.isLoading &&
    !actors.isLoading &&
    !audio.isLoading &&
    !liveTV.isLoading &&
    !unfinishedShows.isLoading;

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (allLoaded) {
      void navigate("/TopTen");
    }
  }, [allLoaded, navigate]);

  return (
    <PageContainer backgroundColor="var(--purple-8)">
      <Container size="4" style={{ minHeight: "100vh", paddingTop: "20vh", textAlign: "center" }}>
        <div>
          <Title as={motion.h1} style={{ marginBottom: "2rem" }}>
            {messages[messageIndex]}
          </Title>

          <div style={{ maxWidth: "400px", margin: "0 auto" }}>
            <div
              style={{
                width: "100%",
                height: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  backgroundColor: "white",
                  width: `${progress}%`,
                  transition: "width 0.3s ease-out",
                }}
              />
            </div>
            <p style={{ color: "white", marginTop: "1rem", fontSize: "1.2rem" }}>
              {progress}%
            </p>
          </div>
        </div>
      </Container>
    </PageContainer>
  );
}
