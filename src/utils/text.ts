/**
 * Trims the string at the last space before the given length
 * and adds an ellipsis to the end.
 *
 * @param str
 * @param length
 * @returns String with length <= length
 */
export const prettySubstring = (str: string, length: number): string => {
  if (str.length <= length) {
    return str;
  }

  const spaceIndex = str.lastIndexOf(" ", length);
  const shortened = str.substring(0, spaceIndex);

  return shortened.charAt(shortened.length - 1) === "." ? shortened : `${shortened}...`;
};
