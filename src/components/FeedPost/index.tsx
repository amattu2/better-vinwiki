import React, { Ref, forwardRef } from "react";
import ImagePost from "./Image";
import VerticalImagePost from "./VerticalImage";
import TextPost from "./Text";

export default forwardRef((props: FeedPostProps, ref: Ref<HTMLDivElement>) => {
  switch (props.type) {
    case "photo":
      if (props.post_text?.length > 50) {
        return <VerticalImagePost {...props} ref={ref} />;
      }

      return <ImagePost {...props} ref={ref} />;
    case "generic":
    case "list_add":
      return <TextPost {...props} ref={ref} />;
    default:
      return null;
  }
});
