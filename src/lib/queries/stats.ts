import {
  getCurrentUserId,
  getStartDate,
  getEndDate,
  formatDateForSql,
  playbackReportingSqlRequest,
} from "./utils";

export const getDeviceStats = async (): Promise<{
  deviceUsage: { name: string; count: number }[];
  browserUsage: { name: string; count: number }[];
  osUsage: { name: string; count: number }[];
}> => {
  const userId = await getCurrentUserId();
  const startDate = getStartDate();
  const endDate = getEndDate();

  // Device usage query
  const deviceQuery = `
    SELECT
      DeviceName as device,
      COUNT(*) as count
    FROM PlaybackActivity
    WHERE UserId = "${userId}"
    AND DateCreated > '${formatDateForSql(startDate)}'
    AND DateCreated <= '${formatDateForSql(endDate)}'
    AND DeviceName IS NOT NULL
    AND DeviceName != ''
    GROUP BY DeviceName
    ORDER BY count DESC
  `;

  const deviceData = await playbackReportingSqlRequest(deviceQuery);
  const deviceNameIndex = deviceData.colums.findIndex((i: string) => i === "device");
  const deviceCountIndex = deviceData.colums.findIndex((i: string) => i === "count");

  const deviceUsage = deviceData.results.map((row: string[]) => ({
    name: row[deviceNameIndex] || "Unknown Device",
    count: parseInt(row[deviceCountIndex]) || 0,
  }));

  // Client usage query (browser/app)
  const clientQuery = `
    SELECT
      ClientName as client,
      COUNT(*) as count
    FROM PlaybackActivity
    WHERE UserId = "${userId}"
    AND DateCreated > '${formatDateForSql(startDate)}'
    AND DateCreated <= '${formatDateForSql(endDate)}'
    AND ClientName IS NOT NULL
    AND ClientName != ''
    GROUP BY ClientName
    ORDER BY count DESC
  `;

  const clientData = await playbackReportingSqlRequest(clientQuery);
  const clientNameIndex = clientData.colums.findIndex((i: string) => i === "client");
  const clientCountIndex = clientData.colums.findIndex((i: string) => i === "count");

  const browserUsage = clientData.results.map((row: string[]) => ({
    name: row[clientNameIndex] || "Unknown Client",
    count: parseInt(row[clientCountIndex]) || 0,
  }));

  // Derive OS from device names - common patterns
  const osPatterns: { [key: string]: RegExp } = {
    "Windows": /windows|win\d+|pc/i,
    "macOS": /mac|macos|osx/i,
    "iOS": /iphone|ipad|ios/i,
    "Android": /android/i,
    "Linux": /linux|ubuntu|debian|fedora/i,
    "Chrome OS": /chromebook|chrome\s?os/i,
    "Smart TV": /tv|roku|firestick|chromecast|apple\s?tv/i,
  };

  const osCounts: { [key: string]: number } = {};
  
  deviceUsage.forEach(device => {
    let matched = false;
    for (const [osName, pattern] of Object.entries(osPatterns)) {
      if (pattern.test(device.name)) {
        osCounts[osName] = (osCounts[osName] || 0) + device.count;
        matched = true;
        break;
      }
    }
    if (!matched) {
      osCounts["Other"] = (osCounts["Other"] || 0) + device.count;
    }
  });

  const osUsage = Object.entries(osCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    deviceUsage,
    browserUsage,
    osUsage,
  };
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
