import { useEffect, useRef, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useAuthProvider } from "../Providers/AuthProvider";
import { ENDPOINTS, STATUS_ERROR, STATUS_OK } from "../config/Endpoints";
import { CacheKeys } from "../config/Cache";

type Cache = Record<List["uuid"], boolean>;

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

/**
 * A hook to cache and lookup Vehicle List following status by UUID
 *
 * NOTE:
 * - Unlike `isFollowingVehicleLookup` or `isFollowingLookup`,
 *   the `toggleFollowing` function will NOT update
 *   the cached `usePRofileListsLookup` value
 *
 * @param uuid the list uuid to verify against
 * @param refetch if true, will refetch the status
 * @returns [{ status, following }, toggleFollowing]
 */
const useIsFollowingListLookup = (uuid: List["uuid"], refetch = false): [{ status: LookupStatus, following: boolean | null }, () => Promise<boolean>] => {
  const { token } = useAuthProvider();
  const [cache, setCache] = useSessionStorage<Cache>(CacheKeys.IS_FOLLOWING_LIST, {});
  const cachedValue: boolean | null = cache[uuid] || null;

  const [status, setStatus] = useState<LookupStatus>(cachedValue !== null ? LookupStatus.Success : LookupStatus.Loading);
  const [following, setFollowing] = useState<boolean | null>(cachedValue);

  const followController = useRef<AbortController | null>(new AbortController());

  const toggleFollowing = async (): Promise<boolean> => {
    setFollowing((prev) => !prev);

    if (followController.current) {
      followController.current.abort();
    }

    followController.current = new AbortController();
    const { signal } = followController.current;

    const response = await fetch(ENDPOINTS.list_follow + uuid, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    }).catch(() => null);

    const { status, following_status } = await response?.json() || {};
    if (status === STATUS_OK) {
      setCache((prev) => ({ ...prev, [uuid]: !!following_status }));
      return true;
    }

    setFollowing((prev) => !prev);
    return false;
  };

  useEffect(() => {
    if ((cachedValue !== null && !refetch) || !token || !uuid) {
      return () => {};
    }

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const response = await fetch(ENDPOINTS.list_is_following + uuid, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }).catch(({ name }) => {
        if (name !== "AbortError") setStatus(LookupStatus.Error);
        return null;
      });

      const { status, is_following } = await response?.json() || {};
      if (status === STATUS_OK && typeof is_following === "boolean") {
        setCache((prev) => ({ ...prev, [uuid]: is_following }));
        setStatus(LookupStatus.Success);
        setFollowing(is_following);
      } else if (status === STATUS_ERROR) {
        setStatus(LookupStatus.Error);
      }
    })();

    return () => controller.abort();
  }, [uuid]);

  return [{ status, following }, toggleFollowing];
};

export default useIsFollowingListLookup;
