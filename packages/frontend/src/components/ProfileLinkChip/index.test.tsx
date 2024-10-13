import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import ProfileLinkChip from "./index";
import { LookupStatus, ProfileLookupResponse } from "../../hooks/useProfileLookup";

const mockUseProfileLookup = jest.fn<ProfileLookupResponse, [string]>();
jest.mock("../../hooks/useProfileLookup", () => ({
  ...jest.requireActual("../../hooks/useProfileLookup"),
  __esModule: true,
  default: (handle: string) => mockUseProfileLookup(handle),
}));

describe("Basic Functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render a chip embed for the username if the profile exists", () => {
    mockUseProfileLookup.mockReturnValue([
      { status: LookupStatus.Success, profile: { username: "test_user" } as Profile },
      jest.fn(),
      jest.fn(),
    ]);

    const { getByTestId } = render(<ProfileLinkChip uuid="test-uuid" />, {
      wrapper: Router,
    });

    expect(getByTestId("mention-chip")).toBeInTheDocument();
    expect(getByTestId("mention-chip")).toHaveTextContent("test_user");
    expect(getByTestId("mention-chip")).toHaveAttribute("href", "/profile/test-uuid");
    expect(getByTestId("mention-chip")).toHaveStyle("cursor: pointer;");
  });

  it("should open the profile page when the chip is clicked", async () => {
    mockUseProfileLookup.mockReturnValue([
      { status: LookupStatus.Success, profile: { username: "test_user" } as Profile },
      jest.fn(),
      jest.fn(),
    ]);

    const { getByTestId } = render(<ProfileLinkChip uuid="test-user-uuid" />, {
      wrapper: Router,
    });

    await userEvent.click(getByTestId("mention-chip"));

    expect(window.location.pathname).toBe("/profile/test-user-uuid");
  });

  it("should render the localized profile link if the lookup returns no profile", () => {
    mockUseProfileLookup.mockReturnValue([
      { status: LookupStatus.Success, profile: null },
      jest.fn(),
      jest.fn(),
    ]);

    const { getByText, queryByTestId } = render(<ProfileLinkChip uuid="test-nonexistent-uuid" />, {
      wrapper: Router,
    });

    expect(getByText("http://localhost/profile/test-nonexistent-uuid")).toBeInTheDocument();
    expect(queryByTestId("mention-chip")).not.toBeInTheDocument();
  });

  it("should render the localized profile link if the lookup fails", () => {
    mockUseProfileLookup.mockReturnValue([
      { status: LookupStatus.Error, profile: null },
      jest.fn(),
      jest.fn(),
    ]);

    const { getByText, queryByTestId } = render(<ProfileLinkChip uuid="test-user-handle" />, {
      wrapper: Router,
    });

    expect(getByText("http://localhost/profile/test-user-handle")).toBeInTheDocument();
    expect(queryByTestId("mention-chip")).not.toBeInTheDocument();
  });

  it("should render the localized profile link if the lookup is pending", () => {
    mockUseProfileLookup.mockReturnValue([
      { status: LookupStatus.Loading, profile: null },
      jest.fn(),
      jest.fn(),
    ]);

    const { getByText, queryByTestId } = render(<ProfileLinkChip uuid="test-user-handle" />, {
      wrapper: Router,
    });

    expect(getByText("http://localhost/profile/test-user-handle")).toBeInTheDocument();
    expect(queryByTestId("mention-chip")).not.toBeInTheDocument();
  });
});
