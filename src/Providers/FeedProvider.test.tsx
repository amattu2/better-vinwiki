import React from "react";
import { render, screen } from "@testing-library/react";
import { FeedProvider, useFeedProvider } from "./FeedProvider";
import { AuthProvider } from "./AuthProvider";

describe("FeedProvider General Tests", () => {
  test("should render without crashing", () => {
    render(
      <AuthProvider>
        <FeedProvider filtered limit={25} />
      </AuthProvider>
    );
  });

  test("should render children", () => {
    render(
      <AuthProvider>
        <FeedProvider filtered limit={25}>
          <div>Test</div>
        </FeedProvider>
      </AuthProvider>
    );

    const test = screen.getByText(/test/i);
    expect(test).toBeInTheDocument();
  });

  test("should throw error if useFeedProvider is used outside of FeedProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<div>{JSON.stringify(useFeedProvider())}</div>);
    }).toThrowError();

    spy.mockRestore();
  });
});
