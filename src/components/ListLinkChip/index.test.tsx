import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import ListLinkChip from "./index";
import { LookupStatus, ListLookupResponse } from "../../hooks/useListLookup";

const mockUseListLookup = jest.fn<ListLookupResponse, [string]>();
jest.mock("../../hooks/useListLookup", () => ({
  ...jest.requireActual("../../hooks/useListLookup"),
  __esModule: true,
  default: (uuid: string) => mockUseListLookup(uuid),
}));

describe("Basic Functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render a chip embed for the list if it exists", () => {
    mockUseListLookup.mockReturnValue([
      {
        status: LookupStatus.Success,
        list: { uuid: "test-uuid", name: "Test List" } as List,
      },
      jest.fn(),
      jest.fn(),
    ]);

    const { getByTestId } = render(
      <Router>
        <ListLinkChip uuid="test-uuid" />
      </Router>
    );

    expect(getByTestId("list-chip")).toBeInTheDocument();
    expect(getByTestId("list-chip")).toHaveTextContent("Test List");
    expect(getByTestId("list-chip")).toHaveAttribute("href", "/list/test-uuid");
    expect(getByTestId("list-chip")).toHaveStyle("cursor: pointer;");
  });

  it("should render a link to the list page if the list does not have a name", () => {
    mockUseListLookup.mockReturnValue([
      {
        status: LookupStatus.Success,
        list: { uuid: "test-uuid" } as List,
      },
      jest.fn(),
      jest.fn(),
    ]);

    const { getByText, queryByTestId } = render(
      <Router>
        <ListLinkChip uuid="test-uuid" />
      </Router>
    );

    expect(getByText(`${window.origin}/list/test-uuid`)).toBeInTheDocument();
    expect(queryByTestId("list-chip")).not.toBeInTheDocument();
  });

  it("should render a link to the list page if the list does not exist", () => {
    mockUseListLookup.mockReturnValue([
      {
        status: LookupStatus.Success,
        list: null,
      },
      jest.fn(),
      jest.fn(),
    ]);

    const { getByText, queryByTestId } = render(
      <Router>
        <ListLinkChip uuid="test-uuid" />
      </Router>
    );

    expect(getByText(`${window.origin}/list/test-uuid`)).toBeInTheDocument();
    expect(queryByTestId("list-chip")).not.toBeInTheDocument();
  });

  it("should render a link to the list page if the list lookup fails", () => {
    mockUseListLookup.mockReturnValue([
      {
        status: LookupStatus.Error,
        list: null,
      },
      jest.fn(),
      jest.fn(),
    ]);

    const { getByText, queryByTestId } = render(
      <Router>
        <ListLinkChip uuid="test-uuid" />
      </Router>
    );

    expect(getByText(`${window.origin}/list/test-uuid`)).toBeInTheDocument();
    expect(queryByTestId("list-chip")).not.toBeInTheDocument();
  });

  it("should render a link to the list page if the list lookup is pending", () => {
    mockUseListLookup.mockReturnValue([
      {
        status: LookupStatus.Loading,
        list: null,
      },
      jest.fn(),
      jest.fn(),
    ]);

    const { getByText, queryByTestId } = render(
      <Router>
        <ListLinkChip uuid="test-uuid" />
      </Router>
    );

    expect(getByText(`${window.origin}/list/test-uuid`)).toBeInTheDocument();
    expect(queryByTestId("list-chip")).not.toBeInTheDocument();
  });
});
