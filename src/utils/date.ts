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
