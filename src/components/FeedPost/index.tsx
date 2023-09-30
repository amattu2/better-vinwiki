import React, { FC, Ref, forwardRef } from "react";
import ImagePost, { ImagePostSkeleton } from "./Cards/Image";
import VerticalImagePost, { VerticalImagePostSkeleton } from "./Cards/VerticalImage";
import TextPost, { TextPostSkeleton } from "./Cards/Text";
import ListAddPost, { ListAddPostSkeleton } from "./Cards/ListAdd";

/**
 * FeedPost Mapper
 *
 * Automatically selects the correct card to render based on the post type
 *
 * @returns {JSX.Element}
 */
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

/**
 * FeedPost Skeleton Mapper
 *
 * Automatically selects the correct card to render based on the post type.
 * Default is a random card.
 *
 * @returns {JSX.Element}
 */
export const PostSkeleton: FC<Partial<Pick<FeedPost, "type">>> = ({ type = null }) => {
  const imageSkeletons = [<ImagePostSkeleton />, <VerticalImagePostSkeleton />];
  const textSkeletons = [<TextPostSkeleton />, <ListAddPostSkeleton />];
  const skeletons = [...imageSkeletons, ...textSkeletons];

  switch (type) {
    case "photo":
      return imageSkeletons[Math.floor(Math.random() * imageSkeletons.length)];
    case "generic":
      return <TextPostSkeleton />;
    case "list_add":
      return <ListAddPostSkeleton />;
    default:
      return skeletons[Math.floor(Math.random() * skeletons.length)];
  }
};
