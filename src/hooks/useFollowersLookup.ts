import { useEffect, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useAuthProvider } from "../Providers/AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";
import { CacheKeys } from "../config/Cache";

type Cache = Record<Profile["uuid"], Profile[]>;

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

/**
 * A hook to cache and lookup profile followers by uuid
 *
 * @param uuid the uuid to verify against
 * @param refetch if true, will refetch the status
 * @returns [status, { followers }]
 */
const useFollowersLookup = (uuid: Profile["uuid"], refetch = false): [LookupStatus, { followers: Profile[] | null }] => {
  const { token } = useAuthProvider();
  const [cache, setCache] = useSessionStorage<Cache>(CacheKeys.PROFILE_FOLLOWERS, {});
  const cachedValue: Profile[] | null = cache[uuid] || null;

  const [status, setStatus] = useState<LookupStatus>(cachedValue ? LookupStatus.Success : LookupStatus.Loading);
  const [followers, setFollowers] = useState<Profile[] | null>(cachedValue);

  useEffect(() => {
    if ((cachedValue && !refetch) || !token || !uuid) {
      return () => {};
    }

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      setStatus(LookupStatus.Loading);

      const response = await fetch(ENDPOINTS.followers + uuid, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }).catch(() => null);

      const { status, followers } = await response?.json() || {};
      if (status === STATUS_OK) {
        setCache((prev) => ({ ...prev, [uuid]: followers }));
        setStatus(LookupStatus.Success);
        setFollowers(followers);
      }
    })();

    return () => controller.abort();
  }, [uuid]);

  return [status, { followers }];
};

export default useFollowersLookup;
