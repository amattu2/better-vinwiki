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
