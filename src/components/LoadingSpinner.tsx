import React from "react";
import { motion } from "motion/react";

export function LoadingSpinner() {
  return (
    <Container>
      <BackgroundMesh />
      <GeometricPatterns>
        <Ring
          style={{
            width: "220px",
            height: "220px",
            animation: "spin 20s linear infinite",
          }}
        />
        <Ring
          style={{
            width: "300px",
            height: "300px",
            animation: "spin-reverse 25s linear infinite",
          }}
        />
      </GeometricPatterns>
      <SpinnerWrapper>
        <SpinnerOuter
          style={{
            animation: "spin 1.8s linear infinite",
          }}
        />
        <SpinnerMiddle
          style={{
            animation: "spin-reverse 1.3s linear infinite",
          }}
        />
        <SpinnerCore
          style={{
            animation: "pulse-scale 1.2s ease-in-out infinite",
          }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            fontSize: "0.9rem",
            fontWeight: 500,
            color: "#64748b",
            fontFamily: "'Sora', sans-serif",
            letterSpacing: "0.04em",
            marginTop: "70px",
            textTransform: "uppercase",
            animation: "pulse-opacity 2.5s ease-in-out infinite",
          }}
        >
          Loading your recap...
        </motion.p>
      </SpinnerWrapper>
    </Container>
  );
}

const Container = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(180deg, #030304 0%, #08090c 50%, #030304 100%)",
      position: "relative",
      overflow: "hidden",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const BackgroundMesh = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "600px",
      height: "600px",
      background: `
        radial-gradient(circle at 30% 40%, rgba(0, 240, 255, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 70% 60%, rgba(168, 85, 247, 0.06) 0%, transparent 50%)
      `,
      pointerEvents: "none",
      filter: "blur(80px)",
      ...style,
    }}
    {...props}
  />
);

const GeometricPatterns = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const Ring = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%) translateZ(0)",
      WebkitTransform: "translate(-50%, -50%) translateZ(0)",
      width: "220px",
      height: "220px",
      border: "1px dashed rgba(0, 240, 255, 0.1)",
      borderRadius: "50%",
      willChange: "transform",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      ...style,
    }}
    {...props}
  />
);

const SpinnerWrapper = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "32px",
      position: "relative",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const SpinnerOuter = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      position: "absolute",
      width: "88px",
      height: "88px",
      border: "2px solid transparent",
      borderTopColor: "#00f0ff",
      borderRightColor: "rgba(0, 240, 255, 0.3)",
      borderRadius: "50%",
      boxShadow: "0 0 30px rgba(0, 240, 255, 0.25)",
      willChange: "transform",
      transform: "translateZ(0)",
      WebkitTransform: "translateZ(0)",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      ...style,
    }}
    {...props}
  />
);

const SpinnerMiddle = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      position: "absolute",
      width: "60px",
      height: "60px",
      border: "2px solid transparent",
      borderTopColor: "#a855f7",
      borderLeftColor: "rgba(168, 85, 247, 0.3)",
      borderRadius: "50%",
      boxShadow: "0 0 25px rgba(168, 85, 247, 0.25)",
      willChange: "transform",
      transform: "translateZ(0)",
      WebkitTransform: "translateZ(0)",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      ...style,
    }}
    {...props}
  />
);

const SpinnerCore = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      width: "22px",
      height: "22px",
      background: "linear-gradient(135deg, #00f0ff 0%, #22d3ee 50%, #a855f7 100%)",
      borderRadius: "50%",
      boxShadow: "0 0 40px rgba(0, 240, 255, 0.5)",
      marginTop: "33px",
      willChange: "transform, opacity",
      transform: "translateZ(0)",
      WebkitTransform: "translateZ(0)",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      ...style,
    }}
    {...props}
  />
);
