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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [playbackData, setPlaybackData] = useState<PlaybackData[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
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
        // Sort data chronologically for the graph
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
  useEffect(() => {
    if (!playbackData.length || !svgRef.current) return;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

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

    // Add axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(d3.timeMonth.every(1))
      .tickFormat((d) => {
        if (d instanceof Date) {
          return d3.timeFormat("%b %Y")(d);
        }
        return "";
      });

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickFormat((d: d3.NumberValue) => `${d.valueOf()}m`);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

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
      .style("display", "none");

    const dots = svg
      .selectAll(".dot")
      .data(playbackData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(new Date(d.date)))
      .attr("cy", (d) => yScale(d.minutes))
      .attr("r", 4)
      .attr("fill", "var(--yellow-9)")
      .style("opacity", 0);

    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mousemove", function (event: PointerEvent) {
        const [xPos] = d3.pointer(event);
        const xDate = xScale.invert(xPos);
        const bisectByDate = d3.bisector<PlaybackData, Date>(
          (d) => new Date(d.date),
        );
        const bisectLeft = (data: PlaybackData[], date: Date) =>
          bisectByDate.left(data, date);
        const index = bisectLeft(playbackData, xDate);

        const d = playbackData[index];

        if (d) {
          dots.style("opacity", 0);
          d3.select(dots.nodes()[index]).style("opacity", 1);

          tooltip
            .style("display", "block")
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 10}px`)
            .html(
              `Date: ${d.date}<br>Time: ${formatTimeDisplay(d.minutes)}`,
            );
        }
      })
      .on("mouseout", () => {
        dots.style("opacity", 0);
        tooltip.style("display", "none");
      });

    // Cleanup function
    return () => {
      tooltip.remove();
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
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
