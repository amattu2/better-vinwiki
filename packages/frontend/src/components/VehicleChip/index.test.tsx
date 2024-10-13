import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import VehicleChip from "./index";

describe("Basic Functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render a chip embed for the vehicle VIN", () => {
    const { getByTestId } = render(<VehicleChip vin="1G1Y82D44L50079EX" />, { wrapper: Router });

    expect(getByTestId("vehicle-chip")).toBeInTheDocument();
    expect(getByTestId("vehicle-chip")).toHaveTextContent("1G1Y82D44L50079EX");
    expect(getByTestId("vehicle-chip")).toHaveAttribute("href", "/vehicle/1G1Y82D44L50079EX");
    expect(getByTestId("vehicle-chip")).toHaveStyle("cursor: pointer;");
  });

  it("should open the vehicle page when the chip is clicked", async () => {
    const { getByTestId } = render(<VehicleChip vin="1G1Y82D44L50079EX" />, { wrapper: Router });

    await userEvent.click(getByTestId("vehicle-chip"));

    expect(window.location.pathname).toBe("/vehicle/1G1Y82D44L50079EX");
  });
});
