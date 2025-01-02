import { useState, useEffect } from "react";
import {
  listWatchedOnDate,
  SimpleItemDto,
} from "@/lib/playback-reporting-queries";
import { MovieCard } from "./MoviesReviewPage/MovieCard";
import { Container, Grid, Box, Spinner, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { itemVariants, Title } from "../ui/styled";
import { useNavigate } from "react-router-dom";
import { generateGuid } from "@/lib/utils";
import { useErrorBoundary } from "react-error-boundary";
import { getCachedHiddenIds, setCachedHiddenId } from "@/lib/cache";
import {
  getChristmas,
  getHalloween,
  getValentinesDay,
} from "date-fns-holiday-us";
import { isAfter, isSameDay, subDays } from "date-fns";
export default function HolidayReviewPage() {
  const { showBoundary } = useErrorBoundary();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [christmasItems, setChristmasItems] = useState<SimpleItemDto[]>([]);
  const [christmasEveItems, setChristmasEveItems] = useState<SimpleItemDto[]>(
    [],
  );
  const [halloweenItems, setHalloweenItems] = useState<SimpleItemDto[]>([]);
  const [valentinesItems, setValentinesItems] = useState<SimpleItemDto[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>(getCachedHiddenIds());
  const today = new Date();
  const christmasThisYear = getChristmas(today.getFullYear());
  const christmasYearToLookUp: number =
    isAfter(today, christmasThisYear) && !isSameDay(today, christmasThisYear)
      ? today.getFullYear()
      : today.getFullYear() - 1;

  const christmasEveThisYear = getChristmas(today.getFullYear());
  const christmasEveYearToLookUp: number =
    isAfter(today, christmasEveThisYear) &&
    !isSameDay(today, christmasEveThisYear)
      ? today.getFullYear()
      : today.getFullYear() - 1;

  const halloweenThisYear = getHalloween(today.getFullYear());
  const halloweenYearToLookUp: number =
    isAfter(today, halloweenThisYear) && !isSameDay(today, halloweenThisYear)
      ? today.getFullYear()
      : today.getFullYear() - 1;

  const valentinesThisYear = getValentinesDay(today.getFullYear());
  const valentinesYearToLookUp: number =
    isAfter(today, valentinesThisYear) && !isSameDay(today, valentinesThisYear)
      ? today.getFullYear()
      : today.getFullYear() - 1;

  useEffect(() => {
    const setup = async () => {
      setIsLoading(true);
      try {
        const christmasItems = await listWatchedOnDate(
          getChristmas(christmasYearToLookUp),
        );
        setChristmasItems(
          christmasItems.filter((item) => !hiddenIds.includes(item.id ?? "")),
        );

        const christmasEveItems = await listWatchedOnDate(
          subDays(getChristmas(christmasEveYearToLookUp), 1),
        );
        setChristmasEveItems(
          christmasEveItems.filter(
            (item) => !hiddenIds.includes(item.id ?? ""),
          ),
        );

        const halloweenItems = await listWatchedOnDate(
          getHalloween(halloweenYearToLookUp),
        );
        setHalloweenItems(
          halloweenItems.filter((item) => !hiddenIds.includes(item.id ?? "")),
        );

        const valentinesItems = await listWatchedOnDate(
          getValentinesDay(valentinesYearToLookUp),
        );
        setValentinesItems(
          valentinesItems.filter((item) => !hiddenIds.includes(item.id ?? "")),
        );
      } catch (error) {
        showBoundary(error);
      } finally {
        setIsLoading(false);
      }
    };
    void setup();
  }, [hiddenIds]);

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
        <Spinner size={"3"} />
      </div>
    );
  }

  return (
    <Box
      style={{ backgroundColor: "var(--orange-8)" }}
      className="min-h-screen"
    >
      <Container size="4" p="4">
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <Title as={motion.h1} variants={itemVariants}>
              Christmas {christmasYearToLookUp}
            </Title>
            <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
              {christmasItems.map((movie) => (
                <MovieCard
                  key={generateGuid()}
                  item={movie}
                  onHide={() => {
                    setCachedHiddenId(movie.id ?? "");
                    setHiddenIds([...hiddenIds, movie.id ?? ""]);
                  }}
                />
              ))}
            </Grid>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <Title as={motion.h1} variants={itemVariants}>
              Christmas Eve {christmasEveYearToLookUp}
            </Title>
            <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
              {christmasEveItems.map((movie) => (
                <MovieCard
                  key={generateGuid()}
                  item={movie}
                  onHide={() => {
                    setCachedHiddenId(movie.id ?? "");
                    setHiddenIds([...hiddenIds, movie.id ?? ""]);
                  }}
                />
              ))}
            </Grid>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <Title as={motion.h1} variants={itemVariants}>
              Halloween {halloweenYearToLookUp}
            </Title>
            <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
              {halloweenItems.map((movie) => (
                <MovieCard
                  key={generateGuid()}
                  item={movie}
                  onHide={() => {
                    setCachedHiddenId(movie.id ?? "");
                    setHiddenIds([...hiddenIds, movie.id ?? ""]);
                  }}
                />
              ))}
            </Grid>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <Title as={motion.h1} variants={itemVariants}>
              Valentines {valentinesYearToLookUp}
            </Title>
            <Grid columns={{ initial: "2", sm: "3", md: "4", lg: "5" }} gap="4">
              {valentinesItems.map((movie) => (
                <MovieCard
                  key={generateGuid()}
                  item={movie}
                  onHide={() => {
                    setCachedHiddenId(movie.id ?? "");
                    setHiddenIds([...hiddenIds, movie.id ?? ""]);
                  }}
                />
              ))}
            </Grid>
          </div>
        </div>
      </Container>
      <Button
        size={"4"}
        style={{ width: "100%" }}
        onClick={() => {
          void navigate("/tv");
        }}
      >
        Review Live TV
      </Button>
    </Box>
  );
}
