import {
  Container,
  Grid,
  Box,
  Button,
  Card,
  Text,
  Flex,
} from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { useLiveTvChannels } from "@/hooks/queries/useLiveTvChannels";
import { LoadingSpinner } from "../LoadingSpinner";
import { formatDuration } from "@/lib/utils";
import { Title } from "../ui/styled";

const NEXT_PAGE = "/audio";

function ChannelCard({
  channelName,
  duration,
}: {
  channelName: string;
  duration: number;
}) {
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
  const { data: channels, isLoading, error } = useLiveTvChannels();

  if (error) {
    showBoundary(error);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const sortedChannels = [...(channels ?? [])].sort(
    (a: { duration: number }, b: { duration: number }) =>
      b.duration - a.duration
  );

  if (!sortedChannels.length) {
    void navigate(NEXT_PAGE);
    return null;
  }

  return (
    <Box style={{ backgroundColor: "var(--blue-8)" }} className="min-h-screen">
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1}>
              You Watched {sortedChannels.length} Live TV Channels
            </Title>
          </div>

          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
            {sortedChannels.map(
              (channel: { channelName: string; duration: number }) => (
                <ChannelCard
                  key={channel.channelName}
                  channelName={channel.channelName}
                  duration={channel.duration}
                />
              )
            )}
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
