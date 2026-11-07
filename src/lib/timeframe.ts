import {
  format,
  subMonths,
  subYears,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

export interface TimeframeOption {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  description: string;
}

// Current date to use as reference
const now = new Date();

// Generate timeframe options
export const generateTimeframeOptions = (): TimeframeOption[] => {
  const options: TimeframeOption[] = [];

  // Last 12 months (default)
  const lastYear = subYears(now, 1);
  options.push({
    id: "last-12-months",
    name: "Last 12 Months",
    startDate: lastYear,
    endDate: now,
    description: `${format(lastYear, "MMM yyyy")} - ${format(now, "MMM yyyy")}`,
  });

  // Last 6 months
  const last6Months = subMonths(now, 6);
  options.push({
    id: "last-6-months",
    name: "Last 6 Months",
    startDate: last6Months,
    endDate: now,
    description: `${format(last6Months, "MMM yyyy")} - ${format(now, "MMM yyyy")}`,
  });

  // Last 3 months
  const last3Months = subMonths(now, 3);
  options.push({
    id: "last-3-months",
    name: "Last 3 Months",
    startDate: last3Months,
    endDate: now,
    description: `${format(last3Months, "MMM yyyy")} - ${format(now, "MMM yyyy")}`,
  });

  // Last month
  const lastMonth = subMonths(now, 1);
  const startLastMonth = startOfMonth(lastMonth);
  const endLastMonth = endOfMonth(lastMonth);
  options.push({
    id: "last-month",
    name: "Last Month",
    startDate: startLastMonth,
    endDate: endLastMonth,
    description: format(lastMonth, "MMMM yyyy"),
  });

  // Current month
  const startCurrentMonth = startOfMonth(now);
  options.push({
    id: "current-month",
    name: "Current Month",
    startDate: startCurrentMonth,
    endDate: now,
    description: format(now, "MMMM yyyy"),
  });

  // Previous calendar years
  for (let i = 1; i <= 3; i++) {
    const year = now.getFullYear() - i;
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 0, 1));
    options.push({
      id: `year-${year}`,
      name: `${year}`,
      startDate,
      endDate,
      description: `Full Year ${year}`,
    });
  }

  return options;
};

// Default timeframe (last 12 months)
export const defaultTimeframe: TimeframeOption = generateTimeframeOptions()[0];

// The selection survives a page reload (the timeframe selector reloads the page to
// re-run every query), so it is kept in sessionStorage by id. Storage can be
// unavailable or blocked, so every access falls back to the default.
const TIMEFRAME_STORAGE_KEY = "jellyfin-wrapped-timeframe";

const loadStoredTimeframe = (): TimeframeOption => {
  try {
    const id = sessionStorage.getItem(TIMEFRAME_STORAGE_KEY);
    const stored = generateTimeframeOptions().find((option) => option.id === id);
    return stored ?? defaultTimeframe;
  } catch {
    return defaultTimeframe;
  }
};

// Store the currently selected timeframe
let currentTimeframe: TimeframeOption = loadStoredTimeframe();

// Get the current timeframe
export const getCurrentTimeframe = (): TimeframeOption => {
  return currentTimeframe;
};

// Set the current timeframe
export const setCurrentTimeframe = (timeframe: TimeframeOption): void => {
  currentTimeframe = timeframe;
  try {
    sessionStorage.setItem(TIMEFRAME_STORAGE_KEY, timeframe.id);
  } catch {
    // Not persisted; the selection still applies until the page is reloaded.
  }
};

// Format a timeframe for display
export const formatTimeframeDescription = (
  timeframe: TimeframeOption,
): string => {
  return timeframe.description;
};
