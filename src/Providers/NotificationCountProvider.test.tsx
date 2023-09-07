import React from "react";
import { render, screen } from "@testing-library/react";
import { NotificationCountProvider, useNotificationCountProvider } from "./NotificationCountProvider";
import { AuthProvider } from "./AuthProvider";

describe("NotificationCountProvider General Tests", () => {
  test("should render without crashing", () => {
    render(
      <AuthProvider>
        <NotificationCountProvider />
      </AuthProvider>,
    );
  });

  test("should render children", () => {
    render(
      <AuthProvider>
        <NotificationCountProvider>
          <div>Test</div>
        </NotificationCountProvider>
      </AuthProvider>,
    );

    const test = screen.getByText(/test/i);
    expect(test).toBeInTheDocument();
  });

  test("should throw error if useNotificationCountProvider is used outside of NotificationCountProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<div>{JSON.stringify(useNotificationCountProvider())}</div>);
    }).toThrowError();

    spy.mockRestore();
  });
});
