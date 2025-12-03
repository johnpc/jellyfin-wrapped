import { useEffect, useRef } from "react";
import * as d3 from "d3";

type PieChartData = { name: string; minutes: number };

export function PieChart({
  data,
  colors,
  title,
  containerWidth,
}: {
  data: PieChartData[];
  colors: readonly string[];
  title: string;
  containerWidth: number;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !data.length) return;

    const smallChart = containerWidth < 600;
    const width = smallChart ? containerWidth - 40 : (containerWidth - 80) / 2;
    const height = Math.min(400, width);
    const radius = Math.min(width, height) / 2;

    d3.select(ref.current).selectAll("*").remove();

    const svg = d3
      .select(ref.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3
      .pie<PieChartData>()
      .value((d: PieChartData) => d.minutes)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<PieChartData>>()
      .innerRadius(0)
      .outerRadius(radius * 0.8);

    const color = d3.scaleOrdinal<string>().range(colors);

    svg
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (_d: d3.PieArcDatum<PieChartData>, i: number) =>
        color(String(i))
      )
      .attr("stroke", "white")
      .style("stroke-width", "2px");

    const legend = svg
      .selectAll(".legend")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        (_d: PieChartData, i: number) =>
          `translate(0,${i * 20 - (data.length * 20) / 2})`
      );

    legend
      .append("rect")
      .attr("x", radius + 10)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", (_d: PieChartData, i: number) => color(String(i)));

    legend
      .append("text")
      .attr("x", radius + 35)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .style("font-size", "12px")
      .text((d: PieChartData) => `${d.name} (${Math.round(d.minutes / 60)}h)`);
  }, [data, colors, containerWidth]);

  return (
    <div>
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>{title}</h3>
      <svg ref={ref} />
    </div>
  );
}
