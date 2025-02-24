import { useState, useEffect } from "react";
import { listShows, SimpleItemDto } from "@/lib/playback-reporting-queries";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Container, Grid, Box, Button, Spinner } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { itemVariants, Subtitle, Title } from "../ui/styled";
import { useErrorBoundary } from "react-error-boundary";

const NEXT_PAGE = "/";
export default function OldestShowPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [show, setShow] = useState<{
    showName: string;
    episodeCount: number;
    playbackTime: number;
    item: SimpleItemDto;
  }>();

  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      try {
        const shows = await listShows();
        shows.sort((a, b) => {
          const aDate = new Date(a.item.date ?? new Date());
          const bDate = new Date(b.item.date ?? new Date());
          return aDate.getTime() - bDate.getTime();
        });
        const s = shows.find((s) => s);
        if (!s) {
          void navigate(NEXT_PAGE);
        }
        setShow(s);
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
  if (!show?.item?.id) {
    return (
      <>
        <>No shows watched.</>{" "}
        <Button
          size={"4"}
          style={{ width: "100%" }}
          onClick={() => {
            void navigate(NEXT_PAGE);
          }}
        >
          Next
        </Button>
      </>
    );
  }
  return (
    <Box
      style={{ backgroundColor: "var(--yellow-8)" }}
      className="min-h-screen"
    >
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Blast From The Past
            </Title>

            <Subtitle
              style={{ backgroundColor: "palevioletred", borderRadius: "10px" }}
              as={motion.p}
              variants={itemVariants}
            >
              {show.showName} came out on{" "}
              {new Date(show.item.date ?? new Date()).toLocaleDateString(
                undefined,
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}
            </Subtitle>
          </div>
          <MovieCard
            key={show?.item.id}
            item={show.item}
            episodeCount={show?.episodeCount}
            playbackTime={show?.playbackTime}
          />
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
