import { useEffect, useState } from "react";
import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { format } from "date-fns";
import { getImageUrlById, SimpleItemDto } from "@/lib/queries";
import { formatWatchTime } from "@/lib/time-helpers";
import PageContainer from "../PageContainer";
import { styled } from "@stitches/react";
import { Calendar, Clock } from "lucide-react";

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
  const { monthlyShowStats, isLoading } = useData();
  const { data: stats } = monthlyShowStats;
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!statsWithPosters.length) {
    return <LoadingSpinner />;
  }

  // Sort by month in chronological order (oldest first)
  const sortedStats = [...statsWithPosters].sort(
    (a, b) => a.month.getTime() - b.month.getTime()
  );

  return (
    <PageContainer>
      <Container size="4" p="4">
        <Grid gap="6">
          <HeaderSection>
            <Title as={motion.h1} variants={itemVariants}>
              Your Top Show Each Month
            </Title>
            <Subtitle>
              The show you watched the most in each month of the year
            </Subtitle>
          </HeaderSection>

          <ContentGrid>
            {sortedStats.map((stat: MonthlyShowStats) => (
              <ShowCard
                key={stat.month.toISOString()}
                as={motion.div}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <ImageContainer>
                  {stat.posterUrl ? (
                    <PosterImage
                      src={stat.posterUrl}
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
              </ShowCard>
            ))}
          </ContentGrid>
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

const ContentGrid = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  gap: "1.5rem",
  justifyContent: "center",
  alignItems: "flex-start",
});

const ShowCard = styled("div", {
  background: "rgba(18, 21, 28, 0.8)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  borderRadius: "18px",
  overflow: "hidden",
  width: "280px",
  flexShrink: 0,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",

  "&:hover": {
    borderColor: "rgba(0, 240, 255, 0.15)",
    boxShadow: "0 8px 32px rgba(0, 240, 255, 0.1)",
  },
  
  "@media (max-width: 640px)": {
    width: "100%",
    maxWidth: "320px",
  },
});

const ImageContainer = styled("div", {
  position: "relative",
  width: "100%",
  aspectRatio: "2/3",
  overflow: "hidden",
});

const PosterImage = styled("img", {
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

const PlaceholderImage = styled("div", {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
  color: "#64748b",
});

const MonthBadge = styled("div", {
  position: "absolute",
  top: "12px",
  right: "12px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "8px 12px",
  background: "rgba(0, 240, 255, 0.15)",
  backdropFilter: "blur(8px)",
  borderRadius: "10px",
  color: "#00f0ff",
  fontSize: "0.85rem",
  fontWeight: 600,
  border: "1px solid rgba(0, 240, 255, 0.2)",
});

const CardContent = styled("div", {
  padding: "16px 18px 20px",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
});

const MonthLabel = styled("span", {
  fontSize: "0.8rem",
  color: "#00f0ff",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
});

const ShowTitle = styled("h3", {
  fontSize: "1.1rem",
  fontWeight: 700,
  color: "#f8fafc",
  margin: 0,
  lineHeight: 1.3,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

const WatchTime = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "0.9rem",
  color: "#94a3b8",
  marginTop: "4px",
  
  "& svg": {
    color: "#64748b",
  },
});
