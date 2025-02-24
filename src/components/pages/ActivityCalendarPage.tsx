import { useQuery } from "@tanstack/react-query";
import {
  getCalendarData,
} from "@/lib/playback-reporting-queries";
import { ResponsiveCalendar } from "@nivo/calendar";
import { Card } from "@/components/ui/card";
import { Button, Box, Spinner } from "@radix-ui/themes";
import { useNavigate } from "react-router-dom";
import { subYears, format } from "date-fns";
import { Title } from "../ui/styled";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const NEXT_PAGE = "/";

// You can adjust this breakpoint based on your needs
const MOBILE_BREAKPOINT = "768px";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window is available (for SSR compatibility)
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT})`);

    // Set initial value
    setIsMobile(mediaQuery.matches);

    // Create event listener function
    const handleResize = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Add event listener
    mediaQuery.addEventListener("change", handleResize);

    // Cleanup
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  return isMobile;
}

export default function ActivityCalendarPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data, isLoading, error } = useQuery({
    queryKey: ["calendar-data"],
    queryFn: getCalendarData,
  });

  const from = format(subYears(new Date(), 1), "yyyy-MM-dd");
  const to = format(new Date(), "yyyy-MM-dd");

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
            backgroundColor: "var(--gray-8)",
            minHeight: "100vh",
            minWidth: "100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spinner size="3" />
        </Box>
      </div>
    );
  }

  if (error) {
    console.error("Error loading calendar data:", error);
    return <div>Error loading viewing patterns</div>;
  }

  if (!data?.length) {
    return (
      <Box
        style={{ backgroundColor: "var(--purple-8)" }}
        className="min-h-screen"
      >
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
      </Box>
    );
  }

  return (
    <Box
      style={{
        backgroundColor: "var(--purple-12)",
        minWidth: "100vw",
        minHeight: "100vh",
      }}
      className="min-h-screen p-4"
    >
      <div className="container mx-auto">
        <Title as={motion.h1} style={{ textAlign: "center" }}>
          Your Calendar Heatmap
        </Title>
        <Card className="p-4 mb-4">
          <div
            style={{
              height: isMobile
                ? "calc(min(800px, 90vh))"
                : "calc(min(600px, 80vh))",
              minHeight: isMobile ? "600px" : "400px",
              width: "100%",
            }}
          >
            <ResponsiveCalendar
              data={data}
              from={from}
              to={to}
              emptyColor="#eeeeee"
              direction={isMobile ? "vertical" : undefined}
              colors={["#a1e4c4", "#70c4a4", "#4da584", "#2a8564", "#076544"]}
              margin={{
                top: 50,
                right: 20,
                bottom: 50,
                left: 60, //20
              }}
              yearSpacing={40}
              monthBorderColor="#ffffff"
              dayBorderWidth={2}
              dayBorderColor="#ffffff"
              monthLegend={(year, month) => {
                const date = new Date(year, month, 1);
                return format(date, "MMM");
              }}
              tooltip={({ day, value }) => (
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.9)",
                    color: "white",
                    padding: "12px 16px",
                    borderRadius: "4px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                    fontSize: "14px",
                    lineHeight: "1.4",
                  }}
                >
                  <strong
                    style={{
                      fontSize: "16px",
                      display: "block",
                      marginBottom: "4px",
                    }}
                  >
                    {format(new Date(day), "MMMM d, yyyy")}
                  </strong>
                  {value} {value === "1" ? "item" : "items"} watched
                </div>
              )}
              theme={{
                text: {
                  fontSize: 14,
                  fill: "#ffffff",
                  fontWeight: 600,
                },
                legends: {
                  text: {
                    fontSize: 16,
                    fill: "#ffffff",
                    fontWeight: 500,
                  },
                },
                tooltip: {
                  container: {
                    background: "#000000",
                    color: "#ffffff",
                    fontSize: "14px",
                  },
                },
              }}
              legends={[
                {
                  anchor: "bottom",
                  direction: "row",
                  translateY: 50,
                  itemCount: 5,
                  itemWidth: 60,
                  itemHeight: 36,
                  itemsSpacing: 20,
                  itemDirection: "right-to-left",
                  itemTextColor: "#ffffff",
                  symbolSize: 20,
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemTextColor: "#a1e4c4",
                      },
                    },
                  ],
                },
              ]}
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
