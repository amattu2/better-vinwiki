import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import MentionChip from "./index";
import { LookupStatus, UUIDLookupResponse } from "../../hooks/useUUIDLookup";

const mockUseUUIDLookup = jest.fn<UUIDLookupResponse, [string]>();
jest.mock("../../hooks/useUUIDLookup", () => ({
  ...jest.requireActual("../../hooks/useUUIDLookup"),
  __esModule: true,
  default: (handle: string) => mockUseUUIDLookup(handle),
}));

describe("Basic Functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render a chip embed for the profile if it exists", () => {
    mockUseUUIDLookup.mockReturnValue([LookupStatus.Success, { uuid: "test-user-uuid" }]);

    const { getByTestId } = render(<MentionChip handle="test-user-handle" />, { wrapper: Router });

    expect(getByTestId("mention-chip")).toBeInTheDocument();
    expect(getByTestId("mention-chip")).toHaveTextContent("test-user-handle");
    expect(getByTestId("mention-chip")).toHaveAttribute("href", "/profile/test-user-uuid");
    expect(getByTestId("mention-chip")).toHaveStyle("cursor: pointer;");
  });

  it("should open the profile page when the chip is clicked", async () => {
    mockUseUUIDLookup.mockReturnValue([LookupStatus.Success, { uuid: "test-user-uuid" }]);

    const { getByTestId } = render(<MentionChip handle="test-user-handle" />, { wrapper: Router });

    await userEvent.click(getByTestId("mention-chip"));

    expect(window.location.pathname).toBe("/profile/test-user-uuid");
  });

  it("should render the original handle if the lookup returns no uuid", () => {
    mockUseUUIDLookup.mockReturnValue([LookupStatus.Success, { uuid: null }]);

    const { getByText, queryByTestId } = render(<MentionChip handle="test-user-handle" />, {
      wrapper: Router,
    });

    expect(getByText("@test-user-handle")).toBeInTheDocument();
    expect(queryByTestId("mention-chip")).not.toBeInTheDocument();
  });

  it("should render a link to the list page if the list lookup fails", () => {
    mockUseUUIDLookup.mockReturnValue([LookupStatus.Error, { uuid: null }]);

    const { getByText, queryByTestId } = render(<MentionChip handle="test-user-handle" />, {
      wrapper: Router,
    });

    expect(getByText("@test-user-handle")).toBeInTheDocument();
    expect(queryByTestId("mention-chip")).not.toBeInTheDocument();
  });

  it("should render a link to the list page if the list lookup is pending", () => {
    mockUseUUIDLookup.mockReturnValue([LookupStatus.Loading, { uuid: null }]);

    const { getByText, queryByTestId } = render(<MentionChip handle="test-user-handle" />, {
      wrapper: Router,
    });

    expect(getByText("@test-user-handle")).toBeInTheDocument();
    expect(queryByTestId("mention-chip")).not.toBeInTheDocument();
  });
});
