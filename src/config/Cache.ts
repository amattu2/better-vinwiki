/**
 * A map of localstorage or sessionstorage cache keys
 */
export const CacheKeys: { [name: string]: Readonly<string> } = {
  AUTH_PROFILE: "profile",
  AUTH_TOKEN: "token",
  IS_FOLLOWING_PROFILE: "isFollowingProfileCache",
  IS_FOLLOWING_VEHICLE: "isFollowingVehicleCache",
  IS_FOLLOWING_LIST: "isFollowingListCache",
  UUID_LOOKUP: "uuidLookupCache",
  LIST_LOOKUP: "listCache",
  LIST_FOLLOWERS: "listFollowersCache",
  PROFILE: "profileCache",
  PROFILE_LISTS: "profileListsCache",
  PROFILE_FOLLOWERS: "profileFollowersCache",
  PROFILE_FOLLOWING: "profileFollowingCache",
  PROFILE_VEHICLES: "profileVehiclesCache",
  VEHICLE_FOLLOWERS: "vehicleFollowersCache",
  VEHICLE_DECODE: "vehicleDecodeCache",
  VEHICLE_RECALLS: "vehicleRecallsCache",
  FEED: "feedCache",
  FEED_TYPE: "feedTypeCache",
  FEED_POST_TYPE: "feedPostTypeCache",
};
