import { styled } from "@mui/material";
import React from "react";
import { TransitionGroup, CSSTransition } from "react-transition-group";

type Base = {
  key: string;
  ref: React.RefObject<HTMLElement>;
};

type Props<T extends Base> = {
  items: T[];
  render: (item: T) => React.ReactNode;
};

const StyledTransition = styled(CSSTransition)`
  transition: opacity 0.3s;

  // enter from
  &.fade-enter {
    opacity: 0;
  }

  // enter to
  &.fade-enter-active {
    opacity: 1;
  }

  // exit from
  &.fade-exit {
    opacity: 1;
  }

  // exit to
  &.fade-exit-active {
    opacity: 0;
  }
`;

const GenericTransitionGroup = <T extends Base>({
  items,
  render,
}: Props<T>) => {
  return (
    <TransitionGroup>
      {items.map((item: T) => (
        <StyledTransition
          key={item.key}
          nodeRef={item.ref}
          timeout={500}
          classNames="fade"
        >
          {render(item)}
        </StyledTransition>
      ))}
    </TransitionGroup>
  );
};

export default GenericTransitionGroup;
