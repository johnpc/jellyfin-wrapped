import React from "react";
import { Container, Grid } from "@radix-ui/themes";
import { motion } from "motion/react";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { itemVariants } from "@/lib/styled-variants";
import { format } from "date-fns";
import { SimpleItemDto } from "@/lib/queries";
import { formatWatchTime } from "@/lib/time-helpers";
import PageContainer from "../PageContainer";
import { Calendar, Clock } from "lucide-react";
import { getCurrentTimeframe } from "@/lib/timeframe";

type MonthlyShowStats = {
  month: Date;
  topShow: {
    item: SimpleItemDto;
    watchTimeMinutes: number;
  };
  totalWatchTimeMinutes: number;
};

export default function ShowOfTheMonthPage() {
  const { monthlyShowStats, isLoading } = useData();
  const { data: stats } = monthlyShowStats;
  const timeframe = getCurrentTimeframe();

  if (isLoading || !stats?.length) {
    return <LoadingSpinner />;
  }

  // Sort by month in chronological order (oldest first)
  const sortedStats = [...stats].sort(
    (a: MonthlyShowStats, b: MonthlyShowStats) => a.month.getTime() - b.month.getTime()
  );

  return (
    <PageContainer>
      <Container size="4" p="4">
        <Grid gap="6">
          <HeaderSection>
            <motion.h1 variants={itemVariants} style={{
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
              Your Top Show Each Month
            </motion.h1>
            <Subtitle>
              The show you watched the most each month in {timeframe.name}
            </Subtitle>
          </HeaderSection>

          <ContentGrid>
            {sortedStats.map((stat: MonthlyShowStats) => (
              <motion.div
                key={stat.month.toISOString()}
                style={{ background: "rgba(18, 21, 28, 0.8)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "18px", overflow: "hidden", width: "100%", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)", willChange: "transform" }}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              >
                <ImageContainer>
                  {stat.topShow.item.imageUrl ? (
                    <PosterImage
                      src={stat.topShow.item.imageUrl}
                      alt={stat.topShow.item.name ?? ""}
                    />
                  ) : (
                    <PlaceholderImage>
                      <Calendar size={32} />
                    </PlaceholderImage>
                  )}
                  <MonthBadge>
                    <Calendar size={12} />
                    <span>{format(stat.month, "MMM")}</span>
                  </MonthBadge>
                </ImageContainer>
                <CardContent>
                  <MonthLabel>{format(stat.month, "MMMM yyyy")}</MonthLabel>
                  <ShowTitle>{stat.topShow.item.name}</ShowTitle>
                  <WatchTime>
                    <Clock size={14} />
                    <span>{formatWatchTime(stat.topShow.watchTimeMinutes)}</span>
                  </WatchTime>
                </CardContent>
              </motion.div>
            ))}
          </ContentGrid>
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

const ContentGrid = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", alignItems: "stretch", justifyContent: "center", ...style }} {...props}>{children}</div>
);

const ImageContainer = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "relative", width: "100%", aspectRatio: "2/3", overflow: "hidden", ...style }} {...props}>{children}</div>
);

const PosterImage = ({ style, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img style={{ width: "100%", height: "100%", objectFit: "cover", ...style }} {...props} />
);

const PlaceholderImage = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)", color: "#64748b", ...style }} {...props}>{children}</div>
);

const MonthBadge = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", background: "rgba(0, 240, 255, 0.15)", backdropFilter: "blur(8px)", borderRadius: "10px", color: "#00f0ff", fontSize: "0.85rem", fontWeight: 600, border: "1px solid rgba(0, 240, 255, 0.2)", ...style }} {...props}>{children}</div>
);

const CardContent = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ padding: "16px 18px 20px", display: "flex", flexDirection: "column", gap: "6px", ...style }} {...props}>{children}</div>
);

const MonthLabel = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ fontSize: "0.8rem", color: "#00f0ff", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", ...style }} {...props}>{children}</span>
);

const ShowTitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", margin: 0, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", ...style }} {...props}>{children}</h3>
);

const WatchTime = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", color: "#94a3b8", marginTop: "4px", ...style }} {...props}>{children}</div>
);
