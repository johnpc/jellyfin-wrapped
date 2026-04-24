import { motion } from "framer-motion";
import BlinkingStars from "../BlinkingStars";
import { useNavigate } from "react-router-dom";
import {
  Container,
  StyledButton,
} from "../ui/styled";
import TimeframeSelector from "../TimeframeSelector";
import { TimeframeOption } from "../../lib/timeframe";
import type { Variants } from "framer-motion";

const NEXT_PAGE = "/configure";
const SplashPage = () => {
  const navigate = useNavigate();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.6 } },
  };

  const featureVariants: Variants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const handleTimeframeChange = (timeframe: TimeframeOption) => {
    console.log(`Timeframe changed to: ${timeframe.name}`);
  };

  return (
    <Container>
      <motion.div
        style={{ maxWidth: "800px", textAlign: "center", padding: "40px" }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          style={{
            fontSize: "clamp(2rem, 5vw, 4rem)",
            fontWeight: "bold",
            marginBottom: "1rem",
            background: "linear-gradient(90deg, #FFD700 0%, #00E1FF 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 30px rgba(255, 215, 0, 0.3)",
          }}
          variants={itemVariants}
        >
          Jellyfin Wrapped
        </motion.h1>
        <BlinkingStars />

        <motion.p
          style={{ fontSize: "1.5rem", marginBottom: "2rem", lineHeight: 1.5, color: "#8BE8FF" }}
          variants={itemVariants}
        >
          Discover your entertainment with a personalized recap of your Jellyfin
          watching habits
        </motion.p>

        <motion.div variants={itemVariants}>
          <TimeframeSelector onTimeframeChange={handleTimeframeChange} />
        </motion.div>

        <motion.ul
          style={{ listStyle: "none", padding: 0, marginBottom: "2rem" }}
          variants={listVariants}
        >
          {[
            "📺 See your most-watched shows",
            "⭐ Review your favorite movies",
            "📊 Get insights into your viewing patterns",
            "🗓️ Choose custom timeframes for your stats",
          ].map((feature, index) => (
            <motion.li
              key={index}
              style={{ fontSize: "1.25rem", margin: "1rem 0", color: "#FFE566", textShadow: "0 0 20px rgba(255, 229, 102, 0.3)" }}
              variants={featureVariants}
            >
              {feature}
            </motion.li>
          ))}
        </motion.ul>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <StyledButton onClick={() => { void navigate(NEXT_PAGE); }}>
            Connect Your Jellyfin Server
          </StyledButton>
        </motion.div>

        <motion.p
          style={{ fontSize: "0.875rem", color: "#E0AAFF", marginTop: "2rem", opacity: 0.9 }}
          variants={itemVariants}
        >
          Jellyfin Wrapped is an entirely client-side application. Your data
          stays private and is never sent to any external service.
        </motion.p>
      </motion.div>
    </Container>
  );
};

export default SplashPage;
