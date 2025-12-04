import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Container,
  ContentWrapper,
  Disclaimer,
  FeatureItem,
  FeaturesList,
  StyledButton,
  Subtitle,
  Title,
} from "../ui/styled";
import TimeframeSelector from "../TimeframeSelector";
import { TimeframeOption } from "../../lib/timeframe";
import { Film, BarChart3, Calendar, Sparkles, Play, Zap, Star, Tv } from "lucide-react";
import { styled } from "@stitches/react";

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
        ease: [0.16, 1, 0.3, 1],
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
        ease: [0.16, 1, 0.3, 1],
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
    { icon: Calendar, text: "Custom time ranges", color: "#f59e0b" },
  ];

  return (
    <Container>
      {/* Floating geometric shapes */}
      <GeometricLayer>
        <GeometricShape
          as={motion.div}
          animate={{ 
            rotate: 360,
            y: [0, -20, 0],
          }}
          transition={{ 
            rotate: { duration: 30, repeat: Infinity, ease: "linear" },
            y: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ top: "15%", left: "8%", width: "120px", height: "120px" }}
        />
        <GeometricShape
          as={motion.div}
          variant="ring"
          animate={{ 
            rotate: -360,
            scale: [1, 1.1, 1],
          }}
          transition={{ 
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ top: "25%", right: "10%", width: "160px", height: "160px" }}
        />
        <GeometricShape
          as={motion.div}
          variant="triangle"
          animate={{ 
            rotate: 360,
            x: [0, 20, 0],
          }}
          transition={{ 
            rotate: { duration: 35, repeat: Infinity, ease: "linear" },
            x: { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{ bottom: "20%", left: "12%", width: "80px", height: "80px" }}
        />
        <GeometricShape
          as={motion.div}
          variant="dots"
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "30%", right: "15%", width: "100px", height: "100px" }}
        />
      </GeometricLayer>

      {/* Animated orbs with electric colors */}
      <OrbContainer>
        <Orb 
          as={motion.div}
          animate={{ 
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          css={{ 
            top: "0%", 
            left: "0%", 
            width: "600px", 
            height: "600px", 
            background: "radial-gradient(circle, rgba(0, 240, 255, 0.12) 0%, transparent 70%)" 
          }}
        />
        <Orb 
          as={motion.div}
          animate={{ 
            x: [0, -70, 0],
            y: [0, 50, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          css={{ 
            top: "40%", 
            right: "-10%", 
            width: "700px", 
            height: "700px", 
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)" 
          }}
        />
        <Orb 
          as={motion.div}
          animate={{ 
            x: [0, 50, 0],
            y: [0, 70, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          css={{ 
            bottom: "-5%", 
            left: "20%", 
            width: "550px", 
            height: "550px", 
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)" 
          }}
        />
      </OrbContainer>

      {/* Subtle grid lines */}
      <GridOverlay />

      {/* Floating particles */}
      <ParticleField>
        {[...Array(30)].map((_, i) => (
          <Particle
            key={i}
            as={motion.div}
            animate={{
              y: [-15, 15, -15],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut",
            }}
            style={{
              left: `${5 + Math.random() * 90}%`,
              top: `${5 + Math.random() * 90}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              background: i % 3 === 0 ? "#00f0ff" : i % 3 === 1 ? "#a855f7" : "#f59e0b",
            }}
          />
        ))}
      </ParticleField>

      <ContentWrapper
        as={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <LogoBadge as={motion.div} variants={itemVariants}>
          <BadgeIcon>
            <Sparkles size={14} />
          </BadgeIcon>
          <span>Your Year in Entertainment</span>
          <BadgeGlow />
        </LogoBadge>

        <Title as={motion.h1} variants={itemVariants}>
          Jellyfin<br />Wrapped
        </Title>

        <Subtitle as={motion.p} variants={itemVariants}>
          Discover your personalized entertainment recap. 
          Uncover viewing trends, hidden favorites, and meaningful insights 
          from your Jellyfin library.
        </Subtitle>

        <motion.div variants={itemVariants}>
          <TimeframeSelector onTimeframeChange={handleTimeframeChange} />
        </motion.div>

        <FeaturesList as={motion.ul} variants={listVariants}>
          {features.map((feature, index) => (
            <FeatureItem as={motion.li} key={index} variants={featureVariants}>
              <FeatureIcon style={{ background: `${feature.color}12`, borderColor: `${feature.color}20` }}>
                <feature.icon size={20} style={{ color: feature.color }} />
              </FeatureIcon>
              <FeatureText>{feature.text}</FeatureText>
              <FeatureArrow style={{ color: feature.color }}>→</FeatureArrow>
            </FeatureItem>
          ))}
        </FeaturesList>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
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

        <Disclaimer as={motion.p} variants={itemVariants}>
          <LockBadge>
            <Star size={10} />
            <span>100% Private</span>
          </LockBadge>
          <span>Your data never leaves your browser. Completely client-side.</span>
        </Disclaimer>
      </ContentWrapper>
    </Container>
  );
};

const GeometricLayer = styled("div", {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: "hidden",
  pointerEvents: "none",
});

const GeometricShape = styled("div", {
  position: "absolute",
  border: "1px solid rgba(0, 240, 255, 0.1)",
  borderRadius: "8px",
  
  variants: {
    variant: {
      ring: {
        borderRadius: "50%",
        borderWidth: "2px",
        borderStyle: "dashed",
        borderColor: "rgba(168, 85, 247, 0.12)",
      },
      triangle: {
        borderRadius: "0",
        clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
        background: "rgba(16, 185, 129, 0.04)",
        border: "none",
      },
      dots: {
        border: "none",
        backgroundImage: "radial-gradient(rgba(245, 158, 11, 0.2) 2px, transparent 2px)",
        backgroundSize: "12px 12px",
      },
    },
  },
});

const OrbContainer = styled("div", {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: "hidden",
  pointerEvents: "none",
});

const Orb = styled("div", {
  position: "absolute",
  borderRadius: "50%",
  filter: "blur(100px)",
});

const GridOverlay = styled("div", {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `
    linear-gradient(rgba(0, 240, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.02) 1px, transparent 1px)
  `,
  backgroundSize: "80px 80px",
  pointerEvents: "none",
  opacity: 0.5,
});

const ParticleField = styled("div", {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: "none",
  overflow: "hidden",
});

const Particle = styled("div", {
  position: "absolute",
  borderRadius: "50%",
  boxShadow: "0 0 8px currentColor",
});

const LogoBadge = styled("div", {
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
  padding: "12px 24px",
  background: "rgba(0, 240, 255, 0.06)",
  border: "1px solid rgba(0, 240, 255, 0.15)",
  borderRadius: "999px",
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#00f0ff",
  marginBottom: "2.5rem",
  backdropFilter: "blur(12px)",
  position: "relative",
  overflow: "hidden",
});

const BadgeIcon = styled("span", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "26px",
  height: "26px",
  borderRadius: "8px",
  background: "linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(0, 240, 255, 0.1) 100%)",
});

const BadgeGlow = styled("div", {
  position: "absolute",
  top: "50%",
  left: "-20%",
  width: "140%",
  height: "200%",
  background: "linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.1), transparent)",
  transform: "translateY(-50%) rotate(-15deg)",
  animation: "shimmer 3s ease-in-out infinite",
  pointerEvents: "none",
});

const FeatureIcon = styled("span", {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "44px",
  height: "44px",
  borderRadius: "12px",
  border: "1px solid",
  flexShrink: 0,
  transition: "all 0.25s ease",
  
  "li:hover &": {
    transform: "scale(1.1) rotate(5deg)",
  },
});

const FeatureText = styled("span", {
  flex: 1,
  marginLeft: "14px",
  fontWeight: 500,
  fontSize: "1rem",
  letterSpacing: "-0.01em",
});

const FeatureArrow = styled("span", {
  fontSize: "1.25rem",
  opacity: 0,
  transform: "translateX(-8px)",
  transition: "all 0.25s ease",
  
  "li:hover &": {
    opacity: 1,
    transform: "translateX(0)",
  },
});

const ButtonContent = styled("span", {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  position: "relative",
  zIndex: 1,
});

const LockBadge = styled("span", {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  padding: "4px 10px",
  background: "rgba(16, 185, 129, 0.1)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  borderRadius: "999px",
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "#10b981",
  marginRight: "10px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
});

export default SplashPage;
