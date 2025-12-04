import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { PunchCardData } from "@/lib/queries";
import PageContainer from "../PageContainer";
import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { styled } from "@stitches/react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Create a 7x24 grid with count data
const createPunchCardGrid = (data: PunchCardData[]): number[][] => {
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  
  data.forEach((point) => {
    if (point.dayOfWeek >= 0 && point.dayOfWeek < 7 && point.hour >= 0 && point.hour < 24) {
      grid[point.dayOfWeek][point.hour] = point.count;
    }
  });
  
  return grid;
};

// Find the max count for normalization
const getMaxCount = (grid: number[][]): number => {
  let max = 0;
  grid.forEach(row => {
    row.forEach(count => {
      if (count > max) max = count;
    });
  });
  return max || 1;
};

// Get color intensity based on count
const getColor = (count: number, maxCount: number): string => {
  if (count === 0) return "rgba(255, 255, 255, 0.03)";
  const intensity = count / maxCount;
  // Gradient from dim cyan to bright cyan
  const alpha = 0.15 + (intensity * 0.85);
  return `rgba(0, 240, 255, ${alpha})`;
};

// Get size based on count
const getSize = (count: number, maxCount: number): number => {
  if (count === 0) return 4;
  const intensity = count / maxCount;
  return 8 + (intensity * 24); // Size between 8 and 32
};

export default function ActivityCalendarPage() {
  const { punchCard, isLoading } = useData();
  const { data } = punchCard;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const grid = createPunchCardGrid(data ?? []);
  const maxCount = getMaxCount(grid);

  // Find peak viewing time
  let peakDay = 0;
  let peakHour = 0;
  let peakCount = 0;
  grid.forEach((row, dayIndex) => {
    row.forEach((count, hourIndex) => {
      if (count > peakCount) {
        peakCount = count;
        peakDay = dayIndex;
        peakHour = hourIndex;
      }
    });
  });

  const formatHour = (hour: number) => {
    if (hour === 0) return "12am";
    if (hour === 12) return "12pm";
    return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
  };

  return (
    <PageContainer>
      <Container size="4" p="4">
        <Grid gap="6">
          <HeaderSection>
            <Title as={motion.h1} variants={itemVariants}>
              Your Viewing Patterns
            </Title>
            <Subtitle>
              When you watch content throughout the week
            </Subtitle>
          </HeaderSection>

          {peakCount > 0 && (
            <PeakInfo
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PeakLabel>Peak Viewing Time</PeakLabel>
              <PeakValue>
                {DAYS[peakDay]}s at {formatHour(peakHour)}
              </PeakValue>
              <PeakCount>{peakCount} plays</PeakCount>
            </PeakInfo>
          )}

          <ChartCard
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ChartContainer>
              {/* Hour labels at top */}
              <HourLabels>
                <EmptyCell />
                {HOURS.filter((_, i) => i % 3 === 0).map(hour => (
                  <HourLabel key={hour} style={{ gridColumn: `span 3` }}>
                    {formatHour(hour)}
                  </HourLabel>
                ))}
              </HourLabels>

              {/* Grid rows */}
              {DAYS.map((day, dayIndex) => (
                <GridRow key={day}>
                  <DayLabel>{day}</DayLabel>
                  {HOURS.map(hour => {
                    const count = grid[dayIndex][hour];
                    return (
                      <Cell key={`${dayIndex}-${hour}`}>
                        <Dot
                          style={{
                            width: `${getSize(count, maxCount)}px`,
                            height: `${getSize(count, maxCount)}px`,
                            backgroundColor: getColor(count, maxCount),
                            boxShadow: count > 0 ? `0 0 ${8 + (count / maxCount) * 16}px rgba(0, 240, 255, ${0.2 + (count / maxCount) * 0.3})` : 'none',
                          }}
                          title={`${day} ${formatHour(hour)}: ${count} plays`}
                        />
                      </Cell>
                    );
                  })}
                </GridRow>
              ))}
            </ChartContainer>

            <Legend>
              <LegendLabel>Less</LegendLabel>
              <LegendDots>
                {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
                  <LegendDot
                    key={i}
                    style={{
                      backgroundColor: getColor(intensity * 10, 10),
                      width: `${8 + intensity * 16}px`,
                      height: `${8 + intensity * 16}px`,
                    }}
                  />
                ))}
              </LegendDots>
              <LegendLabel>More</LegendLabel>
            </Legend>
          </ChartCard>
        </Grid>
      </Container>
    </PageContainer>
  );
}

const HeaderSection = styled("div", {
  textAlign: "center",
  marginBottom: "1rem",
});

const Subtitle = styled("p", {
  fontSize: "1.125rem",
  color: "#94a3b8",
  marginTop: "0.5rem",
});

const PeakInfo = styled("div", {
  textAlign: "center",
  padding: "24px",
  background: "rgba(0, 240, 255, 0.05)",
  borderRadius: "16px",
  border: "1px solid rgba(0, 240, 255, 0.1)",
});

const PeakLabel = styled("span", {
  display: "block",
  fontSize: "0.85rem",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "8px",
});

const PeakValue = styled("span", {
  display: "block",
  fontSize: "1.5rem",
  fontWeight: 700,
  color: "#00f0ff",
  marginBottom: "4px",
});

const PeakCount = styled("span", {
  display: "block",
  fontSize: "0.9rem",
  color: "#94a3b8",
});

const ChartCard = styled("div", {
  background: "rgba(18, 21, 28, 0.8)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  borderRadius: "18px",
  padding: "24px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  overflowX: "auto",
});

const ChartContainer = styled("div", {
  minWidth: "700px",
});

const HourLabels = styled("div", {
  display: "grid",
  gridTemplateColumns: "60px repeat(8, 1fr)",
  marginBottom: "8px",
});

const EmptyCell = styled("div", {});

const HourLabel = styled("span", {
  fontSize: "0.7rem",
  color: "#64748b",
  textAlign: "center",
});

const GridRow = styled("div", {
  display: "grid",
  gridTemplateColumns: "60px repeat(24, 1fr)",
  alignItems: "center",
  marginBottom: "4px",
});

const DayLabel = styled("span", {
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#94a3b8",
  paddingRight: "12px",
});

const Cell = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "36px",
});

const Dot = styled("div", {
  borderRadius: "50%",
  transition: "all 0.2s ease",
  cursor: "pointer",
  
  "&:hover": {
    transform: "scale(1.3)",
  },
});

const Legend = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  marginTop: "24px",
  paddingTop: "16px",
  borderTop: "1px solid rgba(255, 255, 255, 0.05)",
});

const LegendLabel = styled("span", {
  fontSize: "0.75rem",
  color: "#64748b",
});

const LegendDots = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "6px",
});

const LegendDot = styled("div", {
  borderRadius: "50%",
});
