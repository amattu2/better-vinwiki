/**
 * Build a CSV from an array of objects and download it
 *
 * Note: The headers are derived from the keys of the first
 * object in the array. If the array is empty, nothing happens.
 *
 * @see https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
 * @param data - Array of objects to convert to CSV
 * @returns void
 */
export const objectToCSV = <T extends Record<string, unknown>>(data: T[]): void => {
  if (!data.length || !Object.keys(data[0]).length) {
    return;
  }

  const headers = Object.keys(data[0]).map(encodeForCSV).join(',');
  const rows = data.map((row) => Object.values(row).map(encodeForCSV).join(',')).join('\r\n');
  const csv = `${headers}\r\n${rows}`;

  downloadBlob(csv, 'export.csv', 'text/csv');
};

const encodeForCSV = (value: unknown): string => `"${String(value).replaceAll('"', '""')}"`;

/**
 * Build a file with data and download it
 *
 * @see https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
 * @param content file content
 * @param filename file name
 * @param contentType
 */
const downloadBlob = (content: string, filename: string, contentType: string): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);

  // Create a link to download it
  const pom = document.createElement('a');
  pom.href = url;
  pom.setAttribute('download', filename);
  pom.click();
  pom.remove();
};
