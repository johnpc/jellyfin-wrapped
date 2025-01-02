import { useState, useEffect } from "react";
import { listLiveTvChannels } from "@/lib/playback-reporting-queries";
import { Container, Grid, Box, Spinner, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { styled } from "@stitches/react";
import { Card, Text, Flex } from "@radix-ui/themes";
import { formatDuration } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface ChannelCardProps {
  channelName: string;
  duration: number;
}

export function ChannelCard({ channelName, duration }: ChannelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card size="2">
        <Flex direction="column" gap="2">
          <Text size="5" weight="bold">
            {channelName}
          </Text>
          <Text size="2" color="gray">
            Watch time: {formatDuration(duration)}
          </Text>
        </Flex>
      </Card>
    </motion.div>
  );
}

export default function LiveTvReviewPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [channels, setChannels] = useState<ChannelCardProps[]>([]);

  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      const channelData = await listLiveTvChannels();
      // Sort channels by duration in descending order
      channelData.sort((a, b) => b.duration - a.duration);
      setChannels(channelData);
      setIsLoading(false);
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

  const Title = styled("h1", {
    fontSize: "4rem",
    fontWeight: "bold",
    marginBottom: "1rem",
    background: "linear-gradient(90deg, #FFD700 0%, #00E1FF 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 0 30px rgba(255, 215, 0, 0.3)",
  });

  return (
    <Box style={{ backgroundColor: "var(--green-8)" }} className="min-h-screen">
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1}>
              You Watched {channels.length} Live TV Channels This Year
            </Title>
          </div>

          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
            {channels.map((channel) => (
              <ChannelCard
                key={channel.channelName}
                channelName={channel.channelName}
                duration={channel.duration}
              />
            ))}
          </Grid>
        </Grid>
      </Container>
      <Button
        size={"4"}
        style={{ width: "100%" }}
        onClick={() => {
          navigate("/audio");
        }}
      >
        Review Audio
      </Button>
    </Box>
  );
}
