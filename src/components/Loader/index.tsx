import React, { FC } from 'react';
import { Box, CircularProgress, styled } from '@mui/material';

type Props = {
  fullscreen?: boolean;
};

const StyledBox = styled(Box, { shouldForwardProp: (p) => p !== "fullscreen" })(({ fullscreen } : Props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: !fullscreen ? 'absolute' : 'fixed',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  background: "#fff",
}));

const Loader : FC<Props> = ({ fullscreen = true } : Props) => (
  <StyledBox fullscreen={fullscreen}>
    <CircularProgress />
  </StyledBox>
);

export default Loader;
