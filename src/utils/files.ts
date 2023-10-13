/**
 * Build a file with data and download it
 *
 * @see https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
 * @param content file content
 * @param filename file name
 * @param contentType
 */
export const downloadBlob = (content: string, filename: string, contentType: string): void => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);

  // Create a link to download it
  const pom = document.createElement('a');
  pom.href = url;
  pom.setAttribute('download', filename);
  pom.click();
  pom.remove();
};
