import React from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  StyledButton,
} from "../ui/styled";
import TimeframeSelector from "../TimeframeSelector";
import { TimeframeOption } from "../../lib/timeframe";
import { Film, BarChart3, Play, Star, Tv } from "lucide-react";

const NEXT_PAGE = "/configure";

const SplashPage = () => {
  const navigate = useNavigate();

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
  };

  // Child element animation variants
  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  // Feature list item animations with stagger
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.4,
      },
    },
  };

  const featureVariants = {
    hidden: { x: -40, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  const handleTimeframeChange = (timeframe: TimeframeOption) => {
    console.log(`Timeframe changed to: ${timeframe.name}`);
  };

  const features = [
    { icon: Film, text: "Top movies & watch time", color: "#00f0ff" },
    { icon: Tv, text: "TV show marathon stats", color: "#a855f7" },
    { icon: BarChart3, text: "Viewing pattern analysis", color: "#10b981" },
  ];

  return (
    <Container>
      {/* Floating geometric shapes */}
      <GeometricLayer>
        <GeometricShape
          style={{
            top: "15%",
            left: "8%",
            width: "120px",
            height: "120px",
            animation: "spin 30s linear infinite, float-y 8s ease-in-out infinite",
          }}
        />
        <GeometricShapeRing
          style={{
            top: "25%",
            right: "10%",
            width: "160px",
            height: "160px",
            animation: "spin-reverse 25s linear infinite, scale-pulse 6s ease-in-out infinite",
          }}
        />
        <GeometricShapeTriangle
          style={{
            bottom: "20%",
            left: "12%",
            width: "80px",
            height: "80px",
            animation: "spin 35s linear infinite, float-x 10s ease-in-out infinite",
          }}
        />
        <GeometricShapeDots
          style={{
            bottom: "30%",
            right: "15%",
            width: "100px",
            height: "100px",
            animation: "opacity-pulse 4s ease-in-out infinite",
          }}
        />
      </GeometricLayer>

      {/* Animated orbs with electric colors */}
      <OrbContainer>
        <Orb
          style={{
            top: "0%",
            left: "0%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(0, 240, 255, 0.12) 0%, transparent 70%)",
            animation: "orb-float-1 14s ease-in-out infinite",
          }}
        />
        <Orb
          style={{
            top: "40%",
            right: "-10%",
            width: "700px",
            height: "700px",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)",
            animation: "orb-float-2 18s ease-in-out infinite",
          }}
        />
        <Orb
          style={{
            bottom: "-5%",
            left: "20%",
            width: "550px",
            height: "550px",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)",
            animation: "orb-float-3 20s ease-in-out infinite",
          }}
        />
      </OrbContainer>

      {/* Subtle grid lines */}
      <GridOverlay />

      {/* Floating particles */}
      <ParticleField>
        {[...Array(30)].map((_, i) => {
          const duration = 4 + (i % 5);
          const delay = (i % 3);
          const left = 5 + (i * 3) % 90;
          const top = 5 + (i * 3) % 90;
          const size = 2 + (i % 3);
          return (
          <Particle
            key={i}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: i % 3 === 0 ? "#00f0ff" : i % 3 === 1 ? "#a855f7" : "#f59e0b",
              animation: `particle-float ${duration}s ease-in-out infinite ${delay}s`,
            }}
          />
          );
        })}
      </ParticleField>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          maxWidth: "1000px",
          textAlign: "center",
          padding: "40px 48px 80px 48px",
          position: "relative",
          zIndex: 1,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
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
          Jellyfin<br />Wrapped
        </motion.h1>

        <motion.p variants={itemVariants} style={{
          fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
          marginBottom: "3rem",
          lineHeight: 1.7,
          color: "#94a3b8",
          maxWidth: "620px",
          margin: "0 auto 3rem",
          fontWeight: 400,
        }}>
          Discover your personalized entertainment recap.{" "}
          Uncover viewing trends, hidden favorites, and meaningful insights{" "}
          from your Jellyfin library.
        </motion.p>

        <motion.div variants={itemVariants}>
          <TimeframeSelector onTimeframeChange={handleTimeframeChange} />
        </motion.div>

        <motion.ul
          variants={listVariants}
          style={{
            listStyle: "none",
            padding: 0,
            marginBottom: "3.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem",
            maxWidth: "800px",
            margin: "0 auto 3.5rem",
          }}
        >
          {features.map((feature, index) => (
            <motion.li
              key={index}
              variants={featureVariants}
              style={{
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
              }}
            >
              <FeatureIcon style={{ background: `${feature.color}12`, borderColor: `${feature.color}20` }}>
                <feature.icon size={20} style={{ color: feature.color }} />
              </FeatureIcon>
              <FeatureText>{feature.text}</FeatureText>
              <FeatureArrow style={{ color: feature.color }}>→</FeatureArrow>
            </motion.li>
          ))}
        </motion.ul>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          style={{ willChange: "transform" }}
        >
          <StyledButton
            onClick={() => {
              void navigate(NEXT_PAGE);
            }}
          >
            <ButtonContent>
              <Play size={20} fill="currentColor" />
              <span>Start Your Recap</span>
            </ButtonContent>
          </StyledButton>
        </motion.div>

        <motion.p
          variants={itemVariants}
          style={{
            fontSize: "0.875rem",
            color: "#475569",
            marginTop: "3.5rem",
            lineHeight: 1.7,
            maxWidth: "500px",
            margin: "3.5rem auto 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <LockBadge>
            <Star size={10} />
            <span>100% Private</span>
          </LockBadge>
          <span>Your data never leaves your browser. Completely client-side.</span>
        </motion.p>
      </motion.div>
    </Container>
  );
};

const GeometricLayer = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none", ...style }} {...props}>{children}</div>
);

const GeometricShape = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", border: "1px solid rgba(0, 240, 255, 0.1)", borderRadius: "8px", ...style }} {...props} />
);

const GeometricShapeRing = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", borderRadius: "50%", borderWidth: "2px", borderStyle: "dashed", borderColor: "rgba(168, 85, 247, 0.12)", ...style }} {...props} />
);

const GeometricShapeTriangle = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", borderRadius: "0", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", background: "rgba(16, 185, 129, 0.04)", ...style }} {...props} />
);

const GeometricShapeDots = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", backgroundImage: "radial-gradient(rgba(245, 158, 11, 0.2) 2px, transparent 2px)", backgroundSize: "12px 12px", ...style }} {...props} />
);

const OrbContainer = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none", ...style }} {...props}>{children}</div>
);

const Orb = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", borderRadius: "50%", filter: "blur(100px)", ...style }} {...props} />
);

const GridOverlay = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "linear-gradient(rgba(0, 240, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.02) 1px, transparent 1px)", backgroundSize: "80px 80px", pointerEvents: "none", opacity: 0.5, ...style }} {...props} />
);

const ParticleField = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden", ...style }} {...props}>{children}</div>
);

const Particle = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", borderRadius: "50%", boxShadow: "0 0 8px currentColor", ...style }} {...props} />
);

const FeatureIcon = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "44px", height: "44px", borderRadius: "12px", border: "1px solid", flexShrink: 0, transition: "all 0.25s ease", ...style }} {...props}>{children}</span>
);

const FeatureText = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ flex: 1, marginLeft: "14px", fontWeight: 500, fontSize: "1rem", letterSpacing: "-0.01em", ...style }} {...props}>{children}</span>
);

const FeatureArrow = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ fontSize: "1.25rem", opacity: 0, transform: "translateX(-8px)", transition: "all 0.25s ease", ...style }} {...props}>{children}</span>
);

const ButtonContent = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative", zIndex: 1, ...style }} {...props}>{children}</span>
);

const LockBadge = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 600, color: "#10b981", marginRight: "10px", textTransform: "uppercase", letterSpacing: "0.05em", ...style }} {...props}>{children}</span>
);

export default SplashPage;
