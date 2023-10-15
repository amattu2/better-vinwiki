import React, { FC } from 'react';
import { Box, CircularProgress, Theme, styled } from '@mui/material';

const StyledBox = styled(Box, {
  shouldForwardProp: (p) => p !== "fullscreen",
})(({
  fullscreen, theme,
} : { fullscreen: boolean; theme?: Theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: !fullscreen ? 'absolute' : 'fixed',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  background: theme?.palette.background.default || "#fff",
}));

const Loader : FC<{ fullscreen?: boolean }> = ({ fullscreen = true }) => (
  <StyledBox fullscreen={fullscreen}>
    <CircularProgress />
  </StyledBox>
);

export default Loader;
