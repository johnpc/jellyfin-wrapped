import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Title } from "../ui/styled";
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
            <Title as={motion.h1} variants={itemVariants}>
              What You Watched on Holidays
            </Title>
            <p style={{ fontSize: "1.125rem", color: "var(--gray-11)", marginTop: "0.5rem" }}>
              Your viewing activity during special occasions
            </p>
          </div>

          {christmasItems.length > 0 && (
            <>
              <Title as={motion.h2} variants={itemVariants}>
                Christmas
              </Title>
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
              <Title as={motion.h2} variants={itemVariants}>
                Christmas Eve
              </Title>
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
              <Title as={motion.h2} variants={itemVariants}>
                Halloween
              </Title>
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
              <Title as={motion.h2} variants={itemVariants}>
                Valentine's Day
              </Title>
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
