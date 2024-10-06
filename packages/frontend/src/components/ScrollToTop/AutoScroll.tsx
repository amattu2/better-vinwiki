import { FC, useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * A component that scrolls to the top of the page when the route changes.
 *
 * @returns {null}
 */
const AutoScroll: FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default AutoScroll;
