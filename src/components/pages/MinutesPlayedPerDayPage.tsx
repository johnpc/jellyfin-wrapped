import { useState, useEffect, useRef } from "react";
import { Container, Grid, Box, Spinner, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useErrorBoundary } from "react-error-boundary";
import { itemVariants, Title } from "../ui/styled";
import * as d3 from "d3";
import {
  getMinutesPlayedPerDay,
  getViewingPatterns,
} from "@/lib/playback-reporting-queries";
import { useNavigate } from "react-router-dom";

interface PlaybackData {
  date: string;
  minutes: number;
}

interface ViewingPatterns {
  timeOfDay: { hour: number; minutes: number }[];
  dayOfWeek: { day: number; minutes: number }[];
  primeTime: { isPrimeTime: boolean; minutes: number }[];
}

const NEXT_PAGE = "/device-stats";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CHART_COLORS = {
  timeOfDay: {
    line: "var(--blue-9)",
    area: "var(--blue-5)",
  },
  dayOfWeek: {
    bar: "var(--green-9)",
  },
  activity: {
    line: "var(--yellow-9)",
    area: "var(--yellow-5)",
  },
};

export default function MinutesPlayedPerDayPage() {
  const { showBoundary } = useErrorBoundary();
  const [isLoading, setIsLoading] = useState(true);
  const [playbackData, setPlaybackData] = useState<PlaybackData[]>([]);
  const [viewingPatterns, setViewingPatterns] =
    useState<ViewingPatterns | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeOfDayRef = useRef<SVGSVGElement>(null);
  const dayOfWeekRef = useRef<SVGSVGElement>(null);
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
        const [data, patterns] = await Promise.all([
          getMinutesPlayedPerDay(),
          getViewingPatterns(),
        ]);
        setPlaybackData(
          data.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          ),
        );
        setViewingPatterns(patterns);
      } catch (e) {
        showBoundary(e);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchData();
  }, []);

  // Create/Update D3 visualizations
  const updateCharts = () => {
    if (!playbackData.length || !viewingPatterns || !containerRef.current)
      return;

    // Get container width
    const containerWidth = containerRef.current.clientWidth;
    const smallChart = containerWidth < 600;

    // Common chart dimensions
    const margin = {
      top: 40, // Increased top margin for title
      right: 20,
      bottom: smallChart ? 60 : 40,
      left: smallChart ? 50 : 60,
    };

    // Full width for each chart on mobile
    const width = smallChart
      ? containerWidth - margin.left - margin.right
      : (containerWidth - margin.left - margin.right) / 2;
    const height =
      Math.min(300, containerWidth * 0.4) - margin.top - margin.bottom;

    // Update time of day chart
    if (timeOfDayRef.current) {
      d3.select(timeOfDayRef.current).selectAll("*").remove();
      const svg = d3
        .select(timeOfDayRef.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const xScale = d3.scaleLinear().domain([0, 23]).range([0, width]);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(viewingPatterns.timeOfDay, (d) => d.minutes) || 0])
        .range([height, 0]);

      // Create line
      const line = d3
        .line<{ hour: number; minutes: number }>()
        .x((d) => xScale(d.hour))
        .y((d) => yScale(d.minutes))
        .curve(d3.curveBasis);

      // Add the line
      svg
        .append("path")
        .datum(viewingPatterns.timeOfDay)
        .attr("fill", "none")
        .attr("stroke", CHART_COLORS.timeOfDay.line)
        .attr("stroke-width", 2)
        .attr("d", line);

      // Add axes
      const xAxis = d3
        .axisBottom(xScale)
        .ticks(12)
        .tickFormat((d) => `${d}:00`);

      const yAxis = d3
        .axisLeft(yScale)
        .ticks(5)
        .tickFormat((d) => `${d}m`);

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

      // Add title with more space
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Time of Day Viewing Pattern");
    }

    // Update day of week chart
    if (dayOfWeekRef.current) {
      d3.select(dayOfWeekRef.current).selectAll("*").remove();
      const svg = d3
        .select(dayOfWeekRef.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const xScale = d3
        .scaleBand()
        .domain(dayNames)
        .range([0, width])
        .padding(0.1);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(viewingPatterns.dayOfWeek, (d) => d.minutes) || 0])
        .range([height, 0]);

      // Add bars
      svg
        .selectAll("rect")
        .data(viewingPatterns.dayOfWeek)
        .enter()
        .append("rect")
        .attr("x", (d) => xScale(dayNames[d.day]) || 0)
        .attr("y", (d) => yScale(d.minutes))
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => height - yScale(d.minutes))
        .attr("fill", CHART_COLORS.dayOfWeek.bar);

      // Add axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3
        .axisLeft(yScale)
        .ticks(5)
        .tickFormat((d) => `${d}m`);

      svg.append("g").attr("transform", `translate(0,${height})`).call(xAxis);

      svg.append("g").call(yAxis);

      // Add title with more space
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Day of Week Viewing Pattern");
    }

    // Update original chart
    updateOriginalChart();
  };

  // Keep the original chart update logic in a separate function
  const updateOriginalChart = () => {
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
      .attr("fill", CHART_COLORS.activity.area)
      .attr("d", area);

    // Add the line
    svg
      .append("path")
      .datum(playbackData)
      .attr("fill", "none")
      .attr("stroke", CHART_COLORS.activity.line)
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

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Daily Viewing Activity");

    return () => {
      tooltip.remove();
    };
  };

  // Update charts on window resize
  useEffect(() => {
    const handleResize = () => {
      updateCharts();
    };

    window.addEventListener("resize", handleResize);
    updateCharts();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [playbackData, viewingPatterns]);

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

  const primeTimePercentage = viewingPatterns
    ? Math.round(
        ((viewingPatterns.primeTime.find((p) => p.isPrimeTime)?.minutes || 0) /
          viewingPatterns.primeTime.reduce((sum, p) => sum + p.minutes, 0)) *
          100,
      )
    : 0;

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
              Your Watching Activity
            </Title>
            <motion.p variants={itemVariants}>
              Average: {formatTimeDisplay(averageMinutes)} per day
            </motion.p>
            {viewingPatterns && (
              <motion.p variants={itemVariants}>
                {primeTimePercentage}% of your viewing happens during prime time
                (7 PM - 11 PM)
              </motion.p>
            )}
          </div>

          <div ref={containerRef}>
            <Grid columns={{ initial: "1", sm: "2" }} gap="4">
              <Box
                style={{
                  backgroundColor: "var(--red-8)",
                  borderRadius: "8px",
                  padding: "16px 0",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  width: "100%",
                  overflowX: "hidden",
                }}
              >
                <svg ref={timeOfDayRef}></svg>
              </Box>
              <Box
                style={{
                  backgroundColor: "var(--red-8)",
                  borderRadius: "8px",
                  padding: "16px 0",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  width: "100%",
                  overflowX: "hidden",
                }}
              >
                <svg ref={dayOfWeekRef}></svg>
              </Box>
            </Grid>
            <Box
              style={{
                backgroundColor: "var(--red-8)",
                borderRadius: "8px",
                padding: "16px 0",
                marginTop: "16px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                width: "100%",
                overflowX: "hidden",
              }}
            >
              <svg ref={svgRef}></svg>
            </Box>
          </div>
        </Grid>
      </Container>
      <Button
        size={"4"}
        style={{ width: "100%", marginTop: "16px" }}
        onClick={() => {
          void navigate(NEXT_PAGE);
        }}
      >
        Next
      </Button>
    </Box>
  );
}
