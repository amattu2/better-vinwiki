import * as utils from "./feed";

const baseFeedPost: FeedPost = {
  client: "",
  comment_count: 0,
  dest_url: "",
  event_date: "",
  event_time: "",
  id: "",
  image: null as unknown as FeedPostImage,
  locale: "",
  person: null as unknown as Profile,
  post_date: "",
  post_date_ago: "",
  post_text: "",
  post_time: "",
  subject_uuid: "",
  type: "generic",
  uuid: "",
  vehicle: null as unknown as Vehicle,
};

describe("mapPostsToDate", () => {
  it("should group posts by date", () => {
    const posts: FeedPost[] = [
      { ...baseFeedPost, post_date: "2024-06-19T13:21:00-04:00" },
      { ...baseFeedPost, post_date: "2024-06-19T10:10:00-04:00" },
      { ...baseFeedPost, post_date: "2024-06-10T13:21:00-04:00" },
    ];

    const result = utils.mapPostsToDate(posts);

    expect(Object.keys(result)).toEqual(["2024-06-19", "2024-06-10"]);
    expect(result["2024-06-19"].length).toBe(2);
    expect(result["2024-06-19"]).toEqual([posts[0], posts[1]]);
    expect(result["2024-06-10"].length).toBe(1);
    expect(result["2024-06-10"]).toEqual([posts[2]]);
  });

  it("should sort post groups by the post time in descending order", () => {
    const posts: FeedPost[] = [
      { ...baseFeedPost, post_date: "2024-06-20T15:04:00-04:00" },
      { ...baseFeedPost, post_date: "2024-06-20T10:02:00-04:00" },
      { ...baseFeedPost, post_date: "2024-06-20T13:03:00-04:00" },
      { ...baseFeedPost, post_date: "2024-06-20T07:01:00-04:00" },
    ];

    const result = utils.mapPostsToDate(posts);

    expect(result["2024-06-20"]).toEqual([posts[0], posts[2], posts[1], posts[3]]);
  });

  it("should handle an empty array of posts", () => {
    expect(utils.mapPostsToDate([])).toEqual({});
  });

  it("should handle invalid input without throwing an error", () => {
    expect(() => utils.mapPostsToDate([{} as FeedPost])).not.toThrow();
    expect(() => utils.mapPostsToDate([null as unknown as FeedPost])).not.toThrow();
    expect(() => utils.mapPostsToDate(0 as unknown as FeedPost[])).not.toThrow();
    expect(() => utils.mapPostsToDate("" as unknown as FeedPost[])).not.toThrow();
  });
});

describe("remapFeedPost", () => {
  it.each<FeedPost>([
    { ...baseFeedPost, type: "photo" },
    { ...baseFeedPost, type: "list_add" },
    { ...baseFeedPost, type: "generic" },
  ])("should not modify the valid post type of $type", (post) => {
    expect(utils.remapFeedPost({ post })).toBe(post);
  });

  it("should override a 'generic' post type from Android with an image to 'photo'", () => {
    const post: FeedPost = {
      ...baseFeedPost,
      client: "android",
      type: "generic",
      image: { id: "123", large: "", poster: "", thumb: "", uuid: "456" },
    };

    expect(utils.remapFeedPost({ post })).toHaveProperty("type", "photo");
  });

  it("should override an unknown post type with an image to 'photo'", () => {
    const post: FeedPost = {
      ...baseFeedPost,
      type: "unknown-type-here" as "generic",
      image: { id: "123", large: "", poster: "", thumb: "", uuid: "456" },
    };

    expect(utils.remapFeedPost({ post })).toHaveProperty("type", "photo");
  });

  it("should override an unknown post type without an image to 'generic'", () => {
    const post: FeedPost = {
      ...baseFeedPost,
      type: "unknown-type-here" as "generic",
      post_text: "Some text here",
    };

    expect(utils.remapFeedPost({ post })).toHaveProperty("type", "generic");
  });
});

// NOTE: This is a partial test suite as the `isValidEventDate` function
// is tested more thoroughly elsewhere.
describe("showEventDate", () => {
  it("should return true if the event date is different from the post date", () => {
    const post: FeedPost = {
      ...baseFeedPost,
      event_date: "2024-06-13T10:19:00-04:00",
      post_date: "2024-06-20T13:21:00-04:00",
    };

    expect(utils.showEventDate(post)).toBe(true);
  });

  it("should return false if the event date is the same as the post date", () => {
    const post: FeedPost = {
      ...baseFeedPost,
      event_date: "2024-06-20T13:21:00-04:00",
      post_date: "2024-06-20T13:21:00-04:00",
    };

    expect(utils.showEventDate(post)).toBe(false);
  });
});
