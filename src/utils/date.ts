import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);

export const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export const formatTime = (date: Date) => date.toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: 'numeric',
});

/**
 * Parse a Date object into a formatted date and time string
 *
 * @param date JavaScript Date object
 * @param includePrefix include "today" prefix
 * @returns formatted date and time
 */
export const formatDateTime = (date: Date, includePrefix = false) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < (12 * 60 * 60 * 1000)) {
    return `${includePrefix ? "today at " : ""}${formatTime(date)}`;
  }

  return `${formatDate(date)} at ${formatTime(date)}`;
};

/**
 * Parse a Date object into a MM/YY formatted string
 *
 * @param date JavaScript Date object
 * @returns formatted MM/YY string
 */
export const formatDateMMYY = (date: Date) => date.toLocaleDateString('en-US', {
  month: '2-digit',
  year: '2-digit',
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
export const isValidEventDate = (event: FeedPost["event_date"], post: FeedPost["post_date"]): boolean => {
  // Missing or invalid event date. This is not valid.
  const eventDate = dayjs(event, "YYYY-MM-DD[T]HH:mm:ssZ", true);
  if (!event || !eventDate.isValid()) {
    throw new Error("Invalid event date format");
  }

  // Missing or invalid post date. This should not happen.
  const postDate = dayjs(post, "YYYY-MM-DD[T]HH:mm:ssZ", true);
  if (!post || !postDate.isValid()) {
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
