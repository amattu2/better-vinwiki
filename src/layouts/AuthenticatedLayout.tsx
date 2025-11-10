import React, { FC } from "react";
import { styled, Box, Stack } from "@mui/material";
import { Outlet } from "react-router-dom";
import AutoScroll from "../components/ScrollToTop/AutoScroll";
import Sidebar from "../components/Sidebar";

const StyledOutletContainer = styled(Box)({
  flexGrow: 1,
  marginLeft: "72px",
  "@media print": {
    marginLeft: "unset",
  },
});

/**
 * The layout for a Authenticated user
 *
 * @returns {JSX.Element}
 */
export const AuthenticatedLayout: FC = () => (
  <>
    <AutoScroll />
    <Stack direction="row">
      <Sidebar />
      <StyledOutletContainer>
        <Outlet />
      </StyledOutletContainer>
    </Stack>
  </>
);
