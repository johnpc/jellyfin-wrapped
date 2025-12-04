import {
  Container,
  Grid,
  Card,
  Text,
  Flex,
} from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { formatDuration } from "@/lib/utils";
import { Title } from "../ui/styled";
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
            <Title as={motion.h1}>
              You Watched {sortedChannels.length} Live TV Channels
            </Title>
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
