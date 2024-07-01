import { useEffect, useRef, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useAuthProvider } from "../Providers/AuthProvider";
import { ENDPOINTS, STATUS_ERROR, STATUS_OK } from "../config/Endpoints";
import { CacheKeys } from "../config/Cache";

type Cache = Record<Vehicle["vin"], boolean>;

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

/**
 * A hook to cache and lookup vehicle following status by VIN
 *
 * @param vin the uuid to verify against
 * @param refetch if true, will refetch the status
 * @returns [{ status, following }, toggleFollowing]
 */
const useIsFollowingVehicleLookup = (
  vin: Vehicle["vin"],
  refetch = false
): [{ status: LookupStatus; following: boolean | null }, () => Promise<boolean>] => {
  const { token, profile } = useAuthProvider();
  const [cache, setCache] = useSessionStorage<Cache>(CacheKeys.IS_FOLLOWING_VEHICLE, {});
  const cachedValue: boolean | null = cache[vin] || null;

  const [, setFollowingCache] = useSessionStorage<Record<Vehicle["vin"], Vehicle[]>>(
    CacheKeys.PROFILE_VEHICLES,
    {}
  );

  const [status, setStatus] = useState<LookupStatus>(
    cachedValue !== null ? LookupStatus.Success : LookupStatus.Loading
  );
  const [following, setFollowing] = useState<boolean | null>(cachedValue);

  const followController = useRef<AbortController | null>(new AbortController());

  const toggleFollowing = async (): Promise<boolean> => {
    setFollowing((prev) => !prev);

    if (followController.current) {
      followController.current.abort();
    }

    followController.current = new AbortController();
    const { signal } = followController.current;

    const response = await fetch(ENDPOINTS.vehicle_follow + vin, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    }).catch(() => null);

    const { status, follow_result } = (await response?.json()) || {};
    if (status !== STATUS_OK) {
      setFollowing((prev) => !prev);
      return false;
    }

    setCache((prev) => ({ ...prev, [vin]: follow_result.state === "following" }));

    const followingVehicles = await fetch(ENDPOINTS.following_vehicles + (profile?.uuid || ""), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    }).catch(() => null);

    const { status: followingLookupStatus, vehicles_following } =
      (await followingVehicles?.json()) || {};
    if (followingLookupStatus === STATUS_OK && profile?.uuid) {
      setFollowingCache((prev) => ({ ...prev, [profile.uuid]: vehicles_following }));
    }

    return true;
  };

  useEffect(() => {
    if ((cachedValue !== null && !refetch) || !token || !vin) {
      return () => {};
    }

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const response = await fetch(ENDPOINTS.vehicle_is_following + vin, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }).catch(({ name }) => {
        if (name !== "AbortError") setStatus(LookupStatus.Error);
        return null;
      });

      const { status, following } = (await response?.json()) || {};
      if (status === STATUS_OK) {
        setCache((prev) => ({ ...prev, [vin]: following }));
        setStatus(LookupStatus.Success);
        setFollowing(following);
      } else if (status === STATUS_ERROR) {
        setStatus(LookupStatus.Error);
      }
    })();

    return () => controller.abort();
  }, [vin]);

  return [{ status, following }, toggleFollowing];
};

export default useIsFollowingVehicleLookup;
