import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Chip, styled } from "@mui/material";
import { DirectionsCar } from "@mui/icons-material";

type Props = {
  vin: string;
};

const StyledIcon = styled(DirectionsCar)({
  fontSize: "16px !important",
});

/**
 * A `#VIN` chip that links to a vehicle's page.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const VehicleChip: FC<Props> = ({ vin }: Props) => (
  <Chip
    component={Link}
    icon={<StyledIcon />}
    label={vin}
    to={`/vehicle/${vin}`}
    size="small"
    data-testid="vehicle-chip"
  />
);

export default VehicleChip;
