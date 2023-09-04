export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  });
}

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

  if (diff < 24 * 60 * 60 * 1000) {
    return `${includePrefix ? "today at " : ""}${formatTime(date)}`;
  }

  return `${formatDate(date)} on ${formatTime(date)}`;
}
