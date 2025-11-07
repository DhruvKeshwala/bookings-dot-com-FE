import { differenceInMinutes } from "date-fns";
import { formatDurationFromMinutes } from "./formatDurationFromMinutes";

/**
 * Returns the difference in minutes between two date strings or Date objects.
 *
 * @param from - Start time (Date | string)
 * @param to - End time (Date | string)
 * @returns Number of minutes between the two times
 */
export function getMinutesDifference(from: Date | string, to: Date | string) {
  const fromDate = typeof from === "string" ? new Date(from) : from;
  const toDate = typeof to === "string" ? new Date(to) : to;

  return formatDurationFromMinutes(differenceInMinutes(toDate, fromDate));
}
