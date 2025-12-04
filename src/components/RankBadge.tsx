import { styled } from "@stitches/react";

export function RankBadge({ rank }: { rank: number }) {
  const getVariant = () => {
    if (rank === 1) return "gold";
    if (rank === 2) return "silver";
    if (rank === 3) return "bronze";
    return "default";
  };

  return (
    <Badge variant={getVariant()}>
      <span>{rank}</span>
    </Badge>
  );
}

const Badge = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  fontWeight: 800,
  fontSize: "1rem",
  fontFamily: "'Sora', sans-serif",
  flexShrink: 0,
  transition: "all 0.25s ease",
  position: "relative",
  
  "&:hover": {
    transform: "scale(1.1) rotate(3deg)",
  },

  variants: {
    variant: {
      gold: {
        background: "linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)",
        color: "#1a1a1a",
        boxShadow: "0 6px 24px rgba(245, 158, 11, 0.45)",
        border: "1px solid rgba(252, 211, 77, 0.5)",
      },
      silver: {
        background: "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)",
        color: "#1a1a1a",
        boxShadow: "0 6px 20px rgba(148, 163, 184, 0.35)",
        border: "1px solid rgba(226, 232, 240, 0.5)",
      },
      bronze: {
        background: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
        color: "#ffffff",
        boxShadow: "0 6px 20px rgba(249, 115, 22, 0.35)",
        border: "1px solid rgba(249, 115, 22, 0.5)",
      },
      default: {
        background: "rgba(24, 28, 38, 0.8)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        color: "#64748b",
      },
    },
  },

  defaultVariants: {
    variant: "default",
  },
});
