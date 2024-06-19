import { imageToBase64 } from "./image";

describe("imageToBase64", () => {
  it("should resolve a FileList file to a base64 string", async () => {
    const file = new File(["test"], "test.png", { type: "image/png" });
    const base64 = await imageToBase64(file);

    expect(base64).toMatch(/^data:image\/png;base64,/);
  });

  it("should reject if the file is not a valid blob", async () => {
    await expect(imageToBase64("" as unknown as File)).rejects.toThrow("Invalid file type");
  });

  it.todo("should reject if the image fails to convert to base64");

  it.todo("should reject if the reader result is not a string");
});
