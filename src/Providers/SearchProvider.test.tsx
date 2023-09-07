import React from "react";
import { render, screen } from "@testing-library/react";
import { SearchProvider, useSearchProvider } from "./SearchProvider";
import { AuthProvider } from "./AuthProvider";

describe("SearchProvider General Tests", () => {
  test("should render without crashing", () => {
    render(
      <AuthProvider>
        <SearchProvider type="all" />
      </AuthProvider>,
    );
  });

  test("should render children", () => {
    render(
      <AuthProvider>
        <SearchProvider type="all">
          <div>Test</div>
        </SearchProvider>
      </AuthProvider>,
    );

    const test = screen.getByText(/test/i);
    expect(test).toBeInTheDocument();
  });

  test("should throw error if useSearchProvider is used outside of SearchProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<div>{JSON.stringify(useSearchProvider())}</div>);
    }).toThrowError();

    spy.mockRestore();
  });
});
