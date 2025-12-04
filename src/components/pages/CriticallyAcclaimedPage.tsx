import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { getTopRatedContent, TopContent } from "@/lib/rating-helpers";
import PageContainer from "../PageContainer";
import { styled } from "@stitches/react";
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
            <Title as={motion.h1} variants={itemVariants}>
              Critically Acclaimed
            </Title>
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
  justifyContent: "center",
  gap: "20px",
  
  "& > *": {
    width: "calc(50% - 10px)",
    maxWidth: "220px",
  },
  
  "@media (min-width: 768px)": {
    "& > *": {
      width: "calc(33.333% - 14px)",
      maxWidth: "240px",
    },
  },
  
  "@media (min-width: 1024px)": {
    "& > *": {
      width: "calc(25% - 15px)",
      maxWidth: "260px",
    },
  },
});

const ContentCard = styled("div", {
  background: "rgba(15, 18, 25, 0.6)",
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid rgba(255, 255, 255, 0.06)",
  transition: "all 0.3s ease",
  
  "&:hover": {
    transform: "translateY(-6px)",
    borderColor: "rgba(251, 191, 36, 0.3)",
    boxShadow: "0 16px 48px rgba(0, 0, 0, 0.4), 0 0 40px rgba(251, 191, 36, 0.1)",
  },
});

const ImageContainer = styled("div", {
  position: "relative",
  aspectRatio: "2/3",
  overflow: "hidden",
  background: "linear-gradient(180deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)",
});

const RatingBadge = styled("div", {
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
  
  "& span": {
    color: "#fbbf24",
    fontSize: "0.875rem",
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
  },
});

const TypeBadge = styled("div", {
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
});

const CardContent = styled("div", {
  padding: "16px",
});

const ContentTitle = styled("h3", {
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
});

const ContentYear = styled("span", {
  fontSize: "0.875rem",
  color: "#64748b",
});
