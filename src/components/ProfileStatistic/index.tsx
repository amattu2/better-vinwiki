import React, { FC } from "react";
import { Box, Typography, styled } from "@mui/material";
import numeral from "numeral";

export type StatisticItemProps = {
  name: string,
  value: number | string,
  onClick?: () => void
};

const StyledBox = styled(Box)(({ theme, onClick }) => ({
  backgroundColor: "#3b3b3b",
  borderRadius: "16px",
  cursor: onClick ? "pointer" : "initial",
  padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
  flex: 1,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    boxShadow: onClick ? theme.shadows[8] : null,
  },
}));

const StyledValue = styled(Typography)(({ theme }) => ({
  lineHeight: "3rem",
  color: "#fff",
  padding: theme.spacing(0.5),
  fontWeight: "bold",
}));

const StyledName = styled(Typography)(({ theme }) => ({
  color: "#fff",
  padding: theme.spacing(0.5),
  textTransform: "uppercase",
  fontSize: 14,
}));

/**
 * A statistic item for the profile page
 *
 * @param {StatisticItemProps} props
 * @returns {JSX.Element}
 */
export const StatisticItem: FC<StatisticItemProps> = ({ name, value, onClick }: StatisticItemProps) => (
  <StyledBox onClick={onClick}>
    <StyledValue variant="h3">{typeof value === "number" ? numeral(value).format("0a") : value}</StyledValue>
    <StyledName>{name}</StyledName>
  </StyledBox>
);

export default StatisticItem;
