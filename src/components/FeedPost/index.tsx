import React, { FC } from "react";
import ImagePost from "./Image";
import VerticalImagePost from "./VerticalImage";
import TextPost from "./Text";

export const PostRouter: FC<FeedPostProps> = (props: FeedPostProps) => {
  switch (props.type) {
    case "photo":
      if (props.post_text?.length > 50) {
        return React.createElement(VerticalImagePost, props);
      }

      return React.createElement(ImagePost, props);
    case "generic":
    case "list_add":
      return React.createElement(TextPost, props);
    default:
      return null;
  }
};
