import { useEffect, useState } from "react";
import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { format } from "date-fns";
import { getImageUrlById, UnfinishedShowDto } from "@/lib/queries";
import PageContainer from "../PageContainer";
import { styled } from "@stitches/react";
import { PlayCircle, Calendar } from "lucide-react";

type ShowWithPoster = UnfinishedShowDto & { posterUrl?: string };

export default function UnfinishedShowsPage() {
  const { unfinishedShows, isLoading } = useData();
  const { data: shows } = unfinishedShows;
  const [showsWithPosters, setShowsWithPosters] = useState<ShowWithPoster[]>(
    []
  );

  useEffect(() => {
    if (!shows) return;

    const fetchPosters = async () => {
      const withPosters = await Promise.all(
        shows.map(async (show: UnfinishedShowDto) => {
          const posterUrl = show.item.id
            ? await getImageUrlById(show.item.id)
            : undefined;
          return { ...show, posterUrl };
        })
      );
      setShowsWithPosters(withPosters);
    };

    void fetchPosters();
  }, [shows]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!showsWithPosters.length) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <Container size="4" p="4">
        <Grid gap="6">
          <HeaderSection>
            <Title as={motion.h1} variants={itemVariants}>
              Shows You Started But Haven't Finished
            </Title>
            <Subtitle>
              Series you began watching but haven't completed yet
            </Subtitle>
          </HeaderSection>

          <ContentGrid>
            {showsWithPosters.slice(0, 12).map((show: ShowWithPoster) => {
              const progressPercent = Math.round(
                (show.watchedEpisodes / show.totalEpisodes) * 100
              );
              
              return (
                <ShowCard
                  key={show.item.id}
                  as={motion.div}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <ImageContainer>
                    {show.posterUrl ? (
                      <PosterImage
                        src={show.posterUrl}
                        alt={show.item.name ?? ""}
                      />
                    ) : (
                      <PlaceholderImage>
                        <PlayCircle size={32} />
                      </PlaceholderImage>
                    )}
                    <ProgressBadge>
                      {progressPercent}%
                    </ProgressBadge>
                  </ImageContainer>
                  <CardContent>
                    <ShowTitle>{show.item.name}</ShowTitle>
                    <EpisodeCount>
                      <PlayCircle size={14} />
                      <span>{show.watchedEpisodes} / {show.totalEpisodes} episodes</span>
                    </EpisodeCount>
                    <ProgressBarContainer>
                      <ProgressBar style={{ width: `${progressPercent}%` }} />
                    </ProgressBarContainer>
                    <LastWatched>
                      <Calendar size={12} />
                      <span>Last watched: {format(show.lastWatchedDate, "MMM d, yyyy")}</span>
                    </LastWatched>
                  </CardContent>
                </ShowCard>
              );
            })}
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
    borderColor: "rgba(168, 85, 247, 0.2)",
    boxShadow: "0 8px 32px rgba(168, 85, 247, 0.1)",
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
  background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(244, 63, 94, 0.1) 100%)",
  color: "#64748b",
});

const ProgressBadge = styled("div", {
  position: "absolute",
  top: "12px",
  right: "12px",
  padding: "8px 12px",
  background: "rgba(168, 85, 247, 0.15)",
  backdropFilter: "blur(8px)",
  borderRadius: "10px",
  color: "#a855f7",
  fontSize: "0.9rem",
  fontWeight: 700,
  border: "1px solid rgba(168, 85, 247, 0.2)",
});

const CardContent = styled("div", {
  padding: "16px 18px 20px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
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

const EpisodeCount = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "0.9rem",
  color: "#a855f7",
  fontWeight: 500,
  
  "& svg": {
    color: "#a855f7",
  },
});

const ProgressBarContainer = styled("div", {
  width: "100%",
  height: "4px",
  background: "rgba(255, 255, 255, 0.1)",
  borderRadius: "2px",
  overflow: "hidden",
  marginTop: "4px",
});

const ProgressBar = styled("div", {
  height: "100%",
  background: "linear-gradient(90deg, #a855f7 0%, #c084fc 100%)",
  borderRadius: "2px",
  transition: "width 0.3s ease",
});

const LastWatched = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "0.8rem",
  color: "#64748b",
  marginTop: "4px",
  
  "& svg": {
    color: "#475569",
  },
});
