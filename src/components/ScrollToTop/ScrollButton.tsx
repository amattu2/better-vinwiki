import React, { FC, useMemo } from "react";
import { KeyboardArrowUp } from "@mui/icons-material";
import { Grow, Fab, styled, Box } from "@mui/material";
import useScrollDirection, { ScrollDirection } from "../../hooks/useScrollDirection";

type Props = {
  topGap?: boolean;
};

const StyledFabBox = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: "16px",
  right: "16px",
  zIndex: theme.zIndex.fab,
}));

export const ScrollToTop: FC<Props> = ({ topGap = true }: Props) => {
  const [direction, { offset, innerHeight }] = useScrollDirection();

  const isVisible: boolean = useMemo(
    () => (!topGap ? offset > 0 : offset > innerHeight) && direction === ScrollDirection.Up,
    [offset, direction]
  );

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
