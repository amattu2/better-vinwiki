type FeedPostProps = FeedPost & {
  /**
   * Designates if the post is a preview.
   *
   * Disables:
   * - Click to Open
   * - Comments
   * - Options Ellipsis
   */
  isPreview?: true;

  /**
   * Hides the comments section.
   */
  omitComments?: true;

  /**
   * Adds a ref to the post container.
   */
  ref?: Ref<HTMLDivElement>;
};

type Country = {
  name: string;
  code: string;
};

type Territory = {
  [countryCode: string]: {
    code: string;
    name: string;
  }[];
};
