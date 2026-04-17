import React, { ChangeEvent, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { User, Lock, ChevronRight, Shield, Zap } from "lucide-react";

import { login as backendLogin } from "@/lib/backend-api";
import {
  getCacheValue,
  JELLYFIN_USERNAME_CACHE_KEY,
  setCacheValue,
} from "@/lib/cache";
import { getAvailablePages } from "@/lib/navigation";

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
      // Determine redirect URL - use first available page or default to /total-time
      const availablePages = getAvailablePages();
      const redirectUrl = availablePages.length > 0 ? availablePages[0] : "/total-time";
      // Ensure we never redirect back to /loading
      const safeRedirectUrl = redirectUrl === "/loading" ? "/total-time" : redirectUrl;
      void navigate(`/loading?redirect=${encodeURIComponent(safeRedirectUrl)}`);
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
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  };

  return (
    <Container>
      {/* Geometric background elements */}
      <GeometricBackground>
        <GeometricShape
          style={{
            animation: "spin 40s linear infinite",
            top: "10%",
            left: "5%",
            width: "150px",
            height: "150px"
          }}
        />
        <GeometricShapeRing
          style={{
            animation: "spin-reverse 35s linear infinite",
            bottom: "15%",
            right: "8%",
            width: "200px",
            height: "200px"
          }}
        />
      </GeometricBackground>

      {/* Orb effects */}
      <OrbContainer>
        <Orb
          style={{
            top: "5%",
            right: "15%",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%)",
            animation: "orb-float 12s ease-in-out infinite",
          }}
        />
        <Orb
          style={{
            bottom: "5%",
            left: "0%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.06) 0%, transparent 70%)",
            animation: "orb-float 16s ease-in-out infinite",
          }}
        />
      </OrbContainer>

      <motion.div
        style={{ width: "100%", maxWidth: "520px", background: "rgba(12, 14, 18, 0.85)", backdropFilter: "blur(48px) saturate(180%)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "32px", padding: "48px", position: "relative", overflow: "hidden" }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <CardAccent />

        <motion.div style={{ textAlign: "center", marginBottom: "40px" }} variants={itemVariants}>
          <IconWrapper>
            <Zap size={26} />
          </IconWrapper>
          <h1 style={{ fontSize: "1.85rem", fontWeight: 700, color: "#f8fafc", marginBottom: "10px", letterSpacing: "-0.03em" }}>Connect to Jellyfin</h1>
          <p style={{ fontSize: "1rem", color: "#94a3b8", lineHeight: 1.6 }}>Enter your credentials to begin your personalized recap</p>
        </motion.div>

        <form onSubmit={(e) => void handleConnect(e)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <motion.div variants={itemVariants}>
              <div style={{ marginBottom: "6px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 500, color: "#94a3b8", marginBottom: "12px" }}>
                  <User size={14} />
                  Username
                </label>
                <div style={{ position: "relative" }}>
                  <StyledInput
                    type="text"
                    placeholder="Your Jellyfin username"
                    value={username}
                    onChange={handleUsernameChange}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: "6px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 500, color: "#94a3b8", marginBottom: "12px" }}>
                  <Lock size={14} />
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <StyledInput
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <SubmitButton type="submit" disabled={isLoading}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative", zIndex: 1 }}>
                  <span>{isLoading ? "Connecting..." : "Connect to Server"}</span>
                  {!isLoading && <ChevronRight size={20} />}
                  {isLoading && <LoadingSpinnerStyled />}
                </div>
                <ButtonGlow />
              </SubmitButton>
            </motion.div>
          </div>
        </form>

        <motion.div
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(255, 255, 255, 0.04)" }}
          variants={itemVariants}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.12)", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            <Shield size={14} />
            <span>100% Private</span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "#475569", textAlign: "center" }}>
            Credentials are sent securely to the backend
          </p>
        </motion.div>
      </motion.div>
    </Container>
  );
};

const Container = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden", background: "radial-gradient(ellipse at 30% 20%, rgba(0, 240, 255, 0.05) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(168, 85, 247, 0.04) 0%, transparent 50%), linear-gradient(180deg, #030304 0%, #08090c 50%, #030304 100%)", ...style }} {...props}>{children}</div>
);

const GeometricBackground = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none", ...style }} {...props}>{children}</div>
);

const GeometricShape = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", border: "1px solid rgba(0, 240, 255, 0.06)", borderRadius: "12px", ...style }} {...props} />
);

const GeometricShapeRing = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", borderRadius: "50%", borderWidth: "2px", borderStyle: "dashed", borderColor: "rgba(168, 85, 247, 0.08)", ...style }} {...props} />
);

const OrbContainer = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden", pointerEvents: "none", ...style }} {...props}>{children}</div>
);

const Orb = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", borderRadius: "50%", filter: "blur(80px)", ...style }} {...props} />
);

const CardAccent = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "45%", height: "2px", background: "linear-gradient(90deg, transparent, #00f0ff, transparent)", ...style }} {...props} />
);

const IconWrapper = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "64px", height: "64px", background: "linear-gradient(135deg, #00f0ff 0%, #22d3ee 50%, #10b981 100%)", borderRadius: "20px", marginBottom: "24px", color: "#030304", boxShadow: "0 8px 32px rgba(0, 240, 255, 0.3)", ...style }} {...props}>{children}</div>
);

const StyledInput = ({ style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input style={{ width: "100%", padding: "18px 20px", background: "rgba(18, 21, 28, 0.8)", border: "1px solid rgba(255, 255, 255, 0.04)", borderRadius: "16px", color: "#f8fafc", fontSize: "1rem", fontFamily: "'Sora', sans-serif", transition: "all 0.25s ease", boxSizing: "border-box", ...style }} {...props} />
);

const SubmitButton = ({ children, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 28px", background: "linear-gradient(135deg, #00f0ff 0%, #22d3ee 40%, #10b981 100%)", backgroundSize: "200% 200%", border: "none", borderRadius: "16px", color: "#030304", fontSize: "1.05rem", fontWeight: 700, fontFamily: "'Sora', sans-serif", cursor: "pointer", transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)", boxShadow: "0 6px 32px rgba(0, 240, 255, 0.25)", marginTop: "12px", position: "relative", overflow: "hidden", ...style }} {...props}>{children}</button>
);

const ButtonGlow = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)", pointerEvents: "none", borderRadius: "16px", ...style }} {...props} />
);

const LoadingSpinnerStyled = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{ width: "22px", height: "22px", border: "2px solid rgba(3, 3, 4, 0.3)", borderTopColor: "#030304", borderRadius: "50%", animation: "spin 0.8s linear infinite", ...style }} {...props} />
);

export default ServerConfigurationPage;
