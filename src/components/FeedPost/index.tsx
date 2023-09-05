import React, { FC } from "react";
import ImagePost from "./Image";
import VerticalImagePost from "./VerticalImage";
import TextPost from "./Text";

export const PostRouter: FC<FeedPost> = (post: FeedPost) => {
  switch (post.type) {
    case "photo":
      if (post.post_text?.length > 50) {
        return React.createElement(VerticalImagePost, post);
      }

      return React.createElement(ImagePost, post);
    case "generic":
    case "list_add":
      return React.createElement(TextPost, post);
    default:
      return null;
  }
};
