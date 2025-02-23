import { useState, useEffect } from "react";
import { listLiveTvChannels } from "@/lib/playback-reporting-queries";
import { Container, Grid, Box, Spinner, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Card, Text, Flex } from "@radix-ui/themes";
import { formatDuration } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { Title } from "../ui/styled";

interface ChannelCardProps {
  channelName: string;
  duration: number;
}

const NEXT_PAGE = "/audio";
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
  const { showBoundary } = useErrorBoundary();

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [channels, setChannels] = useState<ChannelCardProps[]>([]);

  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      try {
        const channelData = await listLiveTvChannels();
        // Sort channels by duration in descending order
        channelData.sort((a, b) => b.duration - a.duration);
        if (!channelData.length) {
          void navigate(NEXT_PAGE);
        }
        setChannels(channelData);
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
          void navigate(NEXT_PAGE);
        }}
      >
        Next
      </Button>
    </Box>
  );
}
