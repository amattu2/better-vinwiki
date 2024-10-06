import React, { FC } from "react";
import { Box, Stack } from "@mui/material";
import { Outlet } from "react-router-dom";
import AutoScroll from "../components/ScrollToTop/AutoScroll";
import Sidebar from "../components/Sidebar";

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
      <Box sx={{ flexGrow: 1, ml: "72px" }}>
        <Outlet />
      </Box>
    </Stack>
  </>
);
