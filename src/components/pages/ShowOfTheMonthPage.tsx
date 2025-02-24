import { useState, useEffect } from "react";
import {
  SimpleItemDto,
  getMonthlyShowStats,
  getImageUrlById,
} from "@/lib/playback-reporting-queries";
import { Container, Grid, Box, Button, Spinner } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { itemVariants, Title } from "../ui/styled";
import { format } from "date-fns";

type MonthlyShowStats = {
  month: Date;
  topShow: {
    item: SimpleItemDto;
    watchTimeMinutes: number;
  };
  totalWatchTimeMinutes: number;
  posterUrl?: string;
};

const NEXT_PAGE = "/unfinished-shows";

const formatWatchTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours === 0) {
    return `${remainingMinutes} minutes`;
  }

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  return `${hours} ${hours === 1 ? "hour" : "hours"} ${remainingMinutes} minutes`;
};

export default function ShowOfTheMonthPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyShowStats[]>([]);

  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      try {
        const stats = await getMonthlyShowStats();

        // Fetch poster URLs for each show
        const statsWithPosters = await Promise.all(
          stats.map(async (stat) => {
            const posterUrl = stat.topShow.item.id
              ? await getImageUrlById(stat.topShow.item.id)
              : undefined;
            return { ...stat, posterUrl };
          }),
        );

        setMonthlyStats(statsWithPosters);
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
            backgroundColor: "var(--violet-8)",
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
      style={{ backgroundColor: "var(--violet-8)" }}
      className="min-h-screen"
    >
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Your Show of the Month
            </Title>
          </div>

          <Grid columns={{ initial: "1", sm: "2" }} gap="4">
            {monthlyStats.map((monthStat) => (
              <motion.div
                key={monthStat.month.toISOString()}
                variants={itemVariants}
                className="bg-white/10 rounded-lg p-6 h-full"
              >
                <h2 className="text-3xl font-bold mb-4 text-center">
                  {format(monthStat.month, "MMMM yyyy")}
                </h2>
                <div className="flex flex-col gap-6 items-center h-full">
                  {monthStat.posterUrl && (
                    <div className="w-40 h-60 flex-shrink-0">
                      <img
                        src={monthStat.posterUrl}
                        alt={`${monthStat.topShow.item.name} poster`}
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1 w-full space-y-4">
                    {monthStat.topShow.item.name && (
                      <div>
                        <h3 className="text-2xl font-bold text-yellow-400 mb-2 text-center">
                          {monthStat.topShow.item.name}
                        </h3>
                        <p className="text-lg opacity-80 text-center">
                          You watched{" "}
                          <b>
                            {formatWatchTime(
                              monthStat.topShow.watchTimeMinutes,
                            )}
                          </b>{" "}
                          of {monthStat.topShow.item.name}
                        </p>
                      </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-sm opacity-80 text-center">
                        Out of a total watch time this month of{" "}
                        <b>
                          {formatWatchTime(monthStat.totalWatchTimeMinutes)}
                        </b>
                      </p>
                    </div>
                  </div>
                </div>
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
