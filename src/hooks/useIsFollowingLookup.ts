import { useEffect, useRef, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useAuthProvider } from "../Providers/AuthProvider";
import { ENDPOINTS, STATUS_ERROR, STATUS_OK } from "../config/Endpoints";
import { CacheKeys } from "../config/Cache";

type Cache = Record<Profile["uuid"], boolean>;

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

/**
 * A hook to cache and lookup following status by uuid
 *
 * @param uuid the uuid to verify against
 * @param refetch if true, will refetch the status
 * @returns [{ status, following }, toggleFollowing]
 */
const useIsFollowingLookup = (uuid: Profile["uuid"], refetch = false): [{ status: LookupStatus, following: boolean | null }, () => Promise<boolean>] => {
  const { token, profile } = useAuthProvider();
  const [cache, setCache] = useSessionStorage<Cache>(CacheKeys.IS_FOLLOWING, {});
  const cachedValue: boolean | null = cache[uuid] || null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_followingCache, setFollowingCache] = useSessionStorage<Cache>(CacheKeys.PROFILE_FOLLOWING, {});

  const [status, setStatus] = useState<LookupStatus>(cachedValue ? LookupStatus.Success : LookupStatus.Loading);
  const [following, setFollowing] = useState<boolean | null>(cachedValue);

  const followController = useRef<AbortController | null>(new AbortController());

  const toggleFollowing = async (): Promise<boolean> => {
    setFollowing((prev) => !prev);

    if (followController.current) {
      followController.current.abort();
    }

    followController.current = new AbortController();
    const { signal } = followController.current;

    const response = await fetch(ENDPOINTS.follow + uuid, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    }).catch(() => null);

    const { status, follow_result } = await response?.json() || {};
    if (status !== STATUS_OK) {
      setFollowing((prev) => !prev);
      return false;
    }

    setCache((prev) => ({ ...prev, [uuid]: follow_result.state === "following" }));

    const followingProfiles = await fetch(ENDPOINTS.following + profile!.uuid, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    }).catch(() => null);

    const { status: followingLookupStatus, following } = await followingProfiles?.json() || {};
    if (followingLookupStatus === STATUS_OK) {
      setFollowingCache((prev) => ({ ...prev, [profile!.uuid]: following }));
    }

    return true;
  };

  useEffect(() => {
    if ((cachedValue && !refetch) || !token || !uuid) {
      return () => {};
    }
    if (profile?.uuid === uuid) {
      setFollowing(true);
      setStatus(LookupStatus.Success);
      return () => {};
    }

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const response = await fetch(ENDPOINTS.is_following + uuid, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }).catch(({ name }) => {
        if (name !== "AbortError") setStatus(LookupStatus.Error);
        return null;
      });

      const { status, following } = await response?.json() || {};
      if (status === STATUS_OK) {
        setCache((prev) => ({ ...prev, [uuid]: following }));
        setStatus(LookupStatus.Success);
        setFollowing(following);
      } else if (status === STATUS_ERROR) {
        setStatus(LookupStatus.Error);
      }
    })();

    return () => controller.abort();
  }, [uuid]);

  return [{ status, following }, toggleFollowing];
};

export default useIsFollowingLookup;
