import React, { FC } from 'react';
import { Box, CircularProgress, styled } from '@mui/material';

const StyledBox = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'fixed',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  background: "#fff",
});

const Loader : FC = () => (
  <StyledBox>
    <CircularProgress />
  </StyledBox>
);

export default Loader;
