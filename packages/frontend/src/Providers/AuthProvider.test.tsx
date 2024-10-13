import React from "react";
import { render, screen } from "@testing-library/react";
import { AuthProvider, useAuthProvider } from "./AuthProvider";

describe("AuthProvider General Tests", () => {
  test("should render without crashing", () => {
    render(<AuthProvider />);
  });

  test("should render children", () => {
    render(
      <AuthProvider>
        <div>Test</div>
      </AuthProvider>
    );

    const test = screen.getByText(/test/i);
    expect(test).toBeInTheDocument();
  });

  test("should throw error if useAuthProvider is used outside of AuthProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<div>{JSON.stringify(useAuthProvider())}</div>);
    }).toThrowError();

    spy.mockRestore();
  });
});
