import { motion } from "framer-motion";
import BlinkingStars from "../BlinkingStars";
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

const NEXT_PAGE = "/configure";
const SplashPage = () => {
  const navigate = useNavigate();

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  // Child element animation variants
  const itemVariants = {
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

  // Feature list item animations with stagger
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.6,
      },
    },
  };

  const featureVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <Container>
      <ContentWrapper
        as={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Title as={motion.h1} variants={itemVariants}>
          Jellyfin Wrapped
        </Title>
        <BlinkingStars />

        <Subtitle as={motion.p} variants={itemVariants}>
          Discover your year in entertainment with a personalized recap of your
          Jellyfin watching habits
        </Subtitle>

        <FeaturesList as={motion.ul} variants={listVariants}>
          {[
            "📺 See your most-watched shows",
            "⭐ Review your favorite movies",
            "📊 Get insights into your viewing patterns",
          ].map((feature, index) => (
            <FeatureItem as={motion.li} key={index} variants={featureVariants}>
              {feature}
            </FeatureItem>
          ))}
        </FeaturesList>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <StyledButton
            onClick={() => {
              void navigate(NEXT_PAGE);
            }}
          >
            Connect Your Jellyfin Server
          </StyledButton>
        </motion.div>

        <Disclaimer as={motion.p} variants={itemVariants}>
          Jellyfin Wrapped is an entirely client-side application. Your data
          stays private and is never sent to any external service.
        </Disclaimer>
      </ContentWrapper>
    </Container>
  );
};

export default SplashPage;
