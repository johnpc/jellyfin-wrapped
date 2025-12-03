import {
  getCurrentUserId,
  getStartDate,
  getEndDate,
  formatDateForSql,
  playbackReportingSqlRequest,
} from "./utils";

export const listLiveTvChannels = async (): Promise<
  {
    channelName: string;
    duration: number;
  }[]
> => {
  const userId = await getCurrentUserId();
  const startDate = getStartDate();
  const endDate = getEndDate();

  const queryString = `
  SELECT ROWID, *
  FROM PlaybackActivity
  WHERE UserId = "${userId}"
  AND ItemType = "TvChannel"
  AND DateCreated > '${formatDateForSql(startDate)}'
  AND DateCreated <= '${formatDateForSql(endDate)}'
  ORDER BY rowid DESC
  `;
  const data = await playbackReportingSqlRequest(queryString);

  const itemNameIndex = data.colums.findIndex((i: string) => i == "ItemName");
  const playDurationIndex = data.colums.findIndex(
    (i: string) => i == "PlayDuration"
  );

  const channelWatchTimeInfo = data.results
    .map((result: string[]) => {
      return {
        channelName: result[itemNameIndex],
        duration: parseInt(result[playDurationIndex]),
      };
    })
    .reduce(
      (
        acc: { channelName: string; duration: number }[],
        curr: { channelName: string; duration: number }
      ) => {
        const existingChannel = acc.find(
          (item: { channelName: string }) =>
            item.channelName === curr.channelName
        );
        if (existingChannel) {
          existingChannel.duration += curr.duration;
        } else {
          acc.push({ ...curr });
        }
        return acc;
      },
      []
    );

  channelWatchTimeInfo.sort(
    (a: { duration: number }, b: { duration: number }) =>
      b.duration - a.duration
  );

  return channelWatchTimeInfo;
};
