/**
 * A map of localstorage or sessionstorage cache keys
 */
export const CacheKeys: { [name: string]: Readonly<string> } = {
  AUTH_PROFILE: "profile",
  AUTH_TOKEN: "token",
  IS_FOLLOWING: "isFollowingCache",
  UUID_LOOKUP: "uuidLookupCache",
  LIST_LOOKUP: "listLookupCache",
  PROFILE_LISTS: "profileListsCache",
  PROFILE_FOLLOWERS: "profileFollowersCache",
  FEED: "feedCache",
  FEED_TYPE: "feedTypeCache",
  FEED_POST_TYPE: "feedPostTypeCache",
};
