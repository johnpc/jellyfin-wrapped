import { useRef } from "react";
import { Container, Grid, Box, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router-dom";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { useMinutesPlayedPerDay } from "@/hooks/queries/useMinutesPlayedPerDay";
import { useViewingPatterns } from "@/hooks/queries/useViewingPatterns";
import { LoadingSpinner } from "../LoadingSpinner";
import { LineChart } from "../charts/LineChart";
import { BarChart } from "../charts/BarChart";

const NEXT_PAGE = "/show-of-the-month";
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CHART_COLORS = {
  timeOfDay: { line: "var(--blue-11)", area: "var(--blue-5)" },
  dayOfWeek: { bar: "var(--purple-11)" },
  activity: { line: "var(--orange-11)", area: "var(--orange-5)" },
};

export default function MinutesPlayedPerDayPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    data: playbackData,
    isLoading: l1,
    error: e1,
  } = useMinutesPlayedPerDay();
  const {
    data: viewingPatterns,
    isLoading: l2,
    error: e2,
  } = useViewingPatterns();

  const firstError = e1 || e2;
  if (firstError) {
    showBoundary(firstError);
  }

  if (l1 || l2) {
    return <LoadingSpinner />;
  }

  if (!playbackData || !viewingPatterns) {
    void navigate(NEXT_PAGE);
    return null;
  }

  const containerWidth = containerRef.current?.clientWidth || 600;
  const chartWidth = Math.min(containerWidth - 40, 800);
  const chartHeight = 300;

  const sortedData = [...playbackData].sort(
    (a: { date: string }, b: { date: string }) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const activityData = sortedData.map((d: { minutes: number }, i: number) => ({
    x: i,
    y: d.minutes,
  }));

  const timeOfDayData = viewingPatterns.timeOfDay.map(
    (d: { hour: number; minutes: number }) => ({
      x: d.hour,
      y: d.minutes,
    })
  );

  const dayOfWeekData = viewingPatterns.dayOfWeek.map(
    (d: { day: number; minutes: number }) => ({
      label: dayNames[d.day],
      value: d.minutes,
    })
  );

  const totalMinutes = playbackData.reduce(
    (sum: number, d: { minutes: number }) => sum + d.minutes,
    0
  );
  const totalHours = Math.floor(totalMinutes / 60);

  return (
    <Box
      style={{ backgroundColor: "var(--indigo-8)" }}
      className="min-h-screen"
    >
      <Container size="4" p="4" ref={containerRef}>
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Your Viewing Activity
            </Title>
            <p style={{ fontSize: "1.5rem", marginTop: "1rem" }}>
              Total: {totalHours} hours
            </p>
          </div>

          <div>
            <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
              Daily Activity
            </h3>
            <LineChart
              data={activityData}
              width={chartWidth}
              height={chartHeight}
              xLabel="Days"
              yLabel="Minutes"
              lineColor={CHART_COLORS.activity.line}
              areaColor={CHART_COLORS.activity.area}
            />
          </div>

          <div>
            <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
              Time of Day
            </h3>
            <LineChart
              data={timeOfDayData}
              width={chartWidth}
              height={chartHeight}
              xLabel="Hour"
              yLabel="Minutes"
              lineColor={CHART_COLORS.timeOfDay.line}
              areaColor={CHART_COLORS.timeOfDay.area}
            />
          </div>

          <div>
            <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
              Day of Week
            </h3>
            <BarChart
              data={dayOfWeekData}
              width={chartWidth}
              height={chartHeight}
              xLabel="Day"
              yLabel="Minutes"
              barColor={CHART_COLORS.dayOfWeek.bar}
            />
          </div>
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
