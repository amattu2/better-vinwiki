import { isValidEventDate } from "./date";

/**
 * Builds out a map of Posts by Date and sorts them by within the date
 *
 * @param {FeedPost[]} posts
 * @returns {[date: string] : FeedPost[]} Sorted posts mapped into the YYYY-MM-DD date string
 */
export const mapPostsToDate = (posts: FeedPost[]): { [date: string] : FeedPost[] } => {
  const results: { [date: string] : FeedPost[] } = {};

  [...posts].forEach((post: FeedPost) => {
    const date = new Date(post.post_date).toISOString().split("T")[0];
    if (!results[date]) {
      results[date] = [];
    }
    results[date].push(post);
  });

  Object.keys(results).forEach((date: string) => {
    results[date].sort((a, b) => (new Date(b.post_date)).getTime() - (new Date(a.post_date)).getTime());
  });

  return results;
};

/**
 * Ingests a FeedPost from the API and remaps the properties
 * to be more consistent with usage across the app.
 *
 * Note:
 * - This is to support legacy Android clients that use the `generic` type for images
 *
 * @param {{ post: FeedPost }} post input from feed API
 * @param {FeedPost} post a remapped copy of the input
 */
export const remapFeedPost = ({ post }: { post: FeedPost }): FeedPost => {
  if (post.client === "android" && post.type === "generic" && post.image?.id) {
    return { ...post, type: "photo" };
  }

  return post;
};

/**
 * Determines if a `event_date` should be displayed to the user
 * Wrapper for `isValidEventDate` to catch any exceptions
 *
 * @param {FeedPost} post
 * @returns boolean true if the event date should be displayed
 */
export const showEventDate = ({ event_date, post_date }: FeedPost): boolean => {
  try {
    return isValidEventDate(event_date, post_date);
  } catch (e) {
    return false;
  }
};
