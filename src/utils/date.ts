import dayjs, { Dayjs } from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import tz from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(tz);
dayjs.extend(utc);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

/**
 * Format a date into a human-readable string, with an optional locale argument.
 *
 * @example formatDate(new Date(), "en-US") -> "June 6, 2018"
 * @param date The JavaScript date to format
 * @param locale The locale to use for formatting
 * @returns The formatted date string
 */
export const formatDate = (date: Date, locale: Intl.LocalesArgument = "en-US") =>
  date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/**
 * Format a time from a Date object into a human-readable string, with an optional locale argument.
 *
 * @example "10:32 AM"
 * @param date The JavaScript date object to format
 * @param locale The locale to use for formatting
 * @returns The formatted time string
 */
export const formatTime = (date: Date, locale: Intl.LocalesArgument = "en-US") =>
  date.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "numeric",
  });

/**
 * Parse a Date object into a formatted date and time string
 *
 * @param date JavaScript Date object
 * @param includePrefix include "today" prefix
 * @param locale locale to use for formatting
 * @returns formatted date and time
 */
export const formatDateTime = (
  date: Date,
  includePrefix = false,
  locale: Intl.LocalesArgument = "en-US"
) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 12 * 60 * 60 * 1000) {
    return `${includePrefix ? "today at " : ""}${formatTime(date, locale)}`;
  }

  return `${formatDate(date, locale)} at ${formatTime(date, locale)}`;
};

/**
 * Parse a Date object into a MM/YY formatted string
 *
 * @param date JavaScript Date object
 * @param locale locale to use for formatting
 * @returns formatted MM/YY string
 */
export const formatDateMMYY = (date: Date, locale: Intl.LocalesArgument = "en-US") =>
  date.toLocaleDateString(locale, {
    month: "2-digit",
    year: "2-digit",
  });

/**
 * Parse a NHTSA recall date DD/MM/YYYY into MMMM Do, YYYY
 *
 * @param date NHTSA recall date
 * @returns formatted date
 */
export const formatNHTSADate = (date: string) => {
  const parsedDate = dayjs(date, "DD/MM/YYYY", true);

  if (!parsedDate.isValid()) {
    return date;
  }

  return parsedDate.format("MMMM Do, YYYY");
};

/**
 * Parse a NHTSA recall date DD/MM/YYYY into a Date object
 *
 * @param date NHTSA recall date
 * @returns Date object
 */
export const parseNHTSADate = (date: string) => dayjs(date, "DD/MM/YYYY", true).toDate();

/**
 * Checks if the `event_date` is an actual valid date worth displaying.
 *
 * Constraints:
 * - `event_date` and `post_date` must be a valid dates
 * - `event_date` is not past the `post_date`
 * - `event_date` is not equal to the same Date and Hour of `post_date`
 *
 * Notes:
 * - We cannot do a direct equality check on `event_date` and `post_date` because
 *   the `event_date` does not contain minutes.
 * - ISO 8601 with UTC (`Z` or `00:00`) is invalid.
 *
 * @param {FeedPost["event_date"]} event The event date
 * @param {FeedPost["post_date"]} post The post date
 * @throws {Error} If any of the constraints are violated
 * @returns {boolean} true if the `event_date` is valid
 */
export const isValidEventDate = (
  event: FeedPost["event_date"],
  post: FeedPost["post_date"]
): boolean => {
  // Missing or invalid event date. This is not valid.
  const eventDate = dayjs(new Date(event));
  if (!event || !eventDate.isValid()) {
    throw new Error("Invalid event date format");
  }

  // Missing or invalid post date. This should not happen.
  const postDate = dayjs(new Date(post));
  if (!post || !postDate.isValid() || postDate.get("hours") === 0) {
    throw new Error("Invalid post date format");
  }

  // Event date occurs in the future. This is not valid.
  if (eventDate.isAfter(postDate)) {
    throw new Error("Event date is after post date");
  }

  // Event date is the same day and hour as the post date. This is not valid.
  // NOTE: This is guarded by the `isAfter` check above. If the event date is
  //       in the future, then it cannot be the same day and hour as the post
  if (eventDate.isSame(postDate, "day") && eventDate.isSame(postDate, "hour")) {
    throw new Error("Event date is the same day and hour as the post date");
  }

  return true;
};

/**
 * Safely parse a date to a ISO string
 *
 * @param date Dayjs object
 * @returns ISO Date or null
 */
export const safeIsoParse = (date: Dayjs | null): string | null => {
  if (!date || !(date instanceof dayjs)) {
    return null;
  }

  try {
    return dayjs(date).toISOString();
  } catch (e) {
    return null;
  }
};
