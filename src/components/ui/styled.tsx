import { styled } from "@stitches/react";

export const Container = styled("div", {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  padding: "20px",
  overflow: "hidden",
  
  // Deep noir background with electric accents
  background: `
    radial-gradient(ellipse at 20% 0%, rgba(0, 240, 255, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.06) 0%, transparent 40%),
    radial-gradient(ellipse at 70% 80%, rgba(245, 158, 11, 0.04) 0%, transparent 40%),
    radial-gradient(ellipse at 10% 90%, rgba(16, 185, 129, 0.04) 0%, transparent 40%),
    linear-gradient(180deg, #030304 0%, #08090c 20%, #0d0f14 80%, #030304 100%)
  `,
  
  // Hex pattern overlay
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='70' viewBox='0 0 60 70' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='rgba(0,240,255,0.015)' stroke-width='1'/%3E%3C/svg%3E")`,
    backgroundSize: "60px 70px",
    pointerEvents: "none",
  },
});

export const ContentWrapper = styled("div", {
  maxWidth: "1000px",
  textAlign: "center",
  padding: "80px 48px",
  position: "relative",
  zIndex: 1,
  
  "@media (max-width: 640px)": {
    padding: "48px 20px",
  },
});

export const Title = styled("h1", {
  fontSize: "clamp(2.75rem, 8vw, 5.5rem)",
  fontWeight: 800,
  marginBottom: "1.75rem",
  lineHeight: 0.95,
  letterSpacing: "-0.05em",
  
  // Electric gradient text
  background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 35%, #a855f7 55%, #f59e0b 80%, #f43f5e 100%)",
  backgroundSize: "250% 250%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "gradient-flow 8s ease infinite",
  
  // Cyan glow
  filter: "drop-shadow(0 0 50px rgba(0, 240, 255, 0.25))",
});

export const Subtitle = styled("p", {
  fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
  marginBottom: "3rem",
  lineHeight: 1.7,
  color: "#94a3b8",
  maxWidth: "620px",
  margin: "0 auto 3rem",
  fontWeight: 400,
});

export const FeaturesList = styled("ul", {
  listStyle: "none",
  padding: 0,
  marginBottom: "3.5rem",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "1rem",
  maxWidth: "800px",
  margin: "0 auto 3.5rem",
});

export const FeatureItem = styled("li", {
  display: "flex",
  alignItems: "center",
  fontSize: "1rem",
  padding: "1.125rem 1.5rem",
  color: "#e2e8f0",
  textAlign: "left",
  background: "rgba(18, 21, 28, 0.75)",
  backdropFilter: "blur(16px)",
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.03)",
  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  position: "relative",
  overflow: "hidden",
  
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: "linear-gradient(135deg, rgba(0, 240, 255, 0.03) 0%, transparent 50%)",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  
  "&:hover": {
    background: "rgba(0, 240, 255, 0.05)",
    borderColor: "rgba(0, 240, 255, 0.2)",
    transform: "translateY(-4px) translateX(4px)",
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 240, 255, 0.1)",
    
    "&::before": {
      opacity: 1,
    },
  },
});

export const StyledButton = styled("button", {
  position: "relative",
  background: "linear-gradient(135deg, #00f0ff 0%, #22d3ee 40%, #10b981 100%)",
  backgroundSize: "200% 200%",
  color: "#030304",
  border: "none",
  padding: "22px 56px",
  borderRadius: "16px",
  fontSize: "1.125rem",
  fontWeight: 700,
  fontFamily: "'Sora', sans-serif",
  cursor: "pointer",
  transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
  boxShadow: "0 6px 40px rgba(0, 240, 255, 0.35)",
  overflow: "hidden",
  letterSpacing: "-0.01em",
  
  // Shine effect
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)",
    transition: "left 0.6s ease",
  },
  
  // Inner glow
  "&::after": {
    content: '""',
    position: "absolute",
    inset: "2px",
    borderRadius: "14px",
    background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)",
    pointerEvents: "none",
  },

  "&:hover": {
    transform: "translateY(-5px) scale(1.02)",
    boxShadow: "0 16px 60px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.2)",
    backgroundPosition: "100% 100%",
    
    "&::before": {
      left: "100%",
    },
  },

  "&:active": {
    transform: "translateY(-2px) scale(1)",
  },

  "&:focus": {
    outline: "none",
    boxShadow: "0 0 0 3px rgba(0, 240, 255, 0.3), 0 6px 40px rgba(0, 240, 255, 0.35)",
  },
});

export const Disclaimer = styled("p", {
  fontSize: "0.875rem",
  color: "#475569",
  marginTop: "3.5rem",
  lineHeight: 1.7,
  maxWidth: "500px",
  margin: "3.5rem auto 0",
  
  "& a": {
    color: "#00f0ff",
    textDecoration: "none",
    transition: "color 0.2s ease",
    
    "&:hover": {
      color: "#22d3ee",
      textDecoration: "underline",
    },
  },
});

// Enhanced glass card with premium effects
export const GlassCard = styled("div", {
  background: "rgba(18, 21, 28, 0.75)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: "1px solid rgba(255, 255, 255, 0.04)",
  borderRadius: "28px",
  padding: "36px",
  position: "relative",
  overflow: "hidden",
  transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
  
  // Top accent line
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "35%",
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.5), transparent)",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  
  // Subtle gradient overlay
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: "linear-gradient(135deg, rgba(0, 240, 255, 0.02) 0%, transparent 50%)",
    pointerEvents: "none",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  
  "&:hover": {
    background: "rgba(24, 28, 38, 0.9)",
    borderColor: "rgba(0, 240, 255, 0.15)",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 50px rgba(0, 240, 255, 0.1)",
    transform: "translateY(-6px)",
    
    "&::before, &::after": {
      opacity: 1,
    },
  },
});

export const Badge = styled("span", {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "7px 16px",
  background: "rgba(0, 240, 255, 0.08)",
  border: "1px solid rgba(0, 240, 255, 0.15)",
  borderRadius: "999px",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#00f0ff",
  letterSpacing: "0.02em",
  
  variants: {
    variant: {
      success: {
        background: "rgba(16, 185, 129, 0.1)",
        borderColor: "rgba(16, 185, 129, 0.2)",
        color: "#10b981",
      },
      warning: {
        background: "rgba(245, 158, 11, 0.1)",
        borderColor: "rgba(245, 158, 11, 0.2)",
        color: "#f59e0b",
      },
      error: {
        background: "rgba(244, 63, 94, 0.1)",
        borderColor: "rgba(244, 63, 94, 0.2)",
        color: "#f43f5e",
      },
      purple: {
        background: "rgba(168, 85, 247, 0.1)",
        borderColor: "rgba(168, 85, 247, 0.2)",
        color: "#a855f7",
      },
    },
  },
});

export const StatCard = styled("div", {
  background: "linear-gradient(145deg, rgba(0, 240, 255, 0.04) 0%, rgba(168, 85, 247, 0.02) 100%)",
  border: "1px solid rgba(0, 240, 255, 0.08)",
  borderRadius: "24px",
  padding: "32px",
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  
  // Accent line at top
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "45%",
    height: "2px",
    background: "linear-gradient(90deg, transparent, #00f0ff, transparent)",
  },
  
  "& h3": {
    fontSize: "3.25rem",
    fontWeight: 800,
    background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 50%, #22d3ee 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "0.5rem",
    letterSpacing: "-0.03em",
  },
  
  "& p": {
    color: "#94a3b8",
    fontSize: "0.85rem",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
});

// Section header
export const SectionHeader = styled("div", {
  marginBottom: "2.5rem",
  textAlign: "center",
  
  "& h2": {
    fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
    fontWeight: 700,
    color: "#f8fafc",
    marginBottom: "0.5rem",
    letterSpacing: "-0.03em",
  },
  
  "& p": {
    color: "#94a3b8",
    fontSize: "1rem",
  },
});

// Content grid
export const ContentGrid = styled("div", {
  display: "grid",
  gap: "1.5rem",
  
  variants: {
    columns: {
      2: {
        gridTemplateColumns: "repeat(2, 1fr)",
        "@media (max-width: 768px)": {
          gridTemplateColumns: "1fr",
        },
      },
      3: {
        gridTemplateColumns: "repeat(3, 1fr)",
        "@media (max-width: 900px)": {
          gridTemplateColumns: "repeat(2, 1fr)",
        },
        "@media (max-width: 600px)": {
          gridTemplateColumns: "1fr",
        },
      },
      4: {
        gridTemplateColumns: "repeat(4, 1fr)",
        "@media (max-width: 1024px)": {
          gridTemplateColumns: "repeat(3, 1fr)",
        },
        "@media (max-width: 768px)": {
          gridTemplateColumns: "repeat(2, 1fr)",
        },
      },
    },
  },
});

// Centered Grid for content items
export const CenteredGrid = styled("div", {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "20px",
  
  "& > *": {
    width: "calc(50% - 10px)",
    maxWidth: "200px",
    minWidth: "140px",
  },
  
  "@media (min-width: 640px)": {
    "& > *": {
      width: "calc(33.333% - 14px)",
      maxWidth: "200px",
    },
  },
  
  "@media (min-width: 768px)": {
    "& > *": {
      width: "calc(25% - 15px)",
      maxWidth: "200px",
    },
  },
  
  "@media (min-width: 1024px)": {
    "& > *": {
      width: "calc(20% - 16px)",
      maxWidth: "200px",
    },
  },
});

// Divider
export const Divider = styled("div", {
  height: "1px",
  background: "linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.2), transparent)",
  margin: "2.5rem 0",
});

// Number display for stats
export const NumberDisplay = styled("span", {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: "clamp(2rem, 5vw, 4rem)",
  fontWeight: 700,
  background: "linear-gradient(135deg, #00f0ff 0%, #22d3ee 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  letterSpacing: "-0.03em",
});

// Accent text
export const AccentText = styled("span", {
  color: "#00f0ff",
  fontWeight: 600,
});

// Muted text
export const MutedText = styled("span", {
  color: "#475569",
  fontSize: "0.875rem",
});

// Icon container
export const IconBox = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "48px",
  height: "48px",
  borderRadius: "14px",
  background: "rgba(0, 240, 255, 0.08)",
  border: "1px solid rgba(0, 240, 255, 0.1)",
  color: "#00f0ff",
  
  variants: {
    variant: {
      gold: {
        background: "rgba(245, 158, 11, 0.1)",
        borderColor: "rgba(245, 158, 11, 0.15)",
        color: "#f59e0b",
      },
      rose: {
        background: "rgba(244, 63, 94, 0.1)",
        borderColor: "rgba(244, 63, 94, 0.15)",
        color: "#f43f5e",
      },
      violet: {
        background: "rgba(168, 85, 247, 0.1)",
        borderColor: "rgba(168, 85, 247, 0.15)",
        color: "#a855f7",
      },
      mint: {
        background: "rgba(16, 185, 129, 0.1)",
        borderColor: "rgba(16, 185, 129, 0.15)",
        color: "#10b981",
      },
    },
  },
});
