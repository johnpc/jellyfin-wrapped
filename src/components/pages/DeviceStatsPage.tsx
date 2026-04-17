import React from "react";
import { Container, Grid } from "@radix-ui/themes";
import { motion } from "motion/react";
import { itemVariants } from "@/lib/styled-variants";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import PageContainer from "../PageContainer";
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
              Your Viewing Devices
            </motion.h1>
            <Subtitle>
              Where you watch your content across different devices and apps
            </Subtitle>
          </HeaderSection>

          <StatsGrid>
            {/* Devices Section */}
            {deviceUsage.length > 0 && (
              <motion.div
                style={{
                  background: "rgba(18, 21, 28, 0.8)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "18px",
                  padding: "24px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                }}
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
                            <ProgressFill style={{ width: `${percentage}%`, background: "linear-gradient(90deg, #00f0ff 0%, #22d3ee 100%)" }} />
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
              </motion.div>
            )}

            {/* Clients/Apps Section */}
            {browserUsage.length > 0 && (
              <motion.div
                style={{
                  background: "rgba(18, 21, 28, 0.8)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "18px",
                  padding: "24px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                }}
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
                            <ProgressFill style={{ width: `${percentage}%`, background: "linear-gradient(90deg, #a855f7 0%, #c084fc 100%)" }} />
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
              </motion.div>
            )}

            {/* OS Section */}
            {osUsage.length > 0 && (
              <motion.div
                style={{
                  background: "rgba(18, 21, 28, 0.8)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "18px",
                  padding: "24px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                }}
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
                            <ProgressFill style={{ width: `${percentage}%`, background: "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)" }} />
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
              </motion.div>
            )}
          </StatsGrid>
        </Grid>
      </Container>
    </PageContainer>
  );
}

const HeaderSection = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      textAlign: "center",
      marginBottom: "1rem",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const Subtitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    style={{
      fontSize: "1.125rem",
      color: "#94a3b8",
      marginTop: "0.5rem",
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
);

const StatsGrid = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "grid",
      gap: "1.5rem",
      gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const SectionHeader = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "20px",
      color: "#00f0ff",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const SectionTitle = ({ children, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    style={{
      fontSize: "1.25rem",
      fontWeight: 700,
      color: "#f8fafc",
      margin: 0,
      ...style,
    }}
    {...props}
  >
    {children}
  </h3>
);

const StatList = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const StatItem = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px",
      background: "rgba(255, 255, 255, 0.02)",
      borderRadius: "12px",
      transition: "all 0.2s ease",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const StatRank = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
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
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);

const StatIcon = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      color: "#64748b",
      display: "flex",
      alignItems: "center",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const StatInfo = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      flex: 1,
      minWidth: 0,
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const StatName = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      display: "block",
      fontSize: "0.95rem",
      fontWeight: 600,
      color: "#f8fafc",
      marginBottom: "6px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);

const ProgressBar = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      height: "4px",
      background: "rgba(255, 255, 255, 0.1)",
      borderRadius: "2px",
      overflow: "hidden",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const ProgressFill = ({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      height: "100%",
      borderRadius: "2px",
      transition: "width 0.5s ease",
      background: "linear-gradient(90deg, #00f0ff 0%, #22d3ee 100%)",
      ...style,
    }}
    {...props}
  />
);

const StatValue = ({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    style={{
      textAlign: "right",
      minWidth: "70px",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

const StatCount = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      display: "block",
      fontSize: "0.9rem",
      fontWeight: 700,
      color: "#f8fafc",
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);

const StatPercent = ({ children, style, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    style={{
      display: "block",
      fontSize: "0.75rem",
      color: "#64748b",
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);
