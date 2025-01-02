import { Button } from "@radix-ui/themes";
import { styled } from "@stitches/react";

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};
export const Container = styled("div", {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  // Updated gradient with more vibrant colors and purple
  background: "linear-gradient(135deg, #2D00F7 0%, #4D2DFF 50%, #6A00FF 100%)",
  color: "white",
  padding: "20px",
  overflow: "hidden",
});

export const ContentWrapper = styled("div", {
  maxWidth: "800px",
  textAlign: "center",
  padding: "40px",
});

export const Title = styled("h1", {
  fontSize: "4rem",
  fontWeight: "bold",
  marginBottom: "1rem",
  // Updated gradient with yellow to blue
  background: "linear-gradient(90deg, #FFD700 0%, #00E1FF 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  textShadow: "0 0 30px rgba(255, 215, 0, 0.3)",
});

export const Subtitle = styled("p", {
  fontSize: "1.5rem",
  marginBottom: "2rem",
  lineHeight: 1.5,
  // Brighter blue for better contrast
  color: "#8BE8FF",
});

export const FeaturesList = styled("ul", {
  listStyle: "none",
  padding: 0,
  marginBottom: "2rem",
});

export const FeatureItem = styled("li", {
  fontSize: "1.25rem",
  margin: "1rem 0",
  // Softer yellow for feature items
  color: "#FFE566",
  textShadow: "0 0 20px rgba(255, 229, 102, 0.3)",
});

export const StyledButton = styled(Button, {
  // Vibrant yellow button
  backgroundColor: "#FFD700",
  color: "#2D00F7", // Dark purple text for contrast
  border: "none",
  padding: "32px 32px",
  borderRadius: "30px",
  fontSize: "1.25rem",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 0 20px rgba(255, 215, 0, 0.3)",

  "&:hover": {
    backgroundColor: "#FFF000",
    transform: "scale(1.05)",
    boxShadow: "0 0 30px rgba(255, 215, 0, 0.5)",
  },

  "&:focus": {
    outline: "none",
    boxShadow:
      "0 0 0 2px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)",
  },
});

export const Disclaimer = styled("p", {
  fontSize: "0.875rem",
  // Light purple for disclaimer
  color: "#E0AAFF",
  marginTop: "2rem",
  opacity: 0.9,
});
