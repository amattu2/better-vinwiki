import React, { FC, useMemo } from 'react';
import { KeyboardArrowUp } from '@mui/icons-material';
import { Grow, Fab, styled, Box } from '@mui/material';
import useScrollDirection, { ScrollDirection } from '../../hooks/useScrollDirection';

const StyledFabBox = styled(Box)({
  position: "fixed",
  bottom: "16px",
  right: "16px",
});

export const ScrollToTop: FC = () => {
  const [direction, { offset, innerHeight }] = useScrollDirection();

  const isVisible: boolean = useMemo(() => (
    offset > innerHeight && direction === ScrollDirection.Up
  ), [offset, direction]);

  const onClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Grow in={isVisible}>
      <StyledFabBox>
        <Fab color="primary" onClick={onClick}>
          <KeyboardArrowUp />
        </Fab>
      </StyledFabBox>
    </Grow>
  );
};

export default ScrollToTop;
