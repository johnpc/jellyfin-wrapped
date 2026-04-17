import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Grid } from "@radix-ui/themes";
import { motion } from "motion/react";
import { itemVariants } from "@/lib/styled-variants";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { generateGuid } from "@/lib/utils";
import PageContainer from "../PageContainer";
import { useData } from "@/contexts/DataContext";
import { LoadingSpinner } from "../LoadingSpinner";
import { getNextPage, getAvailablePages } from "@/lib/navigation";

export default function HolidayReviewPage() {
  const navigate = useNavigate();
  const { holidays, isLoading } = useData();

  const christmasItems = holidays.christmas.data ?? [];
  const christmasEveItems = holidays.christmasEve.data ?? [];
  const halloweenItems = holidays.halloween.data ?? [];
  const valentinesItems = holidays.valentines.data ?? [];

  // Redirect if no holiday content after data is loaded
  useEffect(() => {
    if (!isLoading && !holidays.hasContent) {
      const nextPage = getNextPage("/holidays");
      const availablePages = getAvailablePages();
      const destination = nextPage || availablePages[0] || "/TopTen";
      navigate(destination, { replace: true });
    }
  }, [isLoading, holidays.hasContent, navigate]);

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don't render while redirecting
  if (!holidays.hasContent) {
    return <LoadingSpinner />;
  }

  return (
    <PageContainer>
      <Container size="4" p="4">
        <Grid gap="6">
          <div style={{ textAlign: "center" }}>
            <motion.h1 variants={itemVariants} style={{
              fontSize: "clamp(2.75rem, 8vw, 5.5rem)",
              fontWeight: 800,
              marginBottom: "1.75rem",
              lineHeight: 0.95,
              letterSpacing: "-0.05em",
              background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 35%, #a855f7 55%, #f59e0b 80%, #f43f5e 100%)",
              backgroundSize: "250% 250%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradient-flow 8s ease infinite",
              filter: "drop-shadow(0 0 50px rgba(0, 240, 255, 0.25))",
            }}>
              What You Watched on Holidays
            </motion.h1>
            <p style={{ fontSize: "1.125rem", color: "var(--gray-11)", marginTop: "0.5rem" }}>
              Your viewing activity during special occasions
            </p>
          </div>

          {christmasItems.length > 0 && (
            <>
              <motion.h2 variants={itemVariants} style={{
                fontSize: "clamp(1.75rem, 5vw, 3rem)",
                fontWeight: 700,
                marginBottom: "1rem",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 35%, #a855f7 55%, #f59e0b 80%, #f43f5e 100%)",
                backgroundSize: "250% 250%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradient-flow 8s ease infinite",
              }}>
                Christmas
              </motion.h2>
              <Grid
                columns={{ initial: "2", sm: "3", md: "4", lg: "5" }}
                gap="4"
              >
                {christmasItems.map((item: { id?: string }) => (
                  <MovieCard key={generateGuid()} item={item} />
                ))}
              </Grid>
            </>
          )}

          {christmasEveItems.length > 0 && (
            <>
              <motion.h2 variants={itemVariants} style={{
                fontSize: "clamp(1.75rem, 5vw, 3rem)",
                fontWeight: 700,
                marginBottom: "1rem",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 35%, #a855f7 55%, #f59e0b 80%, #f43f5e 100%)",
                backgroundSize: "250% 250%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradient-flow 8s ease infinite",
              }}>
                Christmas Eve
              </motion.h2>
              <Grid
                columns={{ initial: "2", sm: "3", md: "4", lg: "5" }}
                gap="4"
              >
                {christmasEveItems.map((item: { id?: string }) => (
                  <MovieCard key={generateGuid()} item={item} />
                ))}
              </Grid>
            </>
          )}

          {halloweenItems.length > 0 && (
            <>
              <motion.h2 variants={itemVariants} style={{
                fontSize: "clamp(1.75rem, 5vw, 3rem)",
                fontWeight: 700,
                marginBottom: "1rem",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 35%, #a855f7 55%, #f59e0b 80%, #f43f5e 100%)",
                backgroundSize: "250% 250%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradient-flow 8s ease infinite",
              }}>
                Halloween
              </motion.h2>
              <Grid
                columns={{ initial: "2", sm: "3", md: "4", lg: "5" }}
                gap="4"
              >
                {halloweenItems.map((item: { id?: string }) => (
                  <MovieCard key={generateGuid()} item={item} />
                ))}
              </Grid>
            </>
          )}

          {valentinesItems.length > 0 && (
            <>
              <motion.h2 variants={itemVariants} style={{
                fontSize: "clamp(1.75rem, 5vw, 3rem)",
                fontWeight: 700,
                marginBottom: "1rem",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                background: "linear-gradient(135deg, #f8fafc 0%, #00f0ff 35%, #a855f7 55%, #f59e0b 80%, #f43f5e 100%)",
                backgroundSize: "250% 250%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradient-flow 8s ease infinite",
              }}>
                Valentine's Day
              </motion.h2>
              <Grid
                columns={{ initial: "2", sm: "3", md: "4", lg: "5" }}
                gap="4"
              >
                {valentinesItems.map((item: { id?: string }) => (
                  <MovieCard key={generateGuid()} item={item} />
                ))}
              </Grid>
            </>
          )}
        </Grid>
      </Container>
    </PageContainer>
  );
}
