import { useState, useEffect } from "react";
import {
  listMovies,
  listShows,
  SimpleItemDto,
} from "@/lib/playback-reporting-queries";
import {
  Container,
  Grid,
  Box,
  Spinner,
  Button,
  Text,
  Card,
  Flex,
  Avatar,
} from "@radix-ui/themes";
import { motion } from "framer-motion";
import { itemVariants, Title } from "../ui/styled";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { getImageUrlById } from "@/lib/playback-reporting-queries";

type TopContent = {
  item: SimpleItemDto;
  type: "movie" | "show";
};

const NEXT_PAGE = "/actors";

// Fallback image component that handles loading errors
function ContentImage({ item }: { item: SimpleItemDto }) {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const url = await getImageUrlById(item.id ?? "");
        setImageUrl(url);
      } catch (error) {
        console.error("Failed to fetch image URL:", error);
      }
    };

    void fetchImageUrl();
  }, [item]);

  return (
    <Avatar
      size="8"
      src={imageUrl}
      fallback={item.name?.[0] || "?"}
      // className="w-full h-full"
      style={{
        // borderRadius: 0,
        aspectRatio: "2/3",
        width: "30%",
        height: "100%",
      }}
    />
  );
}

export default function CriticallyAcclaimedPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [topContent, setTopContent] = useState<TopContent[]>([]);

  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      try {
        // Get movies and shows
        const movies = await listMovies();
        const shows = await listShows();

        // Filter and sort by community rating
        const topMovie = movies
          .filter((movie) => movie.communityRating != null && movie.id != null)
          .sort(
            (a, b) => (b.communityRating ?? 0) - (a.communityRating ?? 0),
          )[0];

        const topShow = shows
          ?.filter(
            (show) => show.item.communityRating != null && show.item.id != null,
          )
          .sort(
            (a, b) =>
              (b.item.communityRating ?? 0) - (a.item.communityRating ?? 0),
          )[0]?.item;

        const content: TopContent[] = [];
        if (topMovie) content.push({ item: topMovie, type: "movie" });
        if (topShow) content.push({ item: topShow, type: "show" });

        setTopContent(content);

        if (!content.length) {
          void navigate(NEXT_PAGE);
        }
      } catch (error) {
        showBoundary(error);
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
            backgroundColor: "var(--yellow-8)",
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
      style={{ backgroundColor: "var(--yellow-8)" }}
      className="min-h-screen"
    >
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Your Most Critically Acclaimed Content
            </Title>
          </div>

          <Grid columns="1" gap="4">
            {topContent.map((content) => (
              <motion.div
                key={content.item.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <Card size="3">
                  <Flex gap="4" align="center">
                    <ContentImage item={content.item ?? ""} />
                    <Box>
                      <Grid gap="3">
                        <Box>
                          <Text
                            size="4"
                            color="gray"
                            style={{ display: "block" }}
                          >
                            {content.type.charAt(0).toUpperCase() +
                              content.type.slice(1)}
                          </Text>
                          <Text size="6" weight="bold">
                            {content.item.name}
                          </Text>
                        </Box>

                        <Flex direction="column" gap="2">
                          <Text size="4">
                            Year: {content.item.productionYear}
                          </Text>
                          <Text size="4" color="yellow" weight="bold">
                            Rating: ⭐{" "}
                            {content.item.communityRating?.toFixed(1)}/10
                          </Text>
                        </Flex>
                      </Grid>
                    </Box>
                  </Flex>
                </Card>
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
