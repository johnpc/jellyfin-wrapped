import {
  Container,
  Grid,
  Card,
  Text,
  Flex,
} from "@radix-ui/themes";
import { motion } from "motion/react";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { formatDuration } from "@/lib/utils";
import PageContainer from "../PageContainer";

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
  const { liveTV, isLoading } = useData();
  const { data: channels } = liveTV;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const sortedChannels = [...(channels ?? [])].sort(
    (a: { duration: number }, b: { duration: number }) =>
      b.duration - a.duration
  );

  if (!sortedChannels.length) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <motion.h1 style={{
              fontSize: "clamp(2.75rem, 8vw, 5.5rem)",
              fontWeight: 800,
              marginBottom: "1.75rem",
              lineHeight: 0.95,
              letterSpacing: "-0.05em",
              background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 35%, #a855f7 55%, #f59e0b 80%, #f43f5e 100%)",
              backgroundSize: "250% 250%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradient-flow 8s ease infinite",
              filter: "drop-shadow(0 0 50px rgba(0, 240, 255, 0.25))",
            }}>
              You Watched {sortedChannels.length} Live TV Channels
            </motion.h1>
            <p style={{ fontSize: "1.125rem", color: "var(--gray-11)", marginTop: "0.5rem" }}>
              Your live television viewing across different channels
            </p>
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
    </PageContainer>
  );
}
