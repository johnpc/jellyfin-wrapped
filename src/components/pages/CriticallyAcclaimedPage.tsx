import React from "react";
import { Container, Grid } from "@radix-ui/themes";
import { motion } from "motion/react";
import { itemVariants } from "@/lib/styled-variants";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { getTopRatedContent, TopContent } from "@/lib/rating-helpers";
import PageContainer from "../PageContainer";
import { Star, Film, Tv } from "lucide-react";
import { ContentImage } from "../ContentImage";

export default function CriticallyAcclaimedPage() {
  const { movies, shows, isLoading } = useData();
  const { data: moviesData } = movies;
  const { data: showsData } = shows;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const topContent = getTopRatedContent(moviesData ?? [], showsData ?? []);

  if (!topContent.length) {
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
              Critically Acclaimed
            </motion.h1>
            <Subtitle>
              The highest-rated content from your viewing history
            </Subtitle>
          </HeaderSection>

          <ContentGrid>
            {topContent.map((content: TopContent) => (
              <ContentCard key={content.item.id}>
                <ImageContainer>
                  <ContentImage item={content.item} />
                  <RatingBadge>
                    <Star size={14} fill="#fbbf24" color="#fbbf24" />
                    <span>{content.item.communityRating?.toFixed(1)}</span>
                  </RatingBadge>
                  <TypeBadge>
                    {content.type === "movie" ? <Film size={12} /> : <Tv size={12} />}
                    <span>{content.type === "movie" ? "Movie" : "Show"}</span>
                  </TypeBadge>
                </ImageContainer>
                <CardContent>
                  <ContentTitle>{content.item.name}</ContentTitle>
                  {content.item.productionYear && (
                    <ContentYear>{content.item.productionYear}</ContentYear>
                  )}
                </CardContent>
              </ContentCard>
            ))}
          </ContentGrid>
        </Grid>
      </Container>
    </PageContainer>
  );
}

const HeaderSection = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      textAlign: "center",
      marginBottom: "1rem",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const Subtitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    style={{
      fontSize: "1.125rem",
      color: "#94a3b8",
      marginTop: "0.5rem",
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
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "20px",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const ContentCard = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      background: "rgba(15, 18, 25, 0.6)",
      borderRadius: "16px",
      overflow: "hidden",
      border: "1px solid rgba(255, 255, 255, 0.06)",
      transition: "all 0.3s ease",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const ImageContainer = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      position: "relative",
      aspectRatio: "2/3",
      overflow: "hidden",
      background: "linear-gradient(180deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const RatingBadge = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      position: "absolute",
      top: "12px",
      right: "12px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(8px)",
      padding: "6px 10px",
      borderRadius: "8px",
      border: "1px solid rgba(251, 191, 36, 0.3)",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const TypeBadge = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      position: "absolute",
      top: "12px",
      left: "12px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      background: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(8px)",
      padding: "5px 8px",
      borderRadius: "6px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      color: "#94a3b8",
      fontSize: "0.75rem",
      fontWeight: 500,
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const CardContent = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      padding: "16px",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const ContentTitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    style={{
      fontSize: "1rem",
      fontWeight: 600,
      color: "#f8fafc",
      marginBottom: "4px",
      fontFamily: "'Sora', sans-serif",
      lineHeight: 1.3,
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical",
      ...style,
    }}
    {...props}
  >
    {children}
  </h3>
);

const ContentYear = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      fontSize: "0.875rem",
      color: "#64748b",
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);
