import {
  fetchDeviceStats,
  fetchPunchCard,
  fetchCalendar,
} from "../backend-api";

export const getDeviceStats = async (): Promise<{
  deviceUsage: { name: string; count: number }[];
  browserUsage: { name: string; count: number }[];
  osUsage: { name: string; count: number }[];
}> => {
  return fetchDeviceStats();
};

export const getPunchCardData = async (): Promise<
  {
    dayOfWeek: number;
    hour: number;
    count: number;
  }[]
> => {
  return fetchPunchCard();
};

export const getCalendarData = async (): Promise<
  {
    value: number;
    day: string;
  }[]
> => {
  return fetchCalendar();
};
