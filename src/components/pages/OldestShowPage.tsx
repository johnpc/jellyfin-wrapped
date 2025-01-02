import { useState, useEffect } from "react";
import { listShows, SimpleItemDto } from "@/lib/playback-reporting-queries";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Container, Grid, Box, Button, Spinner } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { styled } from "@stitches/react";
import { useNavigate } from "react-router-dom";
import { Subtitle } from "../ui/styled";
import { useErrorBoundary } from "react-error-boundary";

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
          const aDate = new Date(a.item.date!);
          const bDate = new Date(b.item.date!);
          return aDate.getTime() - bDate.getTime();
        });
        const s = shows.find((s) => s)!;
        console.log({ s });
        setShow(s);
      } catch (e) {
        showBoundary(e);
      } finally {
        setIsLoading(false);
      }
    };
    setup();
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
        <Spinner size={"3"} />
      </div>
    );
  }
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };
  const Title = styled("h1", {
    fontSize: "4rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    background: "linear-gradient(90deg, #FFD700 0%, #00E1FF 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 0 30px rgba(255, 215, 0, 0.3)",
  });
  if (!show?.item?.id) {
    return (
      <>
        <>No shows watched.</>{" "}
        <Button
          size={"4"}
          style={{ width: "100%" }}
          onClick={() => {
            navigate("/actors");
          }}
        >
          Review Favorite Actors
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
              {show!.showName} came out on{" "}
              {new Date(show!.item.date!).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Subtitle>
          </div>
          <MovieCard
            key={show?.item.id}
            item={show!.item}
            episodeCount={show?.episodeCount}
            playbackTime={show?.playbackTime}
          />
        </Grid>
      </Container>
      <Button
        size={"4"}
        style={{ width: "100%" }}
        onClick={() => {
          navigate("/actors");
        }}
      >
        Review Favorite Actors
      </Button>
    </Box>
  );
}
