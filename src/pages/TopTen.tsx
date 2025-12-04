import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ContentImage } from "@/components/ContentImage";
import { RankBadge } from "@/components/RankBadge";
import { formatWatchTime } from "@/lib/time-helpers";
import { SimpleItemDto } from "@/lib/queries";
import PageContainer from "@/components/PageContainer";
import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { styled } from "@stitches/react";
import { Film, Tv, Sparkles } from "lucide-react";

export const TopTen = () => {
  const year = new Date().getFullYear();
  const { topTen, isLoading } = useData();
  const { data, error } = topTen;

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error loading top ten</div>;
  if (!data) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <PageContainer>
      <Container size="4" p="4">
        <Grid gap="6">
          <HeaderSection
            as={motion.div}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <HeaderBadge>
              <BadgeIcon>
                <Sparkles size={14} />
              </BadgeIcon>
              <span>Your Top Picks</span>
            </HeaderBadge>
            <PageTitle>Your Top 10 of {year}</PageTitle>
            <PageSubtitle>The content that defined your year</PageSubtitle>
          </HeaderSection>

          <Grid columns={{ initial: "1", md: "2" }} gap="6">
            <SectionCard
              as={motion.div}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <CardAccent variant="movies" />
              <SectionHeader>
                <SectionIcon movie>
                  <Film size={20} />
                </SectionIcon>
                <SectionTitleWrapper>
                  <SectionTitle>Top Movies</SectionTitle>
                  <SectionSubtitle>Most watched films</SectionSubtitle>
                </SectionTitleWrapper>
              </SectionHeader>
              <ItemList>
                {data.movies.map((movie: SimpleItemDto & { completedWatches?: number }, index: number) => (
                  <RankItem
                    key={movie.id}
                    as={motion.div}
                    variants={itemVariants}
                  >
                    <RankBadge rank={index + 1} />
                    <ItemPoster>
                      <ContentImage item={movie} />
                    </ItemPoster>
                    <ItemInfo>
                      <ItemTitle>{movie.name}</ItemTitle>
                      <ItemMeta>
                        <MetaHighlight>{movie.completedWatches ?? 1}x</MetaHighlight> watched • {formatWatchTime((movie.durationSeconds ?? 0) / 60)}
                      </ItemMeta>
                    </ItemInfo>
                  </RankItem>
                ))}
              </ItemList>
            </SectionCard>

            <SectionCard
              as={motion.div}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <CardAccent variant="shows" />
              <SectionHeader>
                <SectionIcon>
                  <Tv size={20} />
                </SectionIcon>
                <SectionTitleWrapper>
                  <SectionTitle>Top Shows</SectionTitle>
                  <SectionSubtitle>Binge-worthy series</SectionSubtitle>
                </SectionTitleWrapper>
              </SectionHeader>
              <ItemList>
                {data.shows.map(
                  (
                    show: {
                      item: SimpleItemDto;
                      episodeCount: number;
                      playbackTime: number;
                    },
                    index: number
                  ) => (
                    <RankItem
                      key={show.item.id}
                      as={motion.div}
                      variants={itemVariants}
                    >
                      <RankBadge rank={index + 1} />
                      <ItemPoster>
                        <ContentImage item={show.item} />
                      </ItemPoster>
                      <ItemInfo>
                        <ItemTitle>{show.item.name}</ItemTitle>
                        <ItemMeta>
                          <MetaHighlight>{show.episodeCount}</MetaHighlight> episodes • {formatWatchTime(show.playbackTime / 60)}
                        </ItemMeta>
                      </ItemInfo>
                    </RankItem>
                  )
                )}
              </ItemList>
            </SectionCard>
          </Grid>
        </Grid>
      </Container>
    </PageContainer>
  );
};

const HeaderSection = styled("div", {
  textAlign: "center",
  marginBottom: "1.5rem",
  paddingTop: "3rem",
});

const HeaderBadge = styled("div", {
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
  marginBottom: "1.75rem",
  backdropFilter: "blur(12px)",
});

const BadgeIcon = styled("span", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "24px",
  height: "24px",
  borderRadius: "7px",
  background: "rgba(0, 240, 255, 0.15)",
});

const PageTitle = styled("h1", {
  fontSize: "clamp(2.25rem, 6vw, 4rem)",
  fontWeight: 800,
  marginBottom: "0.85rem",
  letterSpacing: "-0.04em",
  background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 50%, #a855f7 100%)",
  backgroundSize: "200% 200%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "gradient-flow 8s ease infinite",
});

const PageSubtitle = styled("p", {
  fontSize: "1.15rem",
  color: "#94a3b8",
  fontWeight: 400,
});

const SectionCard = styled("div", {
  background: "rgba(18, 21, 28, 0.65)",
  backdropFilter: "blur(24px) saturate(180%)",
  border: "1px solid rgba(255, 255, 255, 0.03)",
  borderRadius: "28px",
  padding: "32px",
  position: "relative",
  overflow: "hidden",
});

const CardAccent = styled("div", {
  position: "absolute",
  top: 0,
  left: "50%",
  transform: "translateX(-50%)",
  width: "35%",
  height: "2px",
  background: "linear-gradient(90deg, transparent, #a855f7, transparent)",
  
  variants: {
    variant: {
      movies: {
        background: "linear-gradient(90deg, transparent, #00f0ff, transparent)",
      },
      shows: {
        background: "linear-gradient(90deg, transparent, #a855f7, transparent)",
      },
    },
  },
});

const SectionHeader = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "1.75rem",
});

const SectionIcon = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "52px",
  height: "52px",
  borderRadius: "16px",
  color: "#030304",
  
  background: "linear-gradient(135deg, #a855f7 0%, #c084fc 100%)",
  boxShadow: "0 6px 24px rgba(168, 85, 247, 0.35)",
  
  variants: {
    movie: {
      true: {
        background: "linear-gradient(135deg, #00f0ff 0%, #22d3ee 100%)",
        boxShadow: "0 6px 24px rgba(0, 240, 255, 0.35)",
      },
    },
  },
});

const SectionTitleWrapper = styled("div", {
  display: "flex",
  flexDirection: "column",
});

const SectionTitle = styled("h2", {
  fontSize: "1.6rem",
  fontWeight: 700,
  color: "#f8fafc",
  letterSpacing: "-0.02em",
  marginBottom: "2px",
});

const SectionSubtitle = styled("span", {
  fontSize: "0.85rem",
  color: "#475569",
  fontWeight: 500,
});

const ItemList = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
});

const RankItem = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  padding: "14px 18px",
  background: "rgba(255, 255, 255, 0.015)",
  border: "1px solid rgba(255, 255, 255, 0.02)",
  borderRadius: "16px",
  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  
  "&:hover": {
    background: "rgba(0, 240, 255, 0.04)",
    borderColor: "rgba(0, 240, 255, 0.12)",
    transform: "translateX(8px)",
    boxShadow: "-8px 0 32px rgba(0, 240, 255, 0.08)",
  },
});

const ItemPoster = styled("div", {
  width: "52px",
  height: "78px",
  borderRadius: "10px",
  overflow: "hidden",
  flexShrink: 0,
  border: "1px solid rgba(255, 255, 255, 0.05)",
  
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});

const ItemInfo = styled("div", {
  flex: 1,
  minWidth: 0,
});

const ItemTitle = styled("h3", {
  fontSize: "1.05rem",
  fontWeight: 600,
  color: "#f8fafc",
  marginBottom: "5px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  letterSpacing: "-0.01em",
});

const ItemMeta = styled("p", {
  fontSize: "0.85rem",
  color: "#64748b",
  fontFamily: "'JetBrains Mono', monospace",
});

const MetaHighlight = styled("span", {
  color: "#00f0ff",
  fontWeight: 600,
});
