import React from "react";
import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TroubleCodeChip from "./index";
import { LookupStatus, TroubleCodeLookupResponse } from "../../hooks/useTroubleCodeLookup";

const mockUseTroubleCodeLookup = jest.fn<TroubleCodeLookupResponse, [string]>();
jest.mock("../../hooks/useTroubleCodeLookup", () => ({
  ...jest.requireActual("../../hooks/useTroubleCodeLookup"),
  __esModule: true,
  default: (code: string) => mockUseTroubleCodeLookup(code),
}));

describe("Basic Functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render a chip embed for the trouble code if a description exists", () => {
    mockUseTroubleCodeLookup.mockReturnValue([
      LookupStatus.Success,
      { description: "test description of OBD code" },
    ]);

    const { getByTestId } = render(<TroubleCodeChip code="P0301" />);

    expect(getByTestId("trouble-code-chip")).toBeInTheDocument();
    expect(getByTestId("trouble-code-chip")).toHaveTextContent("P0301");
  });

  it("should render a tooltip with the description if a description exists", async () => {
    mockUseTroubleCodeLookup.mockReturnValue([
      LookupStatus.Success,
      { description: "Cylinder 1 Misfire Detected" },
    ]);

    const { getByTestId, findByRole } = render(<TroubleCodeChip code="P0301" />);

    await userEvent.hover(getByTestId("trouble-code-chip"));

    const tooltip = await findByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("Cylinder 1 Misfire Detected");

    await userEvent.unhover(getByTestId("trouble-code-chip"));

    await waitFor(() => {
      expect(tooltip).not.toBeInTheDocument();
    });
  });

  it("should render the plain code if no description exists", () => {
    mockUseTroubleCodeLookup.mockReturnValue([LookupStatus.Error, { description: null }]);

    const { getByText, queryByTestId } = render(<TroubleCodeChip code="P0999" />);

    expect(getByText("P0999")).toBeInTheDocument();
    expect(queryByTestId("trouble-code-chip")).not.toBeInTheDocument();
  });

  it("should render the plain code if the lookup fails", () => {
    mockUseTroubleCodeLookup.mockReturnValue([LookupStatus.Error, { description: null }]);

    const { getByText, queryByTestId } = render(<TroubleCodeChip code="XXXXX" />);

    expect(getByText("XXXXX")).toBeInTheDocument();
    expect(queryByTestId("trouble-code-chip")).not.toBeInTheDocument();
  });

  it("should render the plain code if the lookup is pending", () => {
    mockUseTroubleCodeLookup.mockReturnValue([LookupStatus.Loading, { description: null }]);

    const { getByText, queryByTestId } = render(<TroubleCodeChip code="XXXXX" />);

    expect(getByText("XXXXX")).toBeInTheDocument();
    expect(queryByTestId("trouble-code-chip")).not.toBeInTheDocument();
  });
});
