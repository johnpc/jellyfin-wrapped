import React, { ChangeEvent, useState } from "react";
import { Button, Card, Heading, Text, Flex, Box } from "@radix-ui/themes";
import { styled } from "@stitches/react";
import { motion } from "framer-motion";
import { Textarea } from "../ui/textarea";
import { authenticate } from "@/lib/jellyfin-api";
import { useNavigate } from "react-router-dom";

const ServerConfigurationPage = () => {
  const navigate = useNavigate();

  const [serverUrl, setServerUrl] = useState(
    () => localStorage.getItem("jellyfinServerUrl") || "",
  );
  const [username, setUsername] = useState(
    () => localStorage.getItem("jellyfinUsername") || "",
  );
  const [password, setPassword] = useState(
    () => localStorage.getItem("jellyfinPassword") || "",
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleServerUrlChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setServerUrl(value);
    localStorage.setItem("jellyfinServerUrl", value);
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setUsername(value);
    localStorage.setItem("jellyfinUsername", value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPassword(value);
    localStorage.setItem("jellyfinPassword", value);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await authenticate(serverUrl, username, password);
    setIsLoading(false);
    navigate("/movies");
  };
  const Disclaimer = styled("p", {
    fontSize: "0.875rem",
    color: "#2D00F7",
    marginTop: "2rem",
    opacity: 0.9,
  });
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
  return (
    <Container>
      <StyledCard asChild>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleConnect}>
            <Flex direction="column" gap="6">
              <Box>
                <Heading size="7" align="center" mb="4">
                  Connect to Jellyfin
                </Heading>
                <Text size="3" align="center" color="gray">
                  Enter your Jellyfin server details to get started
                </Text>
              </Box>

              <Flex direction="column" gap="4">
                <Textarea
                  placeholder="Server URL (e.g., http://localhost:8096)"
                  value={serverUrl}
                  onChange={handleServerUrlChange}
                  required
                />

                <Textarea
                  placeholder="Username"
                  value={username}
                  onChange={handleUsernameChange}
                  required
                />

                <Textarea
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                />
              </Flex>

              <StyledButton size="3" disabled={isLoading}>
                {isLoading ? "Connecting..." : "Connect to Server"}
              </StyledButton>
            </Flex>
          </form>
          <Disclaimer as={motion.div} variants={itemVariants}>
            Jellyfin Wrapped is an entirely client-side application. Your data
            stays private and is never sent to any external service.
          </Disclaimer>
        </motion.div>
      </StyledCard>
    </Container>
  );
};

const Container = styled("div", {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #2D00F7 0%, #4D2DFF 50%, #6A00FF 100%)",
  padding: "20px",
});

const StyledCard = styled(Card, {
  width: "100%",
  maxWidth: "500px",
  padding: "40px",
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
});

const StyledButton = styled(Button, {
  backgroundColor: "#FFD700 !important",
  color: "#2D00F7 !important",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all 0.2s ease",
  boxShadow: "0 0 20px rgba(255, 215, 0, 0.3)",
  border: "none",
  width: "100%",

  "&:hover": {
    backgroundColor: "#FFF000 !important",
    transform: "scale(1.02)",
    boxShadow: "0 0 30px rgba(255, 215, 0, 0.5)",
  },

  "&:disabled": {
    opacity: 0.7,
    cursor: "not-allowed",
    transform: "none",
  },
});

export default ServerConfigurationPage;
