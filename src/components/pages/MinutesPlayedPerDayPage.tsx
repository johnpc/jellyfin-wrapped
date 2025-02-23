import { useState, useEffect, useRef } from "react";
import { Container, Grid, Box, Spinner, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useErrorBoundary } from "react-error-boundary";
import { itemVariants, Title } from "../ui/styled";
import * as d3 from "d3";
import { getMinutesPlayedPerDay } from "@/lib/playback-reporting-queries";
import { useNavigate } from "react-router-dom";

interface PlaybackData {
  date: string;
  minutes: number;
}
const NEXT_PAGE = "/";
export default function MinutesPlayedPerDayPage() {
  const { showBoundary } = useErrorBoundary();
  const [isLoading, setIsLoading] = useState(true);
  const [playbackData, setPlaybackData] = useState<PlaybackData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
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
        const data = await getMinutesPlayedPerDay();
        setPlaybackData(
          data.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          ),
        );
      } catch (e) {
        showBoundary(e);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, []);

  // Create/Update D3 visualization
  const updateChart = () => {
    if (!playbackData.length || !svgRef.current || !containerRef.current)
      return;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Get container width
    const containerWidth = containerRef.current.clientWidth;

    // Set responsive dimensions
    const margin = {
      top: 20,
      right: 20,
      bottom: containerWidth < 600 ? 60 : 40, // More space for labels on mobile
      left: containerWidth < 600 ? 50 : 60,
    };
    const width = containerWidth - margin.left - margin.right;
    const height =
      Math.min(400, containerWidth * 0.6) - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(playbackData, (d) => new Date(d.date)) as [Date, Date])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(playbackData, (d) => d.minutes) || 0])
      .range([height, 0]);

    // Create line generator
    const line = d3
      .line<PlaybackData>()
      .x((d) => xScale(new Date(d.date)))
      .y((d) => yScale(d.minutes))
      .curve(d3.curveMonotoneX);

    // Add area under the line
    const area = d3
      .area<PlaybackData>()
      .x((d) => xScale(new Date(d.date)))
      .y0(height)
      .y1((d) => yScale(d.minutes))
      .curve(d3.curveMonotoneX);

    // Add the area
    svg
      .append("path")
      .datum(playbackData)
      .attr("fill", "var(--yellow-5)")
      .attr("d", area);

    // Add the line
    svg
      .append("path")
      .datum(playbackData)
      .attr("fill", "none")
      .attr("stroke", "var(--yellow-9)")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Configure axes with responsive settings
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(containerWidth < 600 ? 4 : d3.timeMonth.every(1))
      .tickFormat((d) => {
        if (d instanceof Date) {
          return containerWidth < 600
            ? d3.timeFormat("%b")(d) // Short month name on mobile
            : d3.timeFormat("%b %Y")(d);
        }
        return "";
      });

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d: d3.NumberValue) => `${d.valueOf()}m`);

    // Add x-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", containerWidth < 600 ? "rotate(-45)" : "rotate(-45)");

    // Add y-axis
    svg.append("g").call(yAxis);

    // Add hover effects
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
      .style("display", "none")
      .style("z-index", "1000")
      .style("pointer-events", "none")
      .style("font-size", containerWidth < 600 ? "12px" : "14px");

    const dots = svg
      .selectAll(".dot")
      .data(playbackData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(new Date(d.date)))
      .attr("cy", (d) => yScale(d.minutes))
      .attr("r", containerWidth < 600 ? 3 : 4)
      .attr("fill", "var(--yellow-9)")
      .style("opacity", 0);

    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mousemove", function (event: PointerEvent) {
        const [xPos] = d3.pointer(event, this);
        const xDate = xScale.invert(xPos);
        const bisectLeft = d3.bisector<PlaybackData, Date>(
          (d) => new Date(d.date),
        ).left;
        const index = bisectLeft(playbackData, xDate);
        const d = playbackData[index];

        if (d) {
          dots.style("opacity", 0);
          d3.select(dots.nodes()[index]).style("opacity", 1);

          tooltip
            .style("display", "block")
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 10}px`)
            .html(`Date: ${d.date}<br>${formatTimeDisplay(d.minutes)}`);
        }
      })
      .on("mouseout", () => {
        dots.style("opacity", 0);
        tooltip.style("display", "none");
      });

    return () => {
      tooltip.remove();
    };
  };

  // Update chart on window resize
  useEffect(() => {
    const handleResize = () => {
      updateChart();
    };

    window.addEventListener("resize", handleResize);
    updateChart();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [playbackData]);

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

  const totalMinutes = playbackData.reduce((sum, day) => sum + day.minutes, 0);
  const averageMinutes = Math.round(totalMinutes / playbackData.length);

  return (
    <Box
      style={{
        backgroundColor: "var(--green-8)",
        minHeight: "100vh",
        minWidth: "100vw",
      }}
      className="min-h-screen"
    >
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <Title as={motion.h1} variants={itemVariants}>
              Your Watching Activity
            </Title>
            <motion.p variants={itemVariants}>
              Average: {formatTimeDisplay(averageMinutes)} per day
            </motion.p>
          </div>

          <div
            ref={containerRef}
            style={{
              backgroundColor: "var(--red-8)",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              width: "100%",
              overflowX: "hidden",
            }}
          >
            <svg ref={svgRef}></svg>
          </div>
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
