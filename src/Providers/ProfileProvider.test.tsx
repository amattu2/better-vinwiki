import React from "react";
import { render, screen } from "@testing-library/react";
import { ProfileProvider, useProfileProvider } from "./ProfileProvider";
import { AuthProvider } from "./AuthProvider";

describe("ProfileProvider General Tests", () => {
  test("should render without crashing", () => {
    render(
      <AuthProvider>
        <ProfileProvider uuid="ABC" />
      </AuthProvider>
    );
  });

  test("should render children", () => {
    render(
      <AuthProvider>
        <ProfileProvider uuid="123-UUID-Does-Not-Exist">
          <div>Test</div>
        </ProfileProvider>
      </AuthProvider>
    );

    const test = screen.getByText(/test/i);
    expect(test).toBeInTheDocument();
  });

  test("should throw error if useProfileProvider is used outside of ProfileProvider", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<div>{JSON.stringify(useProfileProvider())}</div>);
    }).toThrowError();

    spy.mockRestore();
  });
});
