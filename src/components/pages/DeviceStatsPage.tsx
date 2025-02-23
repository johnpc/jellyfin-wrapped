import { useState, useEffect, useRef } from "react";
import { Container, Grid, Box, Spinner, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useErrorBoundary } from "react-error-boundary";
import { itemVariants, Title } from "../ui/styled";
import * as d3 from "d3";
import { getDeviceStats } from "@/lib/playback-reporting-queries";
import { useNavigate } from "react-router-dom";

interface DeviceStats {
  deviceUsage: { deviceName: string; minutes: number }[];
  browserUsage: { browserName: string; minutes: number }[];
  osUsage: { osName: string; minutes: number }[];
}

const NEXT_PAGE = "/";

const CHART_COLORS = {
  devices: d3.schemeSet3,
  browsers: d3.schemePaired,
  os: d3.schemeTableau10,
};

export default function DeviceStatsPage() {
  const { showBoundary } = useErrorBoundary();
  const [isLoading, setIsLoading] = useState(true);
  const [deviceStats, setDeviceStats] = useState<DeviceStats | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const deviceChartRef = useRef<SVGSVGElement>(null);
  const browserChartRef = useRef<SVGSVGElement>(null);
  const osChartRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();

  // Format time display helper
  const formatTimeDisplay = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${remainingMinutes} minutes`;
    }

    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    }

    return `${hours} ${hours === 1 ? "hour" : "hours"} ${remainingMinutes} ${remainingMinutes === 1 ? "minute" : "minutes"}`;
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getDeviceStats();
        setDeviceStats(data);
      } catch (e) {
        showBoundary(e);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, []);

  // Create pie chart
  const createPieChart = (
    ref: SVGSVGElement,
    data: { name: string; minutes: number }[],
    colors: readonly string[],
    title: string,
  ) => {
    const containerWidth = containerRef.current?.clientWidth || 600;
    const smallChart = containerWidth < 600;
    const width = smallChart
      ? containerWidth - 40
      : (containerWidth - 80) / 2;
    const height = Math.min(400, width);
    const radius = Math.min(width, height) / 2;

    // Clear existing content
    d3.select(ref).selectAll("*").remove();

    const svg = d3
      .select(ref)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3
      .pie<{ name: string; minutes: number }>()
      .value((d) => d.minutes)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<{ name: string; minutes: number }>>()
      .innerRadius(0)
      .outerRadius(radius * 0.8);

    const outerArc = d3
      .arc<d3.PieArcDatum<{ name: string; minutes: number }>>()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    const arcs = svg
      .selectAll("arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    // Add the pie slices
    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (_, i) => colors[i % colors.length])
      .attr("stroke", "white")
      .style("stroke-width", "2px");

    // Add labels
    const labels = arcs
      .append("text")
      .attr("transform", (d) => {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .attr("dy", ".35em")
      .style("text-anchor", (d) => {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midangle < Math.PI ? "start" : "end";
      });

    labels
      .append("tspan")
      .text((d) => d.data.name)
      .style("font-weight", "bold");

    labels
      .append("tspan")
      .attr("x", 0)
      .attr("dy", "1.2em")
      .text((d) => formatTimeDisplay(d.data.minutes));

    // Add polylines
    arcs
      .append("polyline")
      .attr("points", (d) => {
        const pos = outerArc.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1);
        const arcCentroid = arc.centroid(d);
        const outerArcCentroid = outerArc.centroid(d);
        return `${arcCentroid[0]},${arcCentroid[1]} ${outerArcCentroid[0]},${outerArcCentroid[1]} ${pos[0]},${pos[1]}`;
      })
      .style("fill", "none")
      .style("stroke", "gray")
      .style("stroke-width", "1px");

    // Add title
    svg
      .append("text")
      .attr("x", 0)
      .attr("y", -height / 2 + 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(title);
  };

  // Update charts
  useEffect(() => {
    if (!deviceChartRef.current || !browserChartRef.current || !osChartRef.current || !deviceStats) return;

    // Clear existing charts
    d3.select(deviceChartRef.current).selectAll("*").remove();
    d3.select(browserChartRef.current).selectAll("*").remove();
    d3.select(osChartRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 120, bottom: 30, left: 120 };
    const width = Math.min(600, window.innerWidth - margin.left - margin.right);
    const height = 300;

    // Device Chart
    const deviceSvg = d3
      .select(deviceChartRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const deviceX = d3
      .scaleLinear()
      .domain([0, d3.max(deviceStats.deviceUsage, (d) => d.minutes) || 0])
      .range([0, width]);

    const deviceY = d3
      .scaleBand()
      .domain(deviceStats.deviceUsage.map((d) => d.deviceName))
      .range([0, height])
      .padding(0.2);

    deviceSvg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(deviceX).ticks(5))
      .selectAll("text")
      .style("text-anchor", "middle");

    deviceSvg
      .append("g")
      .call(d3.axisLeft(deviceY))
      .selectAll("text")
      .style("text-anchor", "end");

    deviceSvg
      .selectAll("rect")
      .data(deviceStats.deviceUsage)
      .enter()
      .append("rect")
      .attr("y", (d) => deviceY(d.deviceName) || 0)
      .attr("height", deviceY.bandwidth())
      .attr("x", 0)
      .attr("width", (d) => deviceX(d.minutes))
      .attr("fill", "var(--blue-11)");

    // Browser Chart
    const browserSvg = d3
      .select(browserChartRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const browserX = d3
      .scaleLinear()
      .domain([0, d3.max(deviceStats.browserUsage, (d) => d.minutes) || 0])
      .range([0, width]);

    const browserY = d3
      .scaleBand()
      .domain(deviceStats.browserUsage.map((d) => d.browserName))
      .range([0, height])
      .padding(0.2);

    browserSvg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(browserX).ticks(5))
      .selectAll("text")
      .style("text-anchor", "middle");

    browserSvg
      .append("g")
      .call(d3.axisLeft(browserY))
      .selectAll("text")
      .style("text-anchor", "end");

    browserSvg
      .selectAll("rect")
      .data(deviceStats.browserUsage)
      .enter()
      .append("rect")
      .attr("y", (d) => browserY(d.browserName) || 0)
      .attr("height", browserY.bandwidth())
      .attr("x", 0)
      .attr("width", (d) => browserX(d.minutes))
      .attr("fill", "var(--purple-11)");

    // OS Chart
    const osSvg = d3
      .select(osChartRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const osX = d3
      .scaleLinear()
      .domain([0, d3.max(deviceStats.osUsage, (d) => d.minutes) || 0])
      .range([0, width]);

    const osY = d3
      .scaleBand()
      .domain(deviceStats.osUsage.map((d) => d.osName))
      .range([0, height])
      .padding(0.2);

    osSvg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(osX).ticks(5))
      .selectAll("text")
      .style("text-anchor", "middle");

    osSvg
      .append("g")
      .call(d3.axisLeft(osY))
      .selectAll("text")
      .style("text-anchor", "end");

    osSvg
      .selectAll("rect")
      .data(deviceStats.osUsage)
      .enter()
      .append("rect")
      .attr("y", (d) => osY(d.osName) || 0)
      .attr("height", osY.bandwidth())
      .attr("x", 0)
      .attr("width", (d) => osX(d.minutes))
      .attr("fill", "var(--orange-11)");

    // Add titles to each chart
    deviceSvg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Device Usage (minutes)");

    browserSvg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Browser Usage (minutes)");

    osSvg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Operating System Usage (minutes)");
  }, [deviceStats]);

  // Update on resize
  useEffect(() => {
    const handleResize = () => {
      if (!deviceStats) return;

      if (deviceChartRef.current) {
        createPieChart(
          deviceChartRef.current,
          deviceStats.deviceUsage.map((d) => ({
            name: d.deviceName,
            minutes: d.minutes,
          })),
          CHART_COLORS.devices,
          "Device Usage",
        );
      }

      if (browserChartRef.current) {
        createPieChart(
          browserChartRef.current,
          deviceStats.browserUsage.map((d) => ({
            name: d.browserName,
            minutes: d.minutes,
          })),
          CHART_COLORS.browsers,
          "Browser Usage",
        );
      }

      if (osChartRef.current) {
        createPieChart(
          osChartRef.current,
          deviceStats.osUsage.map((d) => ({
            name: d.osName,
            minutes: d.minutes,
          })),
          CHART_COLORS.os,
          "Operating System Usage",
        );
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [deviceStats]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Box
          style={{
            backgroundColor: "var(--green-8)",
            minHeight: "100vh",
            minWidth: "100vw",
          }}
          className="min-h-screen"
        >
          <Spinner size="3" />
        </Box>
      </div>
    );
  }

  return (
    <Box
      style={{
        backgroundColor: "var(--green-8)",
        minHeight: "100vh",
        minWidth: "100vw",
      }}
      className="min-h-screen"
    >
      <Container size="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Your Device Usage
            </Title>
            <motion.p variants={itemVariants}>
              See how you watch across different devices and platforms
            </motion.p>
          </div>

          <div ref={containerRef}>
            <Grid columns="1" gap="6">
              <Box
                style={{
                  backgroundColor: "var(--blue-8)",
                  borderRadius: "8px",
                  padding: "32px 16px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  width: "100%",
                  overflowX: "hidden",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <svg ref={deviceChartRef}></svg>
              </Box>
              <Box
                style={{
                  backgroundColor: "var(--purple-8)",
                  borderRadius: "8px",
                  padding: "32px 16px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  width: "100%",
                  overflowX: "hidden",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <svg ref={browserChartRef}></svg>
              </Box>
              <Box
                style={{
                  backgroundColor: "var(--orange-8)",
                  borderRadius: "8px",
                  padding: "32px 16px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  width: "100%",
                  overflowX: "hidden",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <svg ref={osChartRef}></svg>
              </Box>
            </Grid>
          </div>
        </Grid>
      </Container>
      <Button
        size={"4"}
        style={{ width: "100%", marginTop: "32px", marginBottom: "32px" }}
        onClick={() => {
          void navigate(NEXT_PAGE);
        }}
      >
        Next
      </Button>
    </Box>
  );
}