import { useEffect, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useAuthProvider } from "../Providers/AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";
import { CacheKeys } from "../config/Cache";

type Cache = Record<Profile["uuid"], Vehicle[]>;

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

/**
 * A hook to cache and lookup vehicles a profile is following by uuid
 *
 * @param uuid the uuid to verify against
 * @param refetch if true, will refetch the status
 * @returns [status, { vehicles }]
 */
const useFollowingVehiclesLookup = (uuid: Profile["uuid"], refetch = false): [LookupStatus, { vehicles: Vehicle[] | null }] => {
  const { token } = useAuthProvider();
  const [cache, setCache] = useSessionStorage<Cache>(CacheKeys.PROFILE_VEHICLES, {});
  const cachedValue: Vehicle[] | null = cache[uuid] || null;

  const [status, setStatus] = useState<LookupStatus>(cachedValue ? LookupStatus.Success : LookupStatus.Loading);
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(cachedValue);

  useEffect(() => {
    if ((cachedValue && !refetch) || !token || !uuid) {
      return () => {};
    }

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      setStatus(LookupStatus.Loading);

      const response = await fetch(ENDPOINTS.following_vehicles + uuid, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }).catch(({ name }) => {
        if (name !== "AbortError") setStatus(LookupStatus.Error);
        return null;
      });

      const { status, vehicles_following } = await response?.json() || {};
      if (status === STATUS_OK) {
        setCache((prev) => ({ ...prev, [uuid]: vehicles_following }));
        setStatus(LookupStatus.Success);
        setVehicles(vehicles_following);
      } else {
        setStatus(LookupStatus.Error);
      }
    })();

    return () => controller.abort();
  }, [uuid]);

  return [status, { vehicles }];
};

export default useFollowingVehiclesLookup;
