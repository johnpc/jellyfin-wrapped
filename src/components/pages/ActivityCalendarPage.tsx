import React from "react";
import { useData } from "@/contexts/DataContext";
import { useTimePersonality } from "@/hooks/queries/useTimePersonality";
import { LoadingSpinner } from "../LoadingSpinner";
import { PunchCardData } from "@/lib/queries";
import PageContainer from "../PageContainer";
import { Container, Grid } from "@radix-ui/themes";
import { motion } from "motion/react";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";

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
  const { data: timePersonality, isLoading: personalityLoading } = useTimePersonality();

  if (isLoading || personalityLoading) {
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
            <motion.div variants={itemVariants}>
              <Title>Your Viewing Patterns</Title>
            </motion.div>
            <Subtitle>
              When you watch content throughout the week
            </Subtitle>
          </HeaderSection>

          {timePersonality && (
            <PersonalityCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PersonalityLabel>Your Time Personality</PersonalityLabel>
              <PersonalityValue>{timePersonality.personality}</PersonalityValue>
              <PersonalitySubtext>Peak time: {timePersonality.peakTime}</PersonalitySubtext>
              <BreakdownGrid>
                <BreakdownItem>
                  <BreakdownLabel>Early Bird</BreakdownLabel>
                  <BreakdownValue>{timePersonality.breakdown.earlyBird}%</BreakdownValue>
                </BreakdownItem>
                <BreakdownItem>
                  <BreakdownLabel>Day Watcher</BreakdownLabel>
                  <BreakdownValue>{timePersonality.breakdown.dayWatcher}%</BreakdownValue>
                </BreakdownItem>
                <BreakdownItem>
                  <BreakdownLabel>Prime Timer</BreakdownLabel>
                  <BreakdownValue>{timePersonality.breakdown.primeTimer}%</BreakdownValue>
                </BreakdownItem>
                <BreakdownItem>
                  <BreakdownLabel>Night Owl</BreakdownLabel>
                  <BreakdownValue>{timePersonality.breakdown.nightOwl}%</BreakdownValue>
                </BreakdownItem>
              </BreakdownGrid>
            </PersonalityCard>
          )}

          {peakCount > 0 && (
            <PeakInfo
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <PeakLabel>Peak Viewing Time</PeakLabel>
              <PeakValue>
                {DAYS[peakDay]}s at {formatHour(peakHour)}
              </PeakValue>
              <PeakCount>{peakCount} plays</PeakCount>
            </PeakInfo>
          )}

          <ChartCard
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

const HeaderSection = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ textAlign: "center", marginBottom: "1rem", ...style }} {...props}>{children}</div>
);

const Subtitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p style={{ fontSize: "1.125rem", color: "#94a3b8", marginTop: "0.5rem", ...style }} {...props}>{children}</p>
);

const PeakInfo = ({ children, style, ...props }: React.ComponentProps<typeof motion.div>) => (
  <motion.div style={{ textAlign: "center", padding: "24px", background: "rgba(0, 240, 255, 0.05)", borderRadius: "16px", border: "1px solid rgba(0, 240, 255, 0.1)", ...style }} {...props}>{children}</motion.div>
);

const PeakLabel = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ display: "block", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", ...style }} {...props}>{children}</span>
);

const PeakValue = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ display: "block", fontSize: "1.5rem", fontWeight: 700, color: "#00f0ff", marginBottom: "4px", ...style }} {...props}>{children}</span>
);

const PeakCount = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ display: "block", fontSize: "0.9rem", color: "#94a3b8", ...style }} {...props}>{children}</span>
);

const ChartCard = ({ children, style, ...props }: React.ComponentProps<typeof motion.div>) => (
  <motion.div style={{ background: "rgba(18, 21, 28, 0.8)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "18px", padding: "24px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", overflowX: "auto", ...style }} {...props}>{children}</motion.div>
);

const ChartContainer = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ minWidth: "700px", ...style }} {...props}>{children}</div>
);

const HourLabels = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "grid", gridTemplateColumns: "60px repeat(8, 1fr)", marginBottom: "8px", ...style }} {...props}>{children}</div>
);

const EmptyCell = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ ...style }} {...props} />
);

const HourLabel = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ fontSize: "0.7rem", color: "#64748b", textAlign: "center", ...style }} {...props}>{children}</span>
);

const GridRow = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "grid", gridTemplateColumns: "60px repeat(24, 1fr)", alignItems: "center", marginBottom: "4px", ...style }} {...props}>{children}</div>
);

const DayLabel = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8", paddingRight: "12px", ...style }} {...props}>{children}</span>
);

const Cell = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "36px", ...style }} {...props}>{children}</div>
);

const Dot = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ borderRadius: "50%", transition: "all 0.2s ease", cursor: "pointer", ...style }} {...props} />
);

const Legend = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", ...style }} {...props}>{children}</div>
);

const LegendLabel = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ fontSize: "0.75rem", color: "#64748b", ...style }} {...props}>{children}</span>
);

const LegendDots = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px", ...style }} {...props}>{children}</div>
);

const LegendDot = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ borderRadius: "50%", ...style }} {...props} />
);

const PersonalityCard = ({ children, style, ...props }: React.ComponentProps<typeof motion.div>) => (
  <motion.div style={{ textAlign: "center", padding: "24px", background: "rgba(168, 85, 247, 0.05)", borderRadius: "16px", border: "1px solid rgba(168, 85, 247, 0.1)", marginBottom: "1.5rem", ...style }} {...props}>{children}</motion.div>
);

const PersonalityLabel = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ display: "block", fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", ...style }} {...props}>{children}</span>
);

const PersonalityValue = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ display: "block", fontSize: "1.75rem", fontWeight: 700, color: "#c084fc", marginBottom: "12px", ...style }} {...props}>{children}</span>
);

const PersonalitySubtext = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ display: "block", fontSize: "0.9rem", color: "#94a3b8", marginBottom: "16px", ...style }} {...props}>{children}</span>
);

const BreakdownGrid = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginTop: "16px", ...style }} {...props}>{children}</div>
);

const BreakdownItem = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "12px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px", ...style }} {...props}>{children}</div>
);

const BreakdownLabel = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ fontSize: "0.75rem", color: "#64748b", textAlign: "center", ...style }} {...props}>{children}</span>
);

const BreakdownValue = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#c084fc", fontFamily: "'JetBrains Mono', monospace", ...style }} {...props}>{children}</span>
);
