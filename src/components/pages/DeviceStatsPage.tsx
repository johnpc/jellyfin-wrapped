import { useRef } from "react";
import { Container, Grid, Box, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useErrorBoundary } from "react-error-boundary";
import { useNavigate } from "react-router-dom";
import * as d3 from "d3";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { useDeviceStats } from "@/hooks/queries/useDeviceStats";
import { LoadingSpinner } from "../LoadingSpinner";
import { PieChart } from "../charts/PieChart";

const NEXT_PAGE = "/oldest-movie";

const CHART_COLORS = {
  devices: d3.schemeSet3,
  browsers: d3.schemePaired,
  os: d3.schemeTableau10,
};

export default function DeviceStatsPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const { data: deviceStats, isLoading, error } = useDeviceStats();
  const containerRef = useRef<HTMLDivElement>(null);

  if (error) {
    showBoundary(error);
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!deviceStats) {
    void navigate(NEXT_PAGE);
    return null;
  }

  const containerWidth = containerRef.current?.clientWidth || 600;

  const deviceData = deviceStats.deviceUsage.map(
    (d: { deviceName: string; minutes: number }) => ({
      name: d.deviceName,
      minutes: d.minutes,
    })
  );

  const browserData = deviceStats.browserUsage.map(
    (d: { browserName: string; minutes: number }) => ({
      name: d.browserName,
      minutes: d.minutes,
    })
  );

  const osData = deviceStats.osUsage.map(
    (d: { osName: string; minutes: number }) => ({
      name: d.osName,
      minutes: d.minutes,
    })
  );

  return (
    <Box
      style={{ backgroundColor: "var(--purple-8)" }}
      className="min-h-screen"
    >
      <Container size="4" p="4" ref={containerRef}>
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Your Viewing Devices
            </Title>
          </div>

          <Grid columns={{ initial: "1", md: "2" }} gap="4">
            <PieChart
              data={deviceData}
              colors={CHART_COLORS.devices}
              title="Devices"
              containerWidth={containerWidth}
            />
            <PieChart
              data={browserData}
              colors={CHART_COLORS.browsers}
              title="Browsers"
              containerWidth={containerWidth}
            />
            <PieChart
              data={osData}
              colors={CHART_COLORS.os}
              title="Operating Systems"
              containerWidth={containerWidth}
            />
          </Grid>
        </Grid>
      </Container>
      <Button
        size={"4"}
        style={{ width: "100%" }}
        onClick={() => {
          void navigate(NEXT_PAGE);
        }}
      >
        Next
      </Button>
    </Box>
  );
}
