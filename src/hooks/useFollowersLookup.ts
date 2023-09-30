import { useEffect, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useAuthProvider } from "../Providers/AuthProvider";
import { ENDPOINTS, STATUS_ERROR, STATUS_OK } from "../config/Endpoints";
import { CacheKeys } from "../config/Cache";

export type LookupType = "Profile" | "Vehicle";

type KeyType<T> =
  T extends "Profile" ? Profile["uuid"] :
    T extends "Vehicle" ? Vehicle["vin"] :
      never;

type Cache<T extends LookupType> = Record<KeyType<T>, Profile[]>;

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

/**
 * A hook to cache and lookup followers for a model (Profile or Vehicle)
 *
 * @param {string} identifier the uuid or vin to verify against
 * @param {LookupType} type the type of lookup to perform
 * @param {boolean} [refetch] if true, will refetch the status
 * @returns [status, { followers }]
 */
const useFollowersLookup = <T extends LookupType>(identifier: KeyType<T>, type: T, refetch: boolean = false): [LookupStatus, { followers: Profile[] | null }] => {
  const { token } = useAuthProvider();

  const cacheKey = type === "Profile" ? CacheKeys.PROFILE_FOLLOWERS : CacheKeys.VEHICLE_FOLLOWERS;
  const [cache, setCache] = useSessionStorage<Cache<T>>(cacheKey, {} as Cache<T>);
  const cachedValue: Profile[] | null = cache[identifier] || null;

  const [status, setStatus] = useState<LookupStatus>(cachedValue ? LookupStatus.Success : LookupStatus.Loading);
  const [followers, setFollowers] = useState<Profile[] | null>(cachedValue);

  const endpoint = type === "Profile" ? ENDPOINTS.followers : ENDPOINTS.vehicle_followers;

  useEffect(() => {
    if ((cachedValue && !refetch) || !token || !identifier) {
      return () => {};
    }

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const response = await fetch(endpoint + identifier, {
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
