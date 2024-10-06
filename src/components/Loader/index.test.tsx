import { render, waitFor } from "@testing-library/react";
import Loader from "./index";

describe("Basic Functionality", () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("should render without crashing", () => {
    expect(() => render(<Loader />)).not.toThrow();
  });

  it("should render as fullscreen by default", () => {
    const { getByTestId } = render(<Loader />);

    expect(getByTestId("loader-wrapper")).toHaveStyle("position: fixed");
  });

  it("should render within the parent when fullscreen is false", () => {
    const { getByTestId } = render(<Loader fullscreen={false} />);

    expect(getByTestId("loader-wrapper")).toHaveStyle("position: absolute");
  });

  it("should not show delay text by default", () => {
    jest.useFakeTimers();

    const { getByTestId } = render(<Loader delayTextTimeout={1000} />);

    expect(getByTestId("loader-delay-text")).not.toBeVisible();

    jest.advanceTimersByTime(1500);

    expect(getByTestId("loader-delay-text")).not.toBeVisible();
  });

  it("should show delay text after the specified timeout", async () => {
    jest.useFakeTimers();

    const { getByTestId, getByText } = render(<Loader showDelayText delayTextTimeout={1000} />);

    expect(getByTestId("loader-delay-text")).not.toBeVisible();

    jest.advanceTimersByTime(1500);

    await waitFor(() => expect(getByTestId("loader-delay-text")).toBeVisible());

    expect(getByText(/This is taking longer than expected.../)).toBeInTheDocument();
  });
});
