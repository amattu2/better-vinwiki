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
   * Post is on the individual post page
   *
   * Disables:
   * - Comments
   * - Click to Open
   */
  isIndividual?: true;

  /**
   * Post is embedded on the vehicle page
   *
   * Disables:
   * - Add to List (Redundant)
   */
  isVehiclePage?: true;

  /**
   * Adds a ref to the post container.
   */
  ref?: React.LegacyRef<HTMLDivElement>;
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
