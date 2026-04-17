import React from "react";
import { Container, Grid } from "@radix-ui/themes";
import { motion } from "motion/react";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { itemVariants } from "@/lib/styled-variants";
import { format } from "date-fns";
import { UnfinishedShowDto } from "@/lib/queries";
import PageContainer from "../PageContainer";
import { PlayCircle, Calendar } from "lucide-react";

export default function UnfinishedShowsPage() {
  const { unfinishedShows, isLoading } = useData();
  const { data: shows } = unfinishedShows;

  if (isLoading || !shows?.length) {
    return <LoadingSpinner />;
  }

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
              Shows You Started But Haven't Finished
            </motion.h1>
            <Subtitle>
              Series you began watching but haven't completed yet
            </Subtitle>
          </HeaderSection>

          <ContentGrid>
            {shows.slice(0, 12).map((show: UnfinishedShowDto) => {
              const progressPercent = Math.round(
                (show.watchedEpisodes / show.totalEpisodes) * 100
              );

              return (
                <motion.div
                  key={show.item.id}
                  style={{ background: "rgba(18, 21, 28, 0.8)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "18px", overflow: "hidden", width: "100%", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)", display: "flex", flexDirection: "column", height: "auto", willChange: "transform" }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                >
                  <ImageContainer>
                    {show.item.imageUrl ? (
                      <PosterImage
                        src={show.item.imageUrl}
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
                </motion.div>
              );
            })}
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
  <div style={{ position: "relative", width: "100%", aspectRatio: "2/3", overflow: "hidden", flexShrink: 0, ...style }} {...props}>{children}</div>
);

const PosterImage = ({ style, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img style={{ width: "100%", height: "100%", objectFit: "cover", ...style }} {...props} />
);

const PlaceholderImage = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(244, 63, 94, 0.1) 100%)", color: "#64748b", ...style }} {...props}>{children}</div>
);

const ProgressBadge = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", top: "12px", right: "12px", padding: "8px 12px", background: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(12px)", borderRadius: "10px", color: "#c084fc", fontSize: "0.9rem", fontWeight: 700, border: "1px solid rgba(168, 85, 247, 0.4)", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(168, 85, 247, 0.2) inset", ...style }} {...props}>{children}</div>
);

const CardContent = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ padding: "16px 18px 20px", display: "flex", flexDirection: "column", gap: "8px", flex: 1, minHeight: 0, ...style }} {...props}>{children}</div>
);

const ShowTitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", margin: 0, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: "2.6em", maxHeight: "2.6em", ...style }} {...props}>{children}</h3>
);

const EpisodeCount = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", color: "#a855f7", fontWeight: 500, minHeight: "1.35em", flexShrink: 0, ...style }} {...props}>{children}</div>
);

const ProgressBarContainer = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ width: "100%", height: "4px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "2px", overflow: "hidden", marginTop: "4px", flexShrink: 0, ...style }} {...props}>{children}</div>
);

const ProgressBar = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ height: "100%", background: "linear-gradient(90deg, #a855f7 0%, #c084fc 100%)", borderRadius: "2px", transition: "width 0.3s ease", ...style }} {...props} />
);

const LastWatched = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#64748b", marginTop: "auto", minHeight: "1.2em", flexShrink: 0, ...style }} {...props}>{children}</div>
);
