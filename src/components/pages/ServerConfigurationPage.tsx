import React, { ChangeEvent, useState } from "react";
import { Button, Card, Heading, Text, Flex, Box } from "@radix-ui/themes";
import { styled } from "@stitches/react";
import { motion } from "framer-motion";
import { Textarea } from "../ui/textarea";
import {
  authenticateByUserName,
  authenticateByAuthToken,
} from "@/lib/jellyfin-api";
import { useNavigate } from "react-router-dom";
import {
  getCacheValue,
  JELLYFIN_AUTH_TOKEN_CACHE_KEY,
  JELLYFIN_PASSWORD_CACHE_KEY,
  JELLYFIN_SERVER_URL_CACHE_KEY,
  JELLYFIN_USERNAME_CACHE_KEY,
  setCacheValue,
} from "@/lib/cache";
import { useErrorBoundary } from "react-error-boundary";
type WindowOverride = typeof Window & {
  ENV:
    | {
        FORCE_JELLYFIN_SERVER_URL: string;
      }
    | undefined;
};
const ServerConfigurationPage = () => {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const serverUrlOverride = (window as unknown as WindowOverride).ENV
    ?.FORCE_JELLYFIN_SERVER_URL;

  const [serverUrl, setServerUrl] = useState<string>(
    () =>
      serverUrlOverride || getCacheValue(JELLYFIN_SERVER_URL_CACHE_KEY) || "",
  );
  const [authToken, setAuthToken] = useState<string>(
    () => getCacheValue(JELLYFIN_AUTH_TOKEN_CACHE_KEY) || "",
  );
  const [username, setUsername] = useState<string>(
    () => getCacheValue(JELLYFIN_USERNAME_CACHE_KEY) || "",
  );
  const [password, setPassword] = useState<string>(
    () => getCacheValue(JELLYFIN_PASSWORD_CACHE_KEY) || "",
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleServerUrlChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setServerUrl(value);
    setCacheValue(JELLYFIN_SERVER_URL_CACHE_KEY, value);
  };

  const handleUsernameChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setUsername(value);
    setCacheValue(JELLYFIN_USERNAME_CACHE_KEY, value);
  };

  const handleAuthTokenChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setAuthToken(value);
    setCacheValue(JELLYFIN_AUTH_TOKEN_CACHE_KEY, value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPassword(value);
    setCacheValue(JELLYFIN_PASSWORD_CACHE_KEY, value);
  };

  const handleConnect = async (e: React.FormEvent<HTMLFormElement>) => {
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    e.preventDefault();
    setIsLoading(true);
    try {
      if (authToken) {
        authenticateByAuthToken(serverUrl, authToken);
      } else {
        await authenticateByUserName(serverUrl, username, password);
      }

      void navigate("/movies");
    } catch (e) {
      showBoundary(e);
    } finally {
      setIsLoading(false);
    }
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
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  const currentUrl = `${protocol}//${hostname}${port ? ":" + port : ""}`;

  return (
    <Container>
      <StyledCard asChild>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={(e) => void handleConnect(e)}>
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
                {serverUrlOverride ? null : (
                  <>
                    <Textarea
                      placeholder="Server URL (e.g., http://localhost:8096)"
                      value={serverUrl}
                      onChange={handleServerUrlChange}
                      required
                    />
                    {protocol !== "https" ? null : (
                      <Disclaimer as={motion.div} variants={itemVariants}>
                        You are accessing Jellyfin Wrapped via https. You must
                        either use an https server url or follow these steps:
                        <ol>
                          <li>
                            Click the lock icon next to the URL in the address
                            bar
                          </li>
                          <li>Click "Site Settings"</li>
                          <li>
                            Find "Insecure content" and change it to "Allow" for{" "}
                            {currentUrl}
                          </li>
                        </ol>
                      </Disclaimer>
                    )}
                  </>
                )}

                {serverUrlOverride ? null : (
                  <Textarea
                    placeholder="Auth Token - Optional. If supplied, username/password fields are ignored"
                    value={authToken}
                    onChange={handleAuthTokenChange}
                    required={!username && !password}
                  />
                )}

                <Textarea
                  placeholder={`Username${serverUrlOverride ? "" : " - not required if Auth Token is specified"}`}
                  value={username}
                  onChange={handleUsernameChange}
                  required={!authToken}
                />

                <Textarea
                  placeholder={`Password${serverUrlOverride ? "" : " - not required if Auth Token is specified"}`}
                  value={password}
                  onChange={handlePasswordChange}
                  required={!authToken}
                />
              </Flex>

              <StyledButton size="3" disabled={isLoading}>
                {isLoading ? "Connecting..." : "Connect to Server"}
              </StyledButton>
            </Flex>
          </form>

          <Disclaimer as={motion.div} variants={itemVariants}>
            Auth token can be found by following these steps:
            <ol>
              <li>Log into your Jellyfin web interface</li>
              <li>
                Open your browser's Developer Tools (usually F12 or right-click
                then Inspect)
              </li>
              <li>Go to the "Network" tab in Developer Tools</li>
              <li>Look for requests to your Jellyfin server</li>
              <li>
                In the request headers, find "X-MediaBrowser-Token" or
                "Authorization"
              </li>
            </ol>
          </Disclaimer>

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
