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

  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => encodeForCSV(row?.[h] || "")).join(',')).join('\r\n');
  const csv = `${headers.map(encodeForCSV).join(',')}\r\n${rows}`;

  downloadBlob(csv, 'export.csv', 'text/csv');
};

/**
 * Converts a CSV string to an array of objects
 *
 * @param csv the raw CSV string
 * @param headers whether the CSV has headers or not
 */
export const csvToObject = (csv: string, headers: boolean): Record<string, unknown>[] => {
  if (!csv || !csv.length) {
    return [];
  }

  const lines = csv.split(/\r?\n/);
  const result = [];
  const start = headers ? 1 : 0;
  const keys = headers ? lines[0].split(',') : [];

  for (let i = start; i < lines.length; i += 1) {
    const obj: Record<string, unknown> = {};
    const currentline = lines[i].split(',');

    for (let j = 0; j < keys.length; j += 1) {
      obj[keys[j]] = decodeFromCSV(currentline[j]);
    }

    result.push(obj);
  }

  return result;
};

const encodeForCSV = (value: unknown): string => `"${String(value).replaceAll('"', '""')}"`;
const decodeFromCSV = (value: string): string => value.replaceAll('""', '"');

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
