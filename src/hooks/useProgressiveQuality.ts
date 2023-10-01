import { useEffect, useState } from "react";

/**
 * A hook to return progressive loading image source
 *
 * @param initial initial low resolution image
 * @param highRes target high resolution image
 */
const useProgressiveQuality = (initial: string, highRes: string): [string, { blur: boolean }] => {
  const [src, setSrc] = useState(initial);

  useEffect(() => {
    if (initial === highRes) {
      return;
    }

    setSrc(initial);

    const img = new Image();
    img.src = highRes;
    img.onload = () => setSrc(highRes);
  }, [initial, highRes]);

  return [src, { blur: src === initial && highRes !== initial }];
};

export default useProgressiveQuality;
