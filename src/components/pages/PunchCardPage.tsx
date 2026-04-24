import { ResponsiveScatterPlot } from "@nivo/scatterplot";
import { Card } from "@/components/ui/card";
import { Button, Box } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { usePunchCard } from "@/hooks/queries/usePunchCard";
import { LoadingSpinner } from "../LoadingSpinner";
import { PunchCardData } from "@/lib/queries";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const NEXT_PAGE = "/";

const createFullDataset = (
  data: PunchCardData[]
): { x: number; y: number; size: number }[] => {
  const dataset: { x: number; y: number; size: number }[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const existingPoint = data.find(
        (p: PunchCardData) => p.dayOfWeek === day && p.hour === hour
      );
      dataset.push({
        x: hour,
        y: day,
        size: existingPoint?.count || 1,
      });
    }
  }
  return dataset;
};

export default function PunchCardPage() {
  const navigate = useNavigate();
  const { showBoundary } = useErrorBoundary();
  const { data, isLoading, error } = usePunchCard();

  if (error) {
    showBoundary(error);
  }

  if (isLoading) {
    return <LoadingSpinner backgroundColor="var(--gray-8)" />;
  }

  const chartData = [
    {
      id: "viewing",
      data: createFullDataset(data ?? []),
    },
  ];

  return (
    <Box
      style={{ backgroundColor: "var(--gray-8)" }}
      className="min-h-screen p-8"
    >
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Your Viewing Patterns</h2>
        <div style={{ height: "500px" }}>
          <ResponsiveScatterPlot
            data={chartData}
            margin={{ top: 60, right: 140, bottom: 70, left: 90 }}
            xScale={{ type: "linear", min: 0, max: 23 }}
            yScale={{ type: "linear", min: 0, max: 6 }}
            nodeSize={{ key: "size", values: [0, 100], sizes: [4, 32] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Hour of Day",
              legendPosition: "middle",
              legendOffset: 46,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Day of Week",
              legendPosition: "middle",
              legendOffset: -60,
              format: (value: number) => DAYS[value],
            }}
          />
        </div>
      </Card>
      <Button
        size={"4"}
        style={{ width: "100%", marginTop: "1rem" }}
        onClick={() => {
          void navigate(NEXT_PAGE);
        }}
      >
        Finish
      </Button>
    </Box>
  );
}
