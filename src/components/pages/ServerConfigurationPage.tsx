import React, { ChangeEvent, useState } from "react";
import { styled } from "@stitches/react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { User, Lock, ChevronRight, Shield, Zap } from "lucide-react";

import { login as backendLogin } from "@/lib/backend-api";
import {
  getCacheValue,
  JELLYFIN_USERNAME_CACHE_KEY,
  setCacheValue,
} from "@/lib/cache";

const NEXT_PAGE = "/loading";

const ServerConfigurationPage = () => {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>(
    () => getCacheValue(JELLYFIN_USERNAME_CACHE_KEY) || ""
  );
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setCacheValue(JELLYFIN_USERNAME_CACHE_KEY, value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConnect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await backendLogin(username, password);
      void navigate(NEXT_PAGE);
    } catch (e) {
      showBoundary(e);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <Container>
      {/* Geometric background elements */}
      <GeometricBackground>
        <GeometricShape
          as={motion.div}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ top: "10%", left: "5%", width: "150px", height: "150px" }}
        />
        <GeometricShape
          as={motion.div}
          variant="ring"
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          style={{ bottom: "15%", right: "8%", width: "200px", height: "200px" }}
        />
      </GeometricBackground>

      {/* Orb effects */}
      <OrbContainer>
        <Orb 
          as={motion.div}
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ 
            top: "5%", 
            right: "15%", 
            width: "500px", 
            height: "500px", 
            background: "radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%)" 
          }}
        />
        <Orb 
          as={motion.div}
          animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          style={{ 
            bottom: "5%", 
            left: "0%", 
            width: "600px", 
            height: "600px", 
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.06) 0%, transparent 70%)" 
          }}
        />
      </OrbContainer>

      <FormCard
        as={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <CardAccent />
        
        <CardHeader as={motion.div} variants={itemVariants}>
          <IconWrapper>
            <Zap size={26} />
          </IconWrapper>
          <Title>Connect to Jellyfin</Title>
          <Subtitle>Enter your credentials to begin your personalized recap</Subtitle>
        </CardHeader>

        <form onSubmit={(e) => void handleConnect(e)}>
          <FormContent>
            <motion.div variants={itemVariants}>
              <ServerDisplay>
                <Shield size={16} />
                <span>Secure connection</span>
              </ServerDisplay>
            </motion.div>

            <motion.div variants={itemVariants}>
              <InputGroup>
                <InputLabel>
                  <User size={14} />
                  Username
                </InputLabel>
                <InputWrapper>
                  <StyledInput
                    type="text"
                    placeholder="Your Jellyfin username"
                    value={username}
                    onChange={handleUsernameChange}
                    required
                  />
                </InputWrapper>
              </InputGroup>

              <InputGroup>
                <InputLabel>
                  <Lock size={14} />
                  Password
                </InputLabel>
                <InputWrapper>
                  <StyledInput
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                </InputWrapper>
                <InputHint>Leave empty if no password is set</InputHint>
              </InputGroup>
            </motion.div>

            <motion.div variants={itemVariants}>
              <SubmitButton type="submit" disabled={isLoading}>
                <ButtonContent>
                  <span>{isLoading ? "Connecting..." : "Connect to Server"}</span>
                  {!isLoading && <ChevronRight size={20} />}
                  {isLoading && <LoadingSpinnerStyled />}
                </ButtonContent>
                <ButtonGlow />
              </SubmitButton>
            </motion.div>
          </FormContent>
        </form>

        <Footer as={motion.div} variants={itemVariants}>
          <FooterBadge>
            <Shield size={14} />
            <span>100% Private</span>
          </FooterBadge>
          <FooterText>
            Credentials are sent securely to the backend
          </FooterText>
        </Footer>
      </FormCard>
    </Container>
  );
};

const Container = styled("div", {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  position: "relative",
  overflow: "hidden",
  
  background: `
    radial-gradient(ellipse at 30% 20%, rgba(0, 240, 255, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(168, 85, 247, 0.04) 0%, transparent 50%),
    linear-gradient(180deg, #030304 0%, #08090c 50%, #030304 100%)
  `,
});

const GeometricBackground = styled("div", {
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
  border: "1px solid rgba(0, 240, 255, 0.06)",
  borderRadius: "12px",
  
  variants: {
    variant: {
      ring: {
        borderRadius: "50%",
        borderWidth: "2px",
        borderStyle: "dashed",
        borderColor: "rgba(168, 85, 247, 0.08)",
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
  filter: "blur(80px)",
});

const FormCard = styled("div", {
  width: "100%",
  maxWidth: "520px",
  background: "rgba(12, 14, 18, 0.85)",
  backdropFilter: "blur(48px) saturate(180%)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  borderRadius: "32px",
  padding: "48px",
  position: "relative",
  overflow: "hidden",
  
  "@media (max-width: 540px)": {
    padding: "36px 28px",
    borderRadius: "28px",
  },
});

const CardAccent = styled("div", {
  position: "absolute",
  top: 0,
  left: "50%",
  transform: "translateX(-50%)",
  width: "45%",
  height: "2px",
  background: "linear-gradient(90deg, transparent, #00f0ff, transparent)",
});

const CardHeader = styled("div", {
  textAlign: "center",
  marginBottom: "40px",
});

const IconWrapper = styled("div", {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "64px",
  height: "64px",
  background: "linear-gradient(135deg, #00f0ff 0%, #22d3ee 50%, #10b981 100%)",
  borderRadius: "20px",
  marginBottom: "24px",
  color: "#030304",
  boxShadow: "0 8px 32px rgba(0, 240, 255, 0.3)",
});

const Title = styled("h1", {
  fontSize: "1.85rem",
  fontWeight: 700,
  color: "#f8fafc",
  marginBottom: "10px",
  letterSpacing: "-0.03em",
});

const Subtitle = styled("p", {
  fontSize: "1rem",
  color: "#94a3b8",
  lineHeight: 1.6,
});

const FormContent = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
});

const InputGroup = styled("div", {
  marginBottom: "6px",
});

const InputLabel = styled("label", {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "0.85rem",
  fontWeight: 500,
  color: "#94a3b8",
  marginBottom: "12px",
  
  "& svg": {
    color: "#475569",
  },
});

const InputWrapper = styled("div", {
  position: "relative",
});

const StyledInput = styled("input", {
  width: "100%",
  padding: "18px 20px",
  background: "rgba(18, 21, 28, 0.8)",
  border: "1px solid rgba(255, 255, 255, 0.04)",
  borderRadius: "16px",
  color: "#f8fafc",
  fontSize: "1rem",
  fontFamily: "'Sora', sans-serif",
  transition: "all 0.25s ease",
  
  "&::placeholder": {
    color: "#475569",
  },
  
  "&:focus": {
    outline: "none",
    borderColor: "rgba(0, 240, 255, 0.4)",
    background: "rgba(24, 28, 38, 0.9)",
    boxShadow: "0 0 0 3px rgba(0, 240, 255, 0.1)",
  },
  
  "&:hover:not(:focus)": {
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
});

const InputHint = styled("p", {
  fontSize: "0.75rem",
  color: "#475569",
  marginTop: "10px",
});

const ServerDisplay = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "16px 20px",
  background: "rgba(16, 185, 129, 0.06)",
  border: "1px solid rgba(16, 185, 129, 0.12)",
  borderRadius: "14px",
  fontSize: "0.9rem",
  color: "#10b981",
  fontFamily: "'JetBrains Mono', monospace",
});

const SubmitButton = styled("button", {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px 28px",
  background: "linear-gradient(135deg, #00f0ff 0%, #22d3ee 40%, #10b981 100%)",
  backgroundSize: "200% 200%",
  border: "none",
  borderRadius: "16px",
  color: "#030304",
  fontSize: "1.05rem",
  fontWeight: 700,
  fontFamily: "'Sora', sans-serif",
  cursor: "pointer",
  transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
  boxShadow: "0 6px 32px rgba(0, 240, 255, 0.25)",
  marginTop: "12px",
  position: "relative",
  overflow: "hidden",
  
  "&:hover:not(:disabled)": {
    transform: "translateY(-3px)",
    boxShadow: "0 10px 44px rgba(0, 240, 255, 0.35)",
    backgroundPosition: "100% 100%",
  },
  
  "&:active:not(:disabled)": {
    transform: "translateY(-1px)",
  },
  
  "&:disabled": {
    opacity: 0.7,
    cursor: "not-allowed",
  },
});

const ButtonContent = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  position: "relative",
  zIndex: 1,
});

const ButtonGlow = styled("div", {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)",
  pointerEvents: "none",
  borderRadius: "16px",
});

const LoadingSpinnerStyled = styled("div", {
  width: "22px",
  height: "22px",
  border: "2px solid rgba(3, 3, 4, 0.3)",
  borderTopColor: "#030304",
  borderRadius: "50%",
  animation: "spin 0.8s linear infinite",
});

const Footer = styled("div", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
  marginTop: "32px",
  paddingTop: "24px",
  borderTop: "1px solid rgba(255, 255, 255, 0.04)",
});

const FooterBadge = styled("div", {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 14px",
  background: "rgba(16, 185, 129, 0.08)",
  border: "1px solid rgba(16, 185, 129, 0.12)",
  borderRadius: "999px",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#10b981",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
});

const FooterText = styled("p", {
  fontSize: "0.8rem",
  color: "#475569",
  textAlign: "center",
});

export default ServerConfigurationPage;
