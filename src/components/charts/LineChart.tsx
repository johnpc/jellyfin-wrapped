import { useEffect, useRef } from "react";
import * as d3 from "d3";

type LineChartData = { x: number; y: number };

export function LineChart({
  data,
  width,
  height,
  xLabel,
  yLabel,
  lineColor,
  areaColor,
}: {
  data: LineChartData[];
  width: number;
  height: number;
  xLabel: string;
  yLabel: string;
  lineColor: string;
  areaColor: string;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !data.length) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d: LineChartData) => d.x) ?? 0])
      .range([0, innerWidth]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d: LineChartData) => d.y) ?? 0])
      .range([innerHeight, 0]);

    const line = d3
      .line<LineChartData>()
      .x((d: LineChartData) => x(d.x))
      .y((d: LineChartData) => y(d.y));

    const area = d3
      .area<LineChartData>()
      .x((d: LineChartData) => x(d.x))
      .y0(innerHeight)
      .y1((d: LineChartData) => y(d.y));

    svg.append("path").datum(data).attr("fill", areaColor).attr("d", area);

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", lineColor)
      .attr("stroke-width", 2)
      .attr("d", line);

    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", innerWidth / 2)
      .attr("y", 35)
      .attr("fill", "currentColor")
      .style("text-anchor", "middle")
      .text(xLabel);

    svg
      .append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -innerHeight / 2)
      .attr("fill", "currentColor")
      .style("text-anchor", "middle")
      .text(yLabel);
  }, [data, width, height, xLabel, yLabel, lineColor, areaColor]);

  return <svg ref={ref} />;
}
