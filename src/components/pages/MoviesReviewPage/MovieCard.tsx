import React from "react";
import { useState } from "react";
import { formatDuration } from "@/lib/utils";
import { SimpleItemDto } from "@/lib/queries";
import { Trash2, Star } from "lucide-react";
import { motion } from "motion/react";

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
  const [hasError, setHasError] = useState(false);

  return (
    <motion.div
      style={{
        background: "rgba(18, 21, 28, 0.7)",
        backdropFilter: "blur(16px)",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.04)",
        transition: "all 0.3s ease",
        willChange: "transform",
      }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as const }}
    >
      <ImageContainer>
        {item.imageUrl && !hasError ? (
          <CardImage
            src={item.imageUrl}
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
    </motion.div>
  );
}

const ImageContainer = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      position: "relative",
      aspectRatio: "2 / 3",
      overflow: "hidden",
      background: "rgba(0, 0, 0, 0.3)",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const CardImage = ({ style, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
      ...style,
    }}
    {...props}
  />
);

const FallbackImage = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const HideButton = ({ children, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    style={{
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
      transition: "all 0.2s ease",
      ...style,
    }}
    {...props}
  >
    {children}
  </button>
);

const RatingBadge = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
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

const CardTitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    style={{
      fontSize: "0.95rem",
      fontWeight: 600,
      color: "#f8fafc",
      marginBottom: "4px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      lineHeight: 1.3,
      ...style,
    }}
    {...props}
  >
    {children}
  </h3>
);

const CardMeta = ({ children, style, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    style={{
      fontSize: "0.8rem",
      color: "#64748b",
      fontFamily: "'JetBrains Mono', monospace",
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
);

const CardStats = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginTop: "10px",
      paddingTop: "10px",
      borderTop: "1px solid rgba(255, 255, 255, 0.05)",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const StatItem = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      gap: "4px",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const StatValue = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      fontSize: "0.85rem",
      fontWeight: 600,
      color: "#00f0ff",
      fontFamily: "'JetBrains Mono', monospace",
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);

const StatLabel = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      fontSize: "0.75rem",
      color: "#64748b",
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);

const StatDivider = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      width: "1px",
      height: "12px",
      background: "rgba(255, 255, 255, 0.1)",
      ...style,
    }}
    {...props}
  />
);
