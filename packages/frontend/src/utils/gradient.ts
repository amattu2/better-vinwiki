/**
 * Generate a CSS gradient from a list of options
 *
 * @returns gradient string
 */
export const randomGradient = (): string => {
  const options = [
    "linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)",
    "linear-gradient(to top, #fad0c4 0%, #ffd1ff 100%)",
    "linear-gradient(to top, #fad0c4 0%, #ffd1ff 100%)",
    "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
    "linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)",
    "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    "linear-gradient(to top, #ebc0fd 0%, #d9ded8 100%)",
    "linear-gradient(to top, #cd9cf2 0%, #f6f3ff 100%)",
    "linear-gradient(to top, #accbee 0%, #e7f0fd 100%)",
    "linear-gradient(to bottom left, #a18cd1 0%, #fbc2eb 100%)",
  ];

  return options[Math.floor(Math.random() * options.length)];
};
