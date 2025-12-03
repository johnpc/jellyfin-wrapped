import { ResponsiveCalendar } from "@nivo/calendar";
import { Card } from "@/components/ui/card";
import { Button, Box } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { subYears, format } from "date-fns";
import { Title } from "../ui/styled";
import { motion } from "framer-motion";
import { useCalendar } from "@/hooks/queries/useCalendar";
import { LoadingSpinner } from "../LoadingSpinner";
import { useIsMobile } from "@/hooks/useIsMobile";

const NEXT_PAGE = "/";

export default function ActivityCalendarPage() {
  const navigate = useNavigate();
  const { showBoundary } = useErrorBoundary();
  const isMobile = useIsMobile();
  const { data, isLoading, error } = useCalendar();

  if (error) {
    showBoundary(error);
  }

  if (isLoading) {
    return <LoadingSpinner backgroundColor="var(--gray-8)" />;
  }

  const fromDate = format(subYears(new Date(), 1), "yyyy-MM-dd");
  const toDate = format(new Date(), "yyyy-MM-dd");

  return (
    <Box
      style={{ backgroundColor: "var(--gray-8)" }}
      className="min-h-screen p-8"
    >
      <Card className="p-6">
        <Title as={motion.h2} className="text-2xl font-bold mb-4">
          Your Viewing Activity
        </Title>
        <div style={{ height: isMobile ? "300px" : "500px" }}>
          <ResponsiveCalendar
            data={data ?? []}
            from={fromDate}
            to={toDate}
            emptyColor="#eeeeee"
            colors={["#61cdbb", "#97e3d5", "#e8c1a0", "#f47560"]}
            margin={
              isMobile
                ? { top: 20, right: 20, bottom: 20, left: 20 }
                : { top: 40, right: 40, bottom: 40, left: 40 }
            }
            yearSpacing={40}
            monthBorderColor="#ffffff"
            dayBorderWidth={2}
            dayBorderColor="#ffffff"
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
