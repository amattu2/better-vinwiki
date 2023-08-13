import React from "react";
import { render, screen } from "@testing-library/react";
import { NotificationProvider, useNotificationProvider } from "./NotificationProvider";
import { AuthProvider } from "./AuthProvider";

describe("NotificationProvider General Tests", () => {
  test("should render without crashing", () => {
    render(
      <AuthProvider>
        <NotificationProvider />
      </AuthProvider>
    );
  });

  test("should render children", () => {
    render(
      <AuthProvider>
        <NotificationProvider>
          <div>Test</div>
        </NotificationProvider>
      </AuthProvider>
    );

    const test = screen.getByText(/test/i);
    expect(test).toBeInTheDocument();
  });

  test("should throw error if useNotificationProvider is used outside of NotificationProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<div>{JSON.stringify(useNotificationProvider())}</div>);
    }).toThrowError();

    spy.mockRestore();
  });
});
