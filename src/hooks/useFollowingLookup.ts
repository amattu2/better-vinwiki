import { useEffect, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import { isEqual } from "lodash";
import { useAuthProvider } from "../Providers/AuthProvider";
import { ENDPOINTS, ERROR_KEY, STATUS_ERROR, STATUS_OK } from "../config/Endpoints";
import { CacheKeys } from "../config/Cache";

type Cache = Record<Profile["uuid"], Profile[]>;

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

/**
 * A hook to cache and lookup profiles a profile is following by uuid
 *
 * @param uuid the uuid to verify against
 * @param refetch if true, will refetch the status
 * @returns [status, { following }]
 */
const useFollowingLookup = (uuid: Profile["uuid"], refetch = false): [LookupStatus, { following: Profile[] | null }] => {
  const { token } = useAuthProvider();
  const [cache, setCache] = useSessionStorage<Cache>(CacheKeys.PROFILE_FOLLOWING, {});
  const cachedValue: Profile[] | null = cache[uuid] || null;

  const [status, setStatus] = useState<LookupStatus>(cachedValue ? LookupStatus.Success : LookupStatus.Loading);
  const [following, setFollowing] = useState<Profile[] | null>(cachedValue);

  useEffect(() => {
    if ((cachedValue && !refetch) || !token || !uuid) {
      return () => {};
    }

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const response = await fetch(ENDPOINTS.following + uuid, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }).catch(({ name }) => {
        if (name !== "AbortError") setStatus(LookupStatus.Error);
        return null;
      });

      const { status, key, following } = await response?.json() || {};
      if (status === STATUS_OK) {
        setCache((prev) => ({ ...prev, [uuid]: following }));
        setStatus(LookupStatus.Success);
        setFollowing(following);
      } else if (status === STATUS_ERROR && key === ERROR_KEY.NOT_FOLLOWING) {
        setCache((prev) => ({ ...prev, [uuid]: [] }));
        setStatus(LookupStatus.Success);
        setFollowing([]);
      } else {
        setStatus(LookupStatus.Error);
      }
    })();

    return () => controller.abort();
  }, [uuid]);

  useEffect(() => {
    // Watch for changes in the cache
    if (isEqual(cachedValue, following)) {
      return;
    }

    setFollowing(cachedValue);
  }, [cachedValue]);

  return [status, { following }];
};

export default useFollowingLookup;
