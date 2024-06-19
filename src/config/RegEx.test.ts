import { MentionRegex } from "./RegEx";

describe("MentionRegex", () => {
  it("should match @username", () => {
    expect("@username").toMatch(MentionRegex);
  });

  it("should match username in a sentence", () => {
    expect("hey @username check this out").toMatch(MentionRegex);
  });

  it("should match a username with numbers", () => {
    expect("@username123").toMatch(MentionRegex);
  });

  it("should match a username with multiple periods", () => {
    expect("@user.name.here").toMatch(MentionRegex);
  });

  it("should not match a email address", () => {
    expect("testemail@example.com").not.toMatch(MentionRegex);
  });

  it("should not match a hyperlink", () => {
    expect("https://example.com").not.toMatch(MentionRegex);
  });

  it("should not match a username with multiple periods consecutively", () => {
    expect("@user..name").not.toMatch(MentionRegex);
  });

  it("should not match a username starting with a period", () => {
    expect("@.username").not.toMatch(MentionRegex);
  });

  it("should not match a username ending with a period", () => {
    expect("@username.").not.toMatch(MentionRegex);
  });
});
