import { motion } from "framer-motion";
import { styled } from "@stitches/react";

export function LoadingSpinner() {
  return (
    <Container>
      <BackgroundMesh />
      <GeometricPatterns>
        <Ring
          as={motion.div}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <Ring
          as={motion.div}
          style={{ width: "300px", height: "300px" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </GeometricPatterns>
      <SpinnerWrapper>
        <SpinnerOuter
          as={motion.div}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
        <SpinnerMiddle
          as={motion.div}
          animate={{ rotate: -360 }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
        />
        <SpinnerCore
          as={motion.div}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <LoadingText
          as={motion.p}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          Loading your recap...
        </LoadingText>
      </SpinnerWrapper>
    </Container>
  );
}

const Container = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  background: "linear-gradient(180deg, #030304 0%, #08090c 50%, #030304 100%)",
  position: "relative",
  overflow: "hidden",
});

const BackgroundMesh = styled("div", {
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
});

const GeometricPatterns = styled("div", {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  pointerEvents: "none",
});

const Ring = styled("div", {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "220px",
  height: "220px",
  border: "1px dashed rgba(0, 240, 255, 0.1)",
  borderRadius: "50%",
});

const SpinnerWrapper = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "32px",
  position: "relative",
});

const SpinnerOuter = styled("div", {
  position: "absolute",
  width: "88px",
  height: "88px",
  border: "2px solid transparent",
  borderTopColor: "#00f0ff",
  borderRightColor: "rgba(0, 240, 255, 0.3)",
  borderRadius: "50%",
  boxShadow: "0 0 30px rgba(0, 240, 255, 0.25)",
});

const SpinnerMiddle = styled("div", {
  position: "absolute",
  width: "60px",
  height: "60px",
  border: "2px solid transparent",
  borderTopColor: "#a855f7",
  borderLeftColor: "rgba(168, 85, 247, 0.3)",
  borderRadius: "50%",
  boxShadow: "0 0 25px rgba(168, 85, 247, 0.25)",
});

const SpinnerCore = styled("div", {
  width: "22px",
  height: "22px",
  background: "linear-gradient(135deg, #00f0ff 0%, #22d3ee 50%, #a855f7 100%)",
  borderRadius: "50%",
  boxShadow: "0 0 40px rgba(0, 240, 255, 0.5)",
  marginTop: "33px",
});

const LoadingText = styled("p", {
  fontSize: "0.9rem",
  fontWeight: 500,
  color: "#64748b",
  fontFamily: "'Sora', sans-serif",
  letterSpacing: "0.04em",
  marginTop: "70px",
  textTransform: "uppercase",
});
