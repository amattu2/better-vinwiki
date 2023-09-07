import { useState, useEffect } from "react";

export enum ScrollDirection {
  Up = "up",
  Down = "down",
}

/**
 * A hook that returns the scroll direction of the page.
 *
 * @returns [ScrollDirection, { offset: number, innerHeight: number }]
 */
const useScrollDirection = (): [ScrollDirection, { offset: number, innerHeight: number }] => {
  const [lastScrollTop, setLastScrollTop] = useState<number>(0);
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(ScrollDirection.Down);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > lastScrollTop) {
        setScrollDirection(ScrollDirection.Down);
      } else {
        setScrollDirection(ScrollDirection.Up);
      }

      setLastScrollTop(scrollTop);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollTop]);

  return [scrollDirection, { offset: lastScrollTop, innerHeight: window.innerHeight }];
};

export default useScrollDirection;
