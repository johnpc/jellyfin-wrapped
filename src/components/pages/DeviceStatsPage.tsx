import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import PageContainer from "../PageContainer";
import { styled } from "@stitches/react";
import { Monitor, Globe, Cpu, Smartphone, Tv, Laptop } from "lucide-react";

// Get icon for device type
function getDeviceIcon(name: string) {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("tv") || lowerName.includes("roku") || lowerName.includes("firestick")) {
    return <Tv size={20} />;
  }
  if (lowerName.includes("phone") || lowerName.includes("iphone") || lowerName.includes("android")) {
    return <Smartphone size={20} />;
  }
  if (lowerName.includes("mac") || lowerName.includes("laptop")) {
    return <Laptop size={20} />;
  }
  return <Monitor size={20} />;
}

export default function DeviceStatsPage() {
  const { deviceStats, isLoading } = useData();
  const { data: deviceStatsData } = deviceStats;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!deviceStatsData) {
    return <LoadingSpinner />;
  }

  const { deviceUsage, browserUsage, osUsage } = deviceStatsData;

  // Calculate totals for percentages
  const deviceTotal = deviceUsage.reduce((sum, d) => sum + d.count, 0);
  const browserTotal = browserUsage.reduce((sum, d) => sum + d.count, 0);
  const osTotal = osUsage.reduce((sum, d) => sum + d.count, 0);

  return (
    <PageContainer>
      <Container size="4" p="4">
        <Grid gap="6">
          <HeaderSection>
            <Title as={motion.h1} variants={itemVariants}>
              Your Viewing Devices
            </Title>
            <Subtitle>
              Where you watch your content across different devices and apps
            </Subtitle>
          </HeaderSection>

          <StatsGrid>
            {/* Devices Section */}
            {deviceUsage.length > 0 && (
              <StatSection
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <SectionHeader>
                  <Monitor size={24} />
                  <SectionTitle>Devices</SectionTitle>
                </SectionHeader>
                <StatList>
                  {deviceUsage.slice(0, 8).map((device, index) => {
                    const percentage = Math.round((device.count / deviceTotal) * 100);
                    return (
                      <StatItem key={device.name}>
                        <StatRank>{index + 1}</StatRank>
                        <StatIcon>{getDeviceIcon(device.name)}</StatIcon>
                        <StatInfo>
                          <StatName>{device.name}</StatName>
                          <ProgressBar>
                            <ProgressFill style={{ width: `${percentage}%` }} variant="cyan" />
                          </ProgressBar>
                        </StatInfo>
                        <StatValue>
                          <StatCount>{device.count.toLocaleString()}</StatCount>
                          <StatPercent>{percentage}%</StatPercent>
                        </StatValue>
                      </StatItem>
                    );
                  })}
                </StatList>
              </StatSection>
            )}

            {/* Clients/Apps Section */}
            {browserUsage.length > 0 && (
              <StatSection
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <SectionHeader>
                  <Globe size={24} />
                  <SectionTitle>Apps & Clients</SectionTitle>
                </SectionHeader>
                <StatList>
                  {browserUsage.slice(0, 8).map((browser, index) => {
                    const percentage = Math.round((browser.count / browserTotal) * 100);
                    return (
                      <StatItem key={browser.name}>
                        <StatRank>{index + 1}</StatRank>
                        <StatIcon><Globe size={20} /></StatIcon>
                        <StatInfo>
                          <StatName>{browser.name}</StatName>
                          <ProgressBar>
                            <ProgressFill style={{ width: `${percentage}%` }} variant="violet" />
                          </ProgressBar>
                        </StatInfo>
                        <StatValue>
                          <StatCount>{browser.count.toLocaleString()}</StatCount>
                          <StatPercent>{percentage}%</StatPercent>
                        </StatValue>
                      </StatItem>
                    );
                  })}
                </StatList>
              </StatSection>
            )}

            {/* OS Section */}
            {osUsage.length > 0 && (
              <StatSection
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SectionHeader>
                  <Cpu size={24} />
                  <SectionTitle>Operating Systems</SectionTitle>
                </SectionHeader>
                <StatList>
                  {osUsage.slice(0, 8).map((os, index) => {
                    const percentage = Math.round((os.count / osTotal) * 100);
                    return (
                      <StatItem key={os.name}>
                        <StatRank>{index + 1}</StatRank>
                        <StatIcon><Cpu size={20} /></StatIcon>
                        <StatInfo>
                          <StatName>{os.name}</StatName>
                          <ProgressBar>
                            <ProgressFill style={{ width: `${percentage}%` }} variant="gold" />
                          </ProgressBar>
                        </StatInfo>
                        <StatValue>
                          <StatCount>{os.count.toLocaleString()}</StatCount>
                          <StatPercent>{percentage}%</StatPercent>
                        </StatValue>
                      </StatItem>
                    );
                  })}
                </StatList>
              </StatSection>
            )}
          </StatsGrid>
        </Grid>
      </Container>
    </PageContainer>
  );
}

const HeaderSection = styled("div", {
  textAlign: "center",
  marginBottom: "1rem",
});

const Subtitle = styled("p", {
  fontSize: "1.125rem",
  color: "#94a3b8",
  marginTop: "0.5rem",
});

const StatsGrid = styled("div", {
  display: "grid",
  gap: "1.5rem",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  
  "@media (max-width: 768px)": {
    gridTemplateColumns: "1fr",
  },
});

const StatSection = styled("div", {
  background: "rgba(18, 21, 28, 0.8)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.05)",
  borderRadius: "18px",
  padding: "24px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
});

const SectionHeader = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "20px",
  color: "#00f0ff",
});

const SectionTitle = styled("h3", {
  fontSize: "1.25rem",
  fontWeight: 700,
  color: "#f8fafc",
  margin: 0,
});

const StatList = styled("div", {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
});

const StatItem = styled("div", {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px",
  background: "rgba(255, 255, 255, 0.02)",
  borderRadius: "12px",
  transition: "all 0.2s ease",
  
  "&:hover": {
    background: "rgba(255, 255, 255, 0.05)",
  },
});

const StatRank = styled("span", {
  width: "24px",
  height: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0, 240, 255, 0.1)",
  borderRadius: "6px",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#00f0ff",
});

const StatIcon = styled("div", {
  color: "#64748b",
  display: "flex",
  alignItems: "center",
});

const StatInfo = styled("div", {
  flex: 1,
  minWidth: 0,
});

const StatName = styled("span", {
  display: "block",
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "#f8fafc",
  marginBottom: "6px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const ProgressBar = styled("div", {
  height: "4px",
  background: "rgba(255, 255, 255, 0.1)",
  borderRadius: "2px",
  overflow: "hidden",
});

const ProgressFill = styled("div", {
  height: "100%",
  borderRadius: "2px",
  transition: "width 0.5s ease",
  
  variants: {
    variant: {
      cyan: {
        background: "linear-gradient(90deg, #00f0ff 0%, #22d3ee 100%)",
      },
      violet: {
        background: "linear-gradient(90deg, #a855f7 0%, #c084fc 100%)",
      },
      gold: {
        background: "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)",
      },
    },
  },
  
  defaultVariants: {
    variant: "cyan",
  },
});

const StatValue = styled("div", {
  textAlign: "right",
  minWidth: "70px",
});

const StatCount = styled("span", {
  display: "block",
  fontSize: "0.9rem",
  fontWeight: 700,
  color: "#f8fafc",
});

const StatPercent = styled("span", {
  display: "block",
  fontSize: "0.75rem",
  color: "#64748b",
});
