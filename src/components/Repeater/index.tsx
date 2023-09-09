import React from "react";

type Props = {
  count: number;
  Component: React.FC;
};

/**
 * A general component for repeating a component a given number of times
 *
 * @param {Props} { count, Component }
 * @returns {JSX.Element}
 */
const Repeater: React.FC<Props> = ({ count, Component }: Props) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <Component key={i} />
    ))}
  </>
);

export default Repeater;
