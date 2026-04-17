import React from "react";
import { useDecades } from "@/hooks/queries/useDecades";
import { LoadingSpinner } from "../LoadingSpinner";
import PageContainer from "../PageContainer";
import { Container } from "@radix-ui/themes";
import { motion } from "motion/react";
import { Sparkles, Calendar } from "lucide-react";
import { PieChart } from "../charts/PieChart";
import { useState, useEffect } from "react";

export default function DecadeBreakdownPage() {
  const { data, isLoading } = useDecades();
  const [containerWidth, setContainerWidth] = useState(400);

  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setContainerWidth(Math.min(320, width - 40));
      } else if (width < 768) {
        setContainerWidth(Math.min(360, width - 60));
      } else {
        setContainerWidth(400);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <LoadingSpinner />;
  }

  // Filter out periods with no data
  const periodsWithData = data.periodBreakdown.filter((period) => period.count > 0);

  const chartData = periodsWithData.map((period) => ({
    name: period.period,
    minutes: period.count * 60, // Convert to minutes for chart compatibility
  }));

  const colors = ["#00f0ff", "#a855f7", "#f59e0b", "#f43f5e"] as const;

  return (
    <PageContainer>
      <Container size="4" p="4">
        <motion.div
          style={{
            textAlign: "center",
            marginBottom: "3rem",
            paddingTop: "2rem",
          }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }}
        >
          <Badge>
            <BadgeIcon>
              <Sparkles size={14} />
            </BadgeIcon>
            <span>Your Time Period</span>
          </Badge>
          <Title>Decade Breakdown</Title>
          <Subtitle>When your content was made</Subtitle>
        </motion.div>

        <ContentGrid>
          <motion.div
            style={{
              background: "rgba(18, 21, 28, 0.65)",
              backdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "24px",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <ChartTitle>Distribution by Period</ChartTitle>
            <ChartContainer>
              <PieChart
                data={chartData}
                colors={colors}
                title=""
                containerWidth={containerWidth}
              />
            </ChartContainer>
            <Legend>
              {periodsWithData.map((period, index) => (
                <LegendItem key={period.period}>
                  <LegendColor
                    style={{
                      backgroundColor: colors[index],
                    }}
                  />
                  <LegendLabel>{period.period}</LegendLabel>
                  <LegendValue>{period.percentage}%</LegendValue>
                </LegendItem>
              ))}
            </Legend>
          </motion.div>

          <motion.div
            style={{
              background: "rgba(18, 21, 28, 0.65)",
              backdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "24px",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <StatIcon>
              <Calendar size={24} />
            </StatIcon>
            <StatTitle>Average Year</StatTitle>
            <StatValue>{data.averageYear}</StatValue>
            <StatSubtext>Your content's average production year</StatSubtext>

            <Divider />

            <PersonalitySection>
              <PersonalityBadge>{data.personality}</PersonalityBadge>
              <PersonalityMessage>{data.message}</PersonalityMessage>
            </PersonalitySection>
          </motion.div>
        </ContentGrid>
      </Container>
    </PageContainer>
  );
}

const Badge = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 20px",
      background: "rgba(0, 240, 255, 0.06)",
      border: "1px solid rgba(0, 240, 255, 0.12)",
      borderRadius: "999px",
      fontSize: "0.85rem",
      fontWeight: 600,
      color: "#00f0ff",
      marginBottom: "1.5rem",
      backdropFilter: "blur(12px)",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const BadgeIcon = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "24px",
      height: "24px",
      borderRadius: "7px",
      background: "rgba(0, 240, 255, 0.15)",
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);

const Title = ({ children, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    style={{
      fontSize: "clamp(2.25rem, 6vw, 4rem)",
      fontWeight: 800,
      marginBottom: "0.5rem",
      letterSpacing: "-0.04em",
      background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 50%, #a855f7 100%)",
      backgroundSize: "200% 200%",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      animation: "gradient-flow 8s ease infinite",
      ...style,
    }}
    {...props}
  >
    {children}
  </h1>
);

const Subtitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    style={{
      fontSize: "1.15rem",
      color: "#94a3b8",
      fontWeight: 400,
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
);

const ContentGrid = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
      gap: "2rem",
      marginBottom: "3rem",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const ChartTitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    style={{
      fontSize: "1.5rem",
      fontWeight: 700,
      color: "#f8fafc",
      marginBottom: "2rem",
      textAlign: "center",
      ...style,
    }}
    {...props}
  >
    {children}
  </h2>
);

const ChartContainer = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: "2rem",
      width: "100%",
      overflow: "visible",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const Legend = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      marginTop: "2rem",
      width: "100%",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const LegendItem = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "0.75rem",
      background: "rgba(255, 255, 255, 0.02)",
      borderRadius: "12px",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const LegendColor = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      width: "20px",
      height: "20px",
      borderRadius: "4px",
      ...style,
    }}
    {...props}
  />
);

const LegendLabel = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      flex: 1,
      fontSize: "1rem",
      color: "#f8fafc",
      fontWeight: 500,
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);

const LegendValue = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      fontSize: "1rem",
      color: "#00f0ff",
      fontWeight: 700,
      fontFamily: "'JetBrains Mono', monospace",
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);

const StatIcon = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "64px",
      height: "64px",
      borderRadius: "16px",
      background: "linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)",
      border: "1px solid rgba(0, 240, 255, 0.2)",
      color: "#00f0ff",
      marginBottom: "1.5rem",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const StatTitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    style={{
      fontSize: "1.1rem",
      fontWeight: 600,
      color: "#94a3b8",
      marginBottom: "0.5rem",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      ...style,
    }}
    {...props}
  >
    {children}
  </h3>
);

const StatValue = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      fontSize: "3.5rem",
      fontWeight: 800,
      fontFamily: "'JetBrains Mono', monospace",
      color: "#00f0ff",
      textShadow: "0 0 40px rgba(0, 240, 255, 0.5)",
      marginBottom: "0.5rem",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const StatSubtext = ({ children, style, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    style={{
      fontSize: "0.9rem",
      color: "#64748b",
      marginBottom: "2rem",
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
);

const Divider = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      width: "100%",
      height: "1px",
      background: "rgba(255, 255, 255, 0.1)",
      margin: "2rem 0",
      ...style,
    }}
    {...props}
  />
);

const PersonalitySection = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const PersonalityBadge = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "inline-block",
      padding: "0.5rem 1rem",
      background: "rgba(168, 85, 247, 0.1)",
      border: "1px solid rgba(168, 85, 247, 0.2)",
      borderRadius: "8px",
      fontSize: "0.9rem",
      fontWeight: 600,
      color: "#c084fc",
      alignSelf: "center",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const PersonalityMessage = ({ children, style, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    style={{
      fontSize: "1.1rem",
      color: "#f8fafc",
      lineHeight: 1.6,
      fontStyle: "italic",
      textAlign: "center",
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
);
