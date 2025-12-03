import { useEffect, useRef } from "react";
import * as d3 from "d3";

type BarChartData = { label: string; value: number };

export function BarChart({
  data,
  width,
  height,
  xLabel,
  yLabel,
  barColor,
}: {
  data: BarChartData[];
  width: number;
  height: number;
  xLabel: string;
  yLabel: string;
  barColor: string;
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
      .scaleBand()
      .domain(data.map((d: BarChartData) => d.label))
      .range([0, innerWidth])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d: BarChartData) => d.value) ?? 0])
      .range([innerHeight, 0]);

    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d: BarChartData) => x(d.label) ?? 0)
      .attr("y", (d: BarChartData) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d: BarChartData) => innerHeight - y(d.value))
      .attr("fill", barColor);

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
  }, [data, width, height, xLabel, yLabel, barColor]);

  return <svg ref={ref} />;
}
