import { useEffect, useState } from "react";
import { Container, Box, Progress, Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Title } from "../ui/styled";
import { listMovies, listShows, listAudio, listLiveTvChannels } from "@/lib/queries";

const MESSAGES = [
  "Crunching the numbers...",
  "Analyzing your viewing habits...",
  "Counting all those episodes...",
  "Tallying up your watch time...",
  "Finding your favorites...",
  "Almost there...",
];

export default function LoadingDataPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(MESSAGES[0]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const tasks = [
          listMovies(),
          listShows(),
          listAudio(),
          listLiveTvChannels(),
        ];

        let completed = 0;
        const updateProgress = () => {
          completed++;
          if (mounted) {
            setProgress((completed / tasks.length) * 100);
            if (completed < MESSAGES.length) {
              setMessage(MESSAGES[completed]);
            }
          }
        };

        // Execute tasks and update progress as each completes
        await Promise.all(tasks.map(task => task.then(updateProgress)));

        if (mounted) {
          setIsComplete(true);
          setTimeout(() => {
            void navigate("/movies");
          }, 500);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <Box
      style={{ backgroundColor: "var(--indigo-9)" }}
      className="min-h-screen flex items-center justify-center"
    >
      <Container size="2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box p="6" style={{ textAlign: "center" }}>
            <Title style={{ color: "white", marginBottom: "2rem" }}>
              {isComplete ? "Ready!" : message}
            </Title>
            <Progress value={progress} size="3" />
            <Text size="2" style={{ color: "white", marginTop: "1rem", display: "block" }}>
              {Math.round(progress)}%
            </Text>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
