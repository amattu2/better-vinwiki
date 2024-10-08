/**
 * Resolves a FileList file upload to a base64 string
 *
 * @param file the file to convert
 * @returns base64 string
 */
export const imageToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    if (!(file instanceof Blob)) {
      reject(new Error("imageToBase64 received a non-blob input"));
      return;
    }

    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("imageToBase64 failed to convert image to base64"));
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
