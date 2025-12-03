import { useEffect, useState } from "react";
import { Container, Grid, Card, Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { useMonthlyShowStats } from "@/hooks/queries/useMonthlyShowStats";
import { LoadingSpinner } from "../LoadingSpinner";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { format } from "date-fns";
import { getImageUrlById, SimpleItemDto } from "@/lib/queries";
import { formatWatchTime } from "@/lib/time-helpers";
import PageContainer from "../PageContainer";

const NEXT_PAGE = "/unfinished-shows";

type MonthlyShowStats = {
  month: Date;
  topShow: {
    item: SimpleItemDto;
    watchTimeMinutes: number;
  };
  totalWatchTimeMinutes: number;
  posterUrl?: string;
};

export default function ShowOfTheMonthPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const { data: stats, isLoading, error } = useMonthlyShowStats();
  const [statsWithPosters, setStatsWithPosters] = useState<MonthlyShowStats[]>(
    []
  );

  useEffect(() => {
    if (!stats) return;

    const fetchPosters = async () => {
      const withPosters = await Promise.all(
        stats.map(async (stat: MonthlyShowStats) => {
          const posterUrl = stat.topShow.item.id
            ? await getImageUrlById(stat.topShow.item.id)
            : undefined;
          return { ...stat, posterUrl };
        })
      );
      setStatsWithPosters(withPosters);
    };

    void fetchPosters();
  }, [stats]);

  if (error) {
    showBoundary(error);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!statsWithPosters.length) {
    void navigate(NEXT_PAGE);
    return null;
  }

  return (
    <PageContainer backgroundColor="var(--bronze-8)" nextPage={NEXT_PAGE} previousPage="/minutes-per-day">
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Your Top Show Each Month
            </Title>
            <Text size="4" color="gray" style={{ marginTop: "8px" }}>
              The show you watched the most in each month of the year
            </Text>
          </div>

          <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
            {statsWithPosters.map((stat: MonthlyShowStats) => (
              <Card key={stat.month.toISOString()}>
                {stat.posterUrl && (
                  <img
                    src={stat.posterUrl}
                    alt={stat.topShow.item.name ?? ""}
                    style={{ width: "100%", borderRadius: "8px", marginBottom: "12px" }}
                  />
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <Text size="3" weight="bold">
                    {format(stat.month, "MMMM yyyy")}
                  </Text>
                  <Text size="4" weight="bold">
                    {stat.topShow.item.name}
                  </Text>
                  <Text size="2" color="gray">
                    {formatWatchTime(stat.topShow.watchTimeMinutes)}
                  </Text>
                </div>
              </Card>
            ))}
          </Grid>
        </Grid>
      </Container>
    </PageContainer>
  );
}
