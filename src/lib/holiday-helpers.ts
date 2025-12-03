import {
  getChristmas,
  getHalloween,
  getValentinesDay,
} from "date-fns-holiday-us";
import { isAfter, isSameDay } from "date-fns";

export function getHolidayYear(holidayDate: Date, today: Date): number {
  return isAfter(today, holidayDate) && !isSameDay(today, holidayDate)
    ? today.getFullYear()
    : today.getFullYear() - 1;
}

export function getHolidayDates(today: Date) {
  const christmasYear = getHolidayYear(
    getChristmas(today.getFullYear()),
    today
  );
  const halloweenYear = getHolidayYear(
    getHalloween(today.getFullYear()),
    today
  );
  const valentinesYear = getHolidayYear(
    getValentinesDay(today.getFullYear()),
    today
  );

  return {
    christmas: getChristmas(christmasYear),
    halloween: getHalloween(halloweenYear),
    valentines: getValentinesDay(valentinesYear),
  };
}
