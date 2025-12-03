import { ResponsiveCalendar } from "@nivo/calendar";
import { Card } from "@/components/ui/card";
import { Container } from "@radix-ui/themes";
import { useErrorBoundary } from "react-error-boundary";
import { subYears, format } from "date-fns";
import { Title } from "../ui/styled";
import { motion } from "framer-motion";
import { useCalendar } from "@/hooks/queries/useCalendar";
import { LoadingSpinner } from "../LoadingSpinner";
import { useIsMobile } from "@/hooks/useIsMobile";
import PageContainer from "../PageContainer";

const NEXT_PAGE = "/";

export default function ActivityCalendarPage() {
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
    <PageContainer backgroundColor="var(--indigo-8)" nextPage={NEXT_PAGE} previousPage="/device-stats">
      <Container size="4" p="4">
        <Card className="p-6">
          <Title as={motion.h2} className="text-2xl font-bold mb-4">
            Your Viewing Activity
          </Title>
          <p style={{ fontSize: "1.125rem", color: "var(--gray-11)", marginBottom: "1rem" }}>
            A calendar view of your daily viewing patterns
          </p>
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
      </Container>
    </PageContainer>
  );
}
