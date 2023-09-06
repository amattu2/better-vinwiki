import React from "react";
import { TransitionGroup } from "react-transition-group";
import { Collapse } from "@mui/material";

type Base = {
  key: string;
};

type Props<T extends Base> = {
  items: T[];
  render: (item: T, index: number, last: boolean) => React.ReactNode;
};

const GenericTransitionGroup = <T extends Base>({
  items,
  render,
}: Props<T>) => {
  return (
    <TransitionGroup>
      {items.map((item: T, index: number) => (
        <Collapse key={item.key}>
          {render(item, index, index === items.length - 1)}
        </Collapse>
      ))}
    </TransitionGroup>
  );
};

export default GenericTransitionGroup;
