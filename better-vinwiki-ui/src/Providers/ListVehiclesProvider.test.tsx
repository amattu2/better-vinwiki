import React from "react";
import { render, screen } from "@testing-library/react";
import { ListVehiclesProvider, useListVehiclesProvider } from "./ListVehiclesProvider";
import { AuthProvider } from "./AuthProvider";

describe("ListProvider General Tests", () => {
  test("should render without crashing", () => {
    render(
      <AuthProvider>
        <ListVehiclesProvider uuid="AABB-FAKE-LIST-Id" />
      </AuthProvider>
    );
  });

  test("should render children", () => {
    render(
      <AuthProvider>
        <ListVehiclesProvider uuid="">
          <div>Test</div>
        </ListVehiclesProvider>
      </AuthProvider>
    );

    const test = screen.getByText(/test/i);
    expect(test).toBeInTheDocument();
  });

  test("should throw error if useListProvider is used outside of ListProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<div>{JSON.stringify(useListVehiclesProvider())}</div>);
    }).toThrowError();

    spy.mockRestore();
  });
});
