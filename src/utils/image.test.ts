import { imageToBase64 } from "./image";

describe("imageToBase64", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should resolve a FileList file to a base64 string", async () => {
    const file = new File(["test"], "test.png", { type: "image/png" });
    const base64 = await imageToBase64(file);

    expect(base64).toMatch(/^data:image\/png;base64,/);
  });

  it("should reject if the file is not a valid blob", async () => {
    await expect(imageToBase64("" as unknown as File)).rejects.toThrow(
      "imageToBase64 received a non-blob input"
    );
  });

  it("should reject if the FileReader throws an error", async () => {
    const file = new File(["test"], "test.png", { type: "image/png" });
    const reader = new FileReader();

    jest.spyOn(global, "FileReader").mockReturnValue(reader);
    jest
      .spyOn(reader, "readAsDataURL")
      .mockImplementation(() =>
        reader.onerror?.(new Error("mock error") as unknown as ProgressEvent<FileReader>)
      );

    await expect(imageToBase64(file)).rejects.toThrow("mock error");
  });

  it("should reject if the reader result is not a string", async () => {
    const file = new File(["test"], "test.png", { type: "image/png" });
    const reader = new FileReader();

    jest.spyOn(global, "FileReader").mockReturnValue(reader);
    jest
      .spyOn(reader, "readAsDataURL")
      .mockImplementation(() =>
        reader.onload?.(new ArrayBuffer(1) as unknown as ProgressEvent<FileReader>)
      );

    await expect(imageToBase64(file)).rejects.toThrow(
      "imageToBase64 failed to convert image to base64"
    );
  });
});
