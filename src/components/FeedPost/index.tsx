import React, { FC } from "react";
import ImagePost from "./Image";
import TextPost from "./Text";

export const PostRouter: FC<FeedPost> = (post: FeedPost) => {
  switch (post.type) {
    case "photo":
      return React.createElement(ImagePost, post);
    case "generic":
      return React.createElement(TextPost, post);
    default:
      return null;
  }
};
