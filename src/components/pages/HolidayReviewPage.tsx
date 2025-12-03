import { useState, useMemo } from "react";
import { Container, Grid } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { Title } from "../ui/styled";
import { itemVariants } from "@/lib/styled-variants";
import { useNavigate } from "react-router-dom";
import { useErrorBoundary } from "react-error-boundary";
import { useWatchedOnDate } from "@/hooks/queries/useWatchedOnDate";
import { LoadingSpinner } from "../LoadingSpinner";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { generateGuid } from "@/lib/utils";
import { getCachedHiddenIds, setCachedHiddenId } from "@/lib/cache";
import { getHolidayDates } from "@/lib/holiday-helpers";
import { subDays } from "date-fns";
import PageContainer from "../PageContainer";

const NEXT_PAGE = "/minutes-per-day";

export default function HolidayReviewPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const [hiddenIds, setHiddenIds] = useState<string[]>(getCachedHiddenIds());

  const dates = useMemo(() => {
    const today = new Date();
    const holidays = getHolidayDates(today);
    return {
      christmas: holidays.christmas,
      christmasEve: subDays(holidays.christmas, 1),
      halloween: holidays.halloween,
      valentines: holidays.valentines,
    };
  }, []);

  const {
    data: christmas,
    isLoading: l1,
    error: e1,
  } = useWatchedOnDate(dates.christmas);
  const {
    data: christmasEve,
    isLoading: l2,
    error: e2,
  } = useWatchedOnDate(dates.christmasEve);
  const {
    data: halloween,
    isLoading: l3,
    error: e3,
  } = useWatchedOnDate(dates.halloween);
  const {
    data: valentines,
    isLoading: l4,
    error: e4,
  } = useWatchedOnDate(dates.valentines);

  const firstError = e1 || e2 || e3 || e4;
  if (firstError) {
    showBoundary(firstError);
  }

  if (l1 || l2 || l3 || l4) {
    return <LoadingSpinner />;
  }

  const filterHidden = (items: { id?: string }[] | undefined) =>
    items?.filter(
      (item: { id?: string }) => !hiddenIds.includes(item.id ?? "")
    ) ?? [];

  const christmasItems = filterHidden(christmas);
  const christmasEveItems = filterHidden(christmasEve);
  const halloweenItems = filterHidden(halloween);
  const valentinesItems = filterHidden(valentines);

  if (
    !christmasItems.length &&
    !christmasEveItems.length &&
    !halloweenItems.length &&
    !valentinesItems.length
  ) {
    void navigate(NEXT_PAGE);
    return null;
  }

  return (
    <PageContainer backgroundColor="var(--grass-8)" nextPage={NEXT_PAGE} previousPage="/oldest-show">
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
                  <MovieCard
                    key={generateGuid()}
                    item={item}
                    onHide={() => {
                      setCachedHiddenId(item.id ?? "");
                      setHiddenIds([...hiddenIds, item.id ?? ""]);
                    }}
                  />
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
                  <MovieCard
                    key={generateGuid()}
                    item={item}
                    onHide={() => {
                      setCachedHiddenId(item.id ?? "");
                      setHiddenIds([...hiddenIds, item.id ?? ""]);
                    }}
                  />
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
                  <MovieCard
                    key={generateGuid()}
                    item={item}
                    onHide={() => {
                      setCachedHiddenId(item.id ?? "");
                      setHiddenIds([...hiddenIds, item.id ?? ""]);
                    }}
                  />
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
                  <MovieCard
                    key={generateGuid()}
                    item={item}
                    onHide={() => {
                      setCachedHiddenId(item.id ?? "");
                      setHiddenIds([...hiddenIds, item.id ?? ""]);
                    }}
                  />
                ))}
              </Grid>
            </>
          )}
        </Grid>
      </Container>
    </PageContainer>
  );
}
