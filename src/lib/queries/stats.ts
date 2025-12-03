import {
  getCurrentUserId,
  getStartDate,
  getEndDate,
  formatDateForSql,
  playbackReportingSqlRequest,
} from "./utils";

export const getMinutesPlayedPerDay = async (): Promise<
  {
    date: string;
    minutes: number;
  }[]
> => {
  const userId = await getCurrentUserId();
  const startDate = getStartDate();
  const endDate = getEndDate();

  const queryString = `
  SELECT
    date(DateCreated) as PlayDate,
    SUM(PlayDuration) as TotalPlayDuration
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND DateCreated > '${formatDateForSql(startDate)}'
  AND DateCreated <= '${formatDateForSql(endDate)}'
  GROUP BY date(DateCreated)
  ORDER BY PlayDate DESC
  `;

  const data = await playbackReportingSqlRequest(queryString);

  const dateIndex = data.colums.findIndex((i: string) => i === "PlayDate");
  const durationIndex = data.colums.findIndex(
    (i: string) => i === "TotalPlayDuration"
  );

  return data.results.map((result: string[]) => {
    const duration = parseInt(result[durationIndex]);
    const zeroBoundDuration = Math.max(0, duration);
    const minutes = Math.floor(zeroBoundDuration / 60);

    return {
      date: result[dateIndex],
      minutes: minutes,
    };
  });
};

export const getPunchCardData = async (): Promise<
  {
    dayOfWeek: number;
    hour: number;
    count: number;
  }[]
> => {
  const userId = await getCurrentUserId();
  const startDate = getStartDate();
  const endDate = getEndDate();

  const queryString = `
    SELECT
      strftime('%w', DateCreated) as day_of_week,
      strftime('%H', DateCreated) as hour,
      COUNT(*) as count
    FROM PlaybackActivity
    WHERE UserId = "${userId}"
    AND DateCreated > '${formatDateForSql(startDate)}'
    AND DateCreated <= '${formatDateForSql(endDate)}'
    GROUP BY day_of_week, hour
    ORDER BY day_of_week, hour
  `;

  const data = await playbackReportingSqlRequest(queryString);

  const dayIndex = data.colums.findIndex((i: string) => i === "day_of_week");
  const hourIndex = data.colums.findIndex((i: string) => i === "hour");
  const countIndex = data.colums.findIndex((i: string) => i === "count");

  return data.results.map((row: string[]) => ({
    dayOfWeek: parseInt(row[dayIndex]),
    hour: parseInt(row[hourIndex]),
    count: parseInt(row[countIndex]),
  }));
};

export const getCalendarData = async (): Promise<
  {
    value: number;
    day: string;
  }[]
> => {
  const userId = await getCurrentUserId();

  const queryString = `
    SELECT
      date(DateCreated) as day,
      COUNT(*) as count
    FROM PlaybackActivity
    WHERE UserId = "${userId}"
    AND DateCreated > date('now', '-1 year')
    GROUP BY date(DateCreated)
    ORDER BY day
  `;

  const data = await playbackReportingSqlRequest(queryString);

  const dayIndex = data.colums.findIndex((i: string) => i === "day");
  const countIndex = data.colums.findIndex((i: string) => i === "count");

  return data.results.map((row: string[]) => ({
    day: row[dayIndex],
    value: parseInt(row[countIndex]),
  }));
};
