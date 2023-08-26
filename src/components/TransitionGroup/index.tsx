import React from "react";
import { TransitionGroup } from "react-transition-group";
import { Collapse } from "@mui/material";

type Base = {
  key: string;
};

type Props<T extends Base> = {
  items: T[];
  render: (item: T) => React.ReactNode;
};

const GenericTransitionGroup = <T extends Base>({
  items,
  render,
}: Props<T>) => {
  return (
    <TransitionGroup>
      {items.map((item: T) => (
        <Collapse key={item.key}>
          {render(item)}
        </Collapse>
      ))}
    </TransitionGroup>
  );
};

export default GenericTransitionGroup;
