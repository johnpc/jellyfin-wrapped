import {
  getCurrentUserId,
  getStartDate,
  getEndDate,
  formatDateForSql,
  playbackReportingSqlRequest,
} from "./utils";

export const getViewingPatterns = async (): Promise<{
  timeOfDay: { hour: number; minutes: number }[];
  dayOfWeek: { day: number; minutes: number }[];
  primeTime: { isPrimeTime: boolean; minutes: number }[];
}> => {
  const userId = await getCurrentUserId();
  const startDate = getStartDate();
  const endDate = getEndDate();

  const timeOfDayQuery = `
  SELECT
    strftime('%H', DateCreated) as Hour,
    SUM(PlayDuration) as TotalPlayDuration
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND DateCreated > '${formatDateForSql(startDate)}'
  AND DateCreated <= '${formatDateForSql(endDate)}'
  GROUP BY Hour
  ORDER BY Hour
  `;

  const dayOfWeekQuery = `
  SELECT
    strftime('%w', DateCreated) as DayOfWeek,
    SUM(PlayDuration) as TotalPlayDuration
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND DateCreated > '${formatDateForSql(startDate)}'
  AND DateCreated <= '${formatDateForSql(endDate)}'
  GROUP BY DayOfWeek
  ORDER BY DayOfWeek
  `;

  const primeTimeQuery = `
  SELECT
    CASE
      WHEN strftime('%H', DateCreated) BETWEEN '19' AND '22' THEN 1
      ELSE 0
    END as IsPrimeTime,
    SUM(PlayDuration) as TotalPlayDuration
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND DateCreated > '${formatDateForSql(startDate)}'
  AND DateCreated <= '${formatDateForSql(endDate)}'
  GROUP BY IsPrimeTime
  ORDER BY IsPrimeTime
  `;

  const [timeData, dayData, primeTimeData] = await Promise.all([
    playbackReportingSqlRequest(timeOfDayQuery),
    playbackReportingSqlRequest(dayOfWeekQuery),
    playbackReportingSqlRequest(primeTimeQuery),
  ]);

  const timeOfDay = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    minutes: 0,
  }));

  timeData.results.forEach((result: string[]) => {
    const hour = parseInt(
      result[timeData.colums.findIndex((c: string) => c === "Hour")]
    );
    const duration = parseInt(
      result[
        timeData.colums.findIndex((c: string) => c === "TotalPlayDuration")
      ]
    );
    timeOfDay[hour].minutes = Math.floor(Math.max(0, duration) / 60);
  });

  const dayOfWeek = Array.from({ length: 7 }, (_, i) => ({
    day: i,
    minutes: 0,
  }));

  dayData.results.forEach((result: string[]) => {
    const day = parseInt(
      result[dayData.colums.findIndex((c: string) => c === "DayOfWeek")]
    );
    const duration = parseInt(
      result[dayData.colums.findIndex((c: string) => c === "TotalPlayDuration")]
    );
    dayOfWeek[day].minutes = Math.floor(Math.max(0, duration) / 60);
  });

  const primeTime = Array.from({ length: 2 }, (_, i) => ({
    isPrimeTime: i === 1,
    minutes: 0,
  }));

  primeTimeData.results.forEach((result: string[]) => {
    const isPrimeTime =
      parseInt(
        result[
          primeTimeData.colums.findIndex((c: string) => c === "IsPrimeTime")
        ]
      ) === 1;
    const duration = parseInt(
      result[
        primeTimeData.colums.findIndex((c: string) => c === "TotalPlayDuration")
      ]
    );
    const index = isPrimeTime ? 1 : 0;
    primeTime[index].minutes = Math.floor(Math.max(0, duration) / 60);
  });

  return {
    timeOfDay,
    dayOfWeek,
    primeTime,
  };
};

export const getDeviceStats = async (): Promise<{
  deviceUsage: { deviceName: string; minutes: number }[];
  browserUsage: { browserName: string; minutes: number }[];
  osUsage: { osName: string; minutes: number }[];
}> => {
  const userId = await getCurrentUserId();
  const startDate = getStartDate();
  const endDate = getEndDate();

  const deviceQuery = `
  SELECT
    DeviceName,
    SUM(PlayDuration) as TotalPlayDuration
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND DateCreated > '${formatDateForSql(startDate)}'
  AND DateCreated <= '${formatDateForSql(endDate)}'
  GROUP BY DeviceName
  ORDER BY TotalPlayDuration DESC
  `;

  const browserQuery = `
  SELECT
    CASE
      WHEN DeviceName LIKE '%Chrome%' THEN 'Chrome'
      WHEN DeviceName LIKE '%Firefox%' THEN 'Firefox'
      WHEN DeviceName LIKE '%Safari%' THEN 'Safari'
      WHEN DeviceName LIKE '%Edge%' THEN 'Edge'
      WHEN DeviceName LIKE '%TV%' THEN 'Smart TV'
      WHEN DeviceName LIKE '%Mobile%' THEN 'Mobile'
      ELSE 'Other'
    END as BrowserName,
    SUM(PlayDuration) as TotalPlayDuration
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND DateCreated > '${formatDateForSql(startDate)}'
  AND DateCreated <= '${formatDateForSql(endDate)}'
  GROUP BY BrowserName
  ORDER BY TotalPlayDuration DESC
  `;

  const osQuery = `
  SELECT
    CASE
      WHEN DeviceName LIKE '%Windows%' THEN 'Windows'
      WHEN DeviceName LIKE '%Mac%' OR DeviceName LIKE '%iOS%' THEN 'Apple'
      WHEN DeviceName LIKE '%Android%' THEN 'Android'
      WHEN DeviceName LIKE '%Linux%' THEN 'Linux'
      WHEN DeviceName LIKE '%TV%' THEN 'Smart TV'
      ELSE 'Other'
    END as OSName,
    SUM(PlayDuration) as TotalPlayDuration
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND DateCreated > '${formatDateForSql(startDate)}'
  AND DateCreated <= '${formatDateForSql(endDate)}'
  GROUP BY OSName
  ORDER BY TotalPlayDuration DESC
  `;

  const [deviceData, browserData, osData] = await Promise.all([
    playbackReportingSqlRequest(deviceQuery),
    playbackReportingSqlRequest(browserQuery),
    playbackReportingSqlRequest(osQuery),
  ]);

  const deviceUsage = deviceData.results.map((result: string[]) => {
    const deviceName =
      result[deviceData.colums.findIndex((c: string) => c === "DeviceName")];
    const duration = parseInt(
      result[
        deviceData.colums.findIndex((c: string) => c === "TotalPlayDuration")
      ]
    );
    return {
      deviceName,
      minutes: Math.floor(Math.max(0, duration) / 60),
    };
  });

  const browserUsage = browserData.results.map((result: string[]) => {
    const browserName =
      result[browserData.colums.findIndex((c: string) => c === "BrowserName")];
    const duration = parseInt(
      result[
        browserData.colums.findIndex((c: string) => c === "TotalPlayDuration")
      ]
    );
    return {
      browserName,
      minutes: Math.floor(Math.max(0, duration) / 60),
    };
  });

  const osUsage = osData.results.map((result: string[]) => {
    const osName =
      result[osData.colums.findIndex((c: string) => c === "OSName")];
    const duration = parseInt(
      result[osData.colums.findIndex((c: string) => c === "TotalPlayDuration")]
    );
    return {
      osName,
      minutes: Math.floor(Math.max(0, duration) / 60),
    };
  });

  return {
    deviceUsage,
    browserUsage,
    osUsage,
  };
};
