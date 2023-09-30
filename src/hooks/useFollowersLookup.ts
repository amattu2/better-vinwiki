import { useEffect, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useAuthProvider } from "../Providers/AuthProvider";
import { ENDPOINTS, STATUS_ERROR, STATUS_OK } from "../config/Endpoints";
import { CacheKeys } from "../config/Cache";

export type LookupType = "Profile" | "Vehicle" | "List";

type KeyType<T> =
  T extends "Profile" ? Profile["uuid"] :
    T extends "Vehicle" ? Vehicle["vin"] :
      T extends "List" ? List["uuid"] :
        never;

type Cache<T extends LookupType> = Record<KeyType<T>, Profile[]>;

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

const getCacheKey = <T extends LookupType>(type: T): string => {
  switch (type) {
    case "Profile":
      return CacheKeys.PROFILE_FOLLOWERS;
    case "Vehicle":
      return CacheKeys.VEHICLE_FOLLOWERS;
    case "List":
      return CacheKeys.LIST_FOLLOWERS;
    default:
      throw new Error("Invalid LookupType");
  }
};

const getEndpoint = <T extends LookupType>(type: T): string => {
  switch (type) {
    case "Profile":
      return ENDPOINTS.followers;
    case "Vehicle":
      return ENDPOINTS.vehicle_followers;
    case "List":
      return ENDPOINTS.list_followers;
    default:
      throw new Error("Invalid LookupType");
  }
};

/**
 * A hook to cache and lookup followers for a model (Profile, Vehicle, List)
 *
 * @param {string} identifier the uuid or vin to verify against
 * @param {LookupType} type the type of lookup to perform
 * @param {boolean} [refetch] if true, will refetch the status
 * @returns [status, { followers }]
 */
const useFollowersLookup = <T extends LookupType>(identifier: KeyType<T>, type: T, refetch: boolean = false): [LookupStatus, { followers: Profile[] | null }] => {
  const { token } = useAuthProvider();

  const [cache, setCache] = useSessionStorage<Cache<T>>(getCacheKey(type), {} as Cache<T>);
  const cachedValue: Profile[] | null = cache[identifier] || null;

  const [status, setStatus] = useState<LookupStatus>(cachedValue ? LookupStatus.Success : LookupStatus.Loading);
  const [followers, setFollowers] = useState<Profile[] | null>(cachedValue);

  useEffect(() => {
    if ((cachedValue && !refetch) || !token || !identifier) {
      return () => {};
    }

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const response = await fetch(getEndpoint(type) + identifier, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }).catch(({ name }) => {
        if (name !== "AbortError") setStatus(LookupStatus.Error);
        return null;
      });

      const { status, followers } = await response?.json() || {};
      if (status === STATUS_OK) {
        setCache((prev) => ({ ...prev, [identifier]: followers }));
        setStatus(LookupStatus.Success);
        setFollowers(followers);
      } else if (status === STATUS_ERROR) {
        setStatus(LookupStatus.Error);
      }
    })();

    return () => controller.abort();
  }, [identifier, type]);

  return [status, { followers }];
};

export default useFollowersLookup;
