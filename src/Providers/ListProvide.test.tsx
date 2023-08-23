import React from "react";
import { render, screen } from "@testing-library/react";
import { ListProvider, useListProvider } from "./ListProvider";
import { AuthProvider } from "./AuthProvider";

describe("ListProvider General Tests", () => {
  test("should render without crashing", () => {
    render(
      <AuthProvider>
        <ListProvider uuid="AABB-FAKE-LIST-Id" />
      </AuthProvider>
    );
  });

  test("should render children", () => {
    render(
      <AuthProvider>
        <ListProvider uuid="">
          <div>Test</div>
        </ListProvider>
      </AuthProvider>
    );

    const test = screen.getByText(/test/i);
    expect(test).toBeInTheDocument();
  });

  test("should throw error if useListProvider is used outside of ListProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<div>{JSON.stringify(useListProvider())}</div>);
    }).toThrowError();

    spy.mockRestore();
  });
});
