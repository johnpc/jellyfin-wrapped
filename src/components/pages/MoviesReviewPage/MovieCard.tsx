import { useEffect, useState } from "react";
import { styled } from "@stitches/react";
import { formatDuration } from "@/lib/utils";
import { getImageUrlById, SimpleItemDto } from "@/lib/queries";
import { Trash2, Star } from "lucide-react";
import { motion } from "framer-motion";

interface MovieCardProps {
  item: SimpleItemDto;
  playbackTime?: number;
  episodeCount?: number;
  onHide?: () => void;
}

export function MovieCard({
  item,
  playbackTime,
  episodeCount,
  onHide,
}: MovieCardProps) {
  const [imageUrl, setImageUrl] = useState<string>();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        const url = await getImageUrlById(item.id ?? "");
        setImageUrl(url);
      } catch (error) {
        console.error("Failed to fetch image URL:", error);
        setHasError(true);
      }
    };

    void fetchImageUrl();
  }, [item]);

  return (
    <Card
      as={motion.div}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25 }}
    >
      <ImageContainer>
        {imageUrl && !hasError ? (
          <CardImage 
            src={imageUrl} 
            alt={item.name || "Content"}
            onError={() => setHasError(true)}
          />
        ) : (
          <FallbackImage>
            <span>{item.name?.[0] || "?"}</span>
          </FallbackImage>
        )}
        {onHide && (
          <HideButton
            onClick={(e) => {
              e.stopPropagation();
              onHide();
            }}
          >
            <Trash2 size={14} />
          </HideButton>
        )}
        {item.communityRating && (
          <RatingBadge>
            <Star size={12} fill="currentColor" />
            <span>{item.communityRating.toFixed(1)}</span>
          </RatingBadge>
        )}
      </ImageContainer>
      <CardContent>
        <CardTitle>{item.name}</CardTitle>
        {item.productionYear && (
          <CardMeta>{item.productionYear}</CardMeta>
        )}
        {playbackTime && episodeCount && episodeCount > 1 && (
          <CardStats>
            <StatItem>
              <StatValue>{episodeCount}</StatValue>
              <StatLabel>episodes</StatLabel>
            </StatItem>
            <StatDivider />
            <StatItem>
              <StatValue>{formatDuration(playbackTime)}</StatValue>
            </StatItem>
          </CardStats>
        )}
      </CardContent>
    </Card>
  );
}

const Card = styled("div", {
  background: "rgba(18, 21, 28, 0.7)",
  backdropFilter: "blur(16px)",
  borderRadius: "16px",
  overflow: "hidden",
  border: "1px solid rgba(255, 255, 255, 0.04)",
  transition: "all 0.3s ease",
  
  "&:hover": {
    borderColor: "rgba(0, 240, 255, 0.15)",
    boxShadow: "0 16px 48px rgba(0, 0, 0, 0.4), 0 0 32px rgba(0, 240, 255, 0.08)",
  },
});

const ImageContainer = styled("div", {
  position: "relative",
  aspectRatio: "2 / 3",
  overflow: "hidden",
  background: "rgba(0, 0, 0, 0.3)",
});

const CardImage = styled("img", {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
});

const FallbackImage = styled("div", {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
  
  "& span": {
    fontSize: "3rem",
    fontWeight: 700,
    color: "#00f0ff",
    textTransform: "uppercase",
  },
});

const HideButton = styled("button", {
  position: "absolute",
  top: "10px",
  right: "10px",
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0, 0, 0, 0.6)",
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "10px",
  color: "#94a3b8",
  cursor: "pointer",
  opacity: 0,
  transition: "all 0.2s ease",
  
  "[data-card]:hover &, div:hover > div > &": {
    opacity: 1,
  },
  
  "&:hover": {
    background: "rgba(244, 63, 94, 0.2)",
    borderColor: "rgba(244, 63, 94, 0.3)",
    color: "#f43f5e",
  },
});

const RatingBadge = styled("div", {
  position: "absolute",
  bottom: "10px",
  left: "10px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  padding: "5px 10px",
  background: "rgba(0, 0, 0, 0.7)",
  backdropFilter: "blur(8px)",
  borderRadius: "8px",
  color: "#fbbf24",
  fontSize: "0.8rem",
  fontWeight: 600,
});

const CardContent = styled("div", {
  padding: "16px",
});

const CardTitle = styled("h3", {
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "#f8fafc",
  marginBottom: "4px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  lineHeight: 1.3,
});

const CardMeta = styled("p", {
  fontSize: "0.8rem",
  color: "#64748b",
  fontFamily: "'JetBrains Mono', monospace",
});

const CardStats = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginTop: "10px",
  paddingTop: "10px",
  borderTop: "1px solid rgba(255, 255, 255, 0.05)",
});

const StatItem = styled("div", {
  display: "flex",
  alignItems: "baseline",
  gap: "4px",
});

const StatValue = styled("span", {
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#00f0ff",
  fontFamily: "'JetBrains Mono', monospace",
});

const StatLabel = styled("span", {
  fontSize: "0.75rem",
  color: "#64748b",
});

const StatDivider = styled("div", {
  width: "1px",
  height: "12px",
  background: "rgba(255, 255, 255, 0.1)",
});
