import { styled } from "@mui/material";
import { Link } from "react-router-dom";

/**
 * A base styled component for a Link
 *
 * @returns {JSX.Element}
 */
export const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});
