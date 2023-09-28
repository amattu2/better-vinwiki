/**
 * A map of localstorage or sessionstorage cache keys
 */
export const CacheKeys: { [name: string]: Readonly<string> } = {
  AUTH_PROFILE: "profile",
  AUTH_TOKEN: "token",
  IS_FOLLOWING: "isFollowingCache",
  IS_FOLLOWING_VEHICLE: "isFollowingVehicleCache",
  UUID_LOOKUP: "uuidLookupCache",
  LIST_LOOKUP: "listLookupCache",
  PROFILE: "profileCache",
  PROFILE_LISTS: "profileListsCache",
  PROFILE_FOLLOWERS: "profileFollowersCache",
  PROFILE_FOLLOWING: "profileFollowingCache",
  PROFILE_VEHICLES: "profileVehiclesCache",
  VEHICLE_FOLLOWERS: "vehicleFollowersCache",
  FEED: "feedCache",
  FEED_TYPE: "feedTypeCache",
  FEED_POST_TYPE: "feedPostTypeCache",
};
