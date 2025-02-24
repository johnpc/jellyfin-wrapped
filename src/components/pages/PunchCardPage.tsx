import { useQuery } from '@tanstack/react-query';
import { getPunchCardData, type PunchCardData } from '@/lib/playback-reporting-queries';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import { Card } from '@/components/ui/card';
import { Button, Box, Spinner } from '@radix-ui/themes';
import { useNavigate } from 'react-router-dom';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const NEXT_PAGE = "/";

// Create a full dataset with all hour/day combinations
const createFullDataset = (data: PunchCardData[]) => {
  const dataset = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const existingPoint = data.find(p => p.dayOfWeek === day && p.hour === hour);
      dataset.push({
        x: hour,
        y: day,
        size: existingPoint?.count || 1 // Use 1 as minimum size
      });
    }
  }
  return dataset;
};

export default function PunchCardPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ['punch-card'],
    queryFn: getPunchCardData
  });

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <Box style={{
          backgroundColor: 'var(--gray-8)',
          minHeight: '100vh',
          minWidth: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Spinner size="3" />
        </Box>
      </div>
    );
  }

  if (error) {
    console.error('Error loading punch card data:', error);
    return <div>Error loading viewing patterns</div>;
  }

  if (!data?.length) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">No viewing data available</h1>
        <Button
          size={"4"}
          style={{ width: "100%" }}
          onClick={() => {
            void navigate(NEXT_PAGE);
          }}
        >
          Next
        </Button>
      </div>
    );
  }

  const chartData = [{
    id: 'Activity',
    data: createFullDataset(data)
  }];

  return (
    <Box style={{ backgroundColor: 'var(--gray-2)' }} className="min-h-screen p-4">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Viewing Patterns</h1>
        <Card className="p-4 mb-4">
          <div style={{ height: '600px', width: '100%' }}>
            <ResponsiveScatterPlot
              data={chartData}
              margin={{ top: 40, right: 40, bottom: 40, left: 60 }}
              xScale={{ type: 'linear', min: 0, max: 23 }}
              yScale={{ type: 'linear', min: 0, max: 6 }}
              axisBottom={{
                tickValues: [...Array(24)].map((_, i) => i),
                format: v => `${v}:00`
              }}
              axisLeft={{
                tickValues: [...Array(7)].map((_, i) => i),
                format: v => DAYS[v]
              }}
              nodeSize={8}
              colors="#38bdf8"
              blendMode="multiply"
              tooltip={({ node }) => (
                <div className="bg-white dark:bg-gray-800 p-2 shadow rounded">
                  <strong>{DAYS[node.data.y]}</strong> at {node.data.x}:00
                  <br />
                  {node.data.size} views
                </div>
              )}
            />
          </div>
        </Card>
        <Button
          size={"4"}
          style={{ width: "100%" }}
          onClick={() => {
            void navigate(NEXT_PAGE);
          }}
        >
          Next
        </Button>
      </div>
    </Box>
  );
}