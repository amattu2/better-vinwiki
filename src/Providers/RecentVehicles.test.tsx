import React from "react";
import { render, screen } from "@testing-library/react";
import { RecentVehiclesProvider, useRecentVehicles } from "./RecentVehicles";
import { AuthProvider } from "./AuthProvider";

describe("RecentVehiclesProvider General Tests", () => {
  test("should render without crashing", () => {
    render(
      <AuthProvider>
        <RecentVehiclesProvider />
      </AuthProvider>,
    );
  });

  test("should render children", () => {
    render(
      <AuthProvider>
        <RecentVehiclesProvider>
          <div>Test</div>
        </RecentVehiclesProvider>
      </AuthProvider>,
    );

    const test = screen.getByText(/test/i);
    expect(test).toBeInTheDocument();
  });

  test("should throw error if useRecentVehicles is used outside of RecentVehiclesProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<div>{JSON.stringify(useRecentVehicles())}</div>);
    }).toThrowError();

    spy.mockRestore();
  });
});
