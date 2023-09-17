import React, { Ref, forwardRef } from "react";
import ImagePost from "./Image";
import VerticalImagePost from "./VerticalImage";
import TextPost from "./Text";
import ListAddPost from "./ListAdd";

export default forwardRef((props: FeedPostProps, ref: Ref<HTMLDivElement>) => {
  switch (props.type) {
    case "photo":
      if (props.post_text?.length > 50) {
        return <VerticalImagePost {...props} ref={ref} />;
      }

      return <ImagePost {...props} ref={ref} />;
    case "generic":
      return <TextPost {...props} ref={ref} />;
    case "list_add":
      return <ListAddPost {...props} ref={ref} />;
    default:
      return null;
  }
});
