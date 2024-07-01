import * as utils from "./text";

describe("prettySubstr", () => {
  it("should return a substring of the input string", () => {
    expect(utils.prettySubstring("Hello, world!", 6)).toBe("Hello,...");
  });

  it("should return the original string if the length is less than the limit", () => {
    expect(utils.prettySubstring("Hello, world!", 20)).toBe("Hello, world!");
  });

  it("should return an empty string if the input is not a string", () => {
    expect(utils.prettySubstring(null as unknown as string, 5)).toBe("");
  });

  it("should not append an ellipsis if the last character is a period", () => {
    expect(utils.prettySubstring("Hey. How are you?", 4)).toBe("Hey.");
  });
});
