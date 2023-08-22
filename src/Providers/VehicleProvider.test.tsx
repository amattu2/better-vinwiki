import React from "react";
import { render, screen } from "@testing-library/react";
import { VehicleProvider, useVehicleProvider } from "./VehicleProvider";
import { AuthProvider } from "./AuthProvider";

describe("VehicleProvider General Tests", () => {
  test("should render without crashing", () => {
    render(
      <AuthProvider>
        <VehicleProvider vin="4JGFB4FB8RB047108" />
      </AuthProvider>
    );
  });

  test("should render children", () => {
    render(
      <AuthProvider>
        <VehicleProvider vin="4JGFB4FB8RB047108">
          <div>Test</div>
        </VehicleProvider>
      </AuthProvider>
    );

    const test = screen.getByText(/test/i);
    expect(test).toBeInTheDocument();
  });

  test("should throw error if useVehicleProvider is used outside of VehicleProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<div>{JSON.stringify(useVehicleProvider())}</div>);
    }).toThrowError();

    spy.mockRestore();
  });
});
