import { useEffect, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useAuthProvider } from "../Providers/AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";

type Cache = Record<Profile["username"], Profile["uuid"]>;

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

/**
 * A hook to cache and lookup a username by UUID.
 * This is the inverse of `useUUIDLookup`
 *
 * @param uuid the uuid to lookup
 * @returns [status, { username }]
 */
const useUsernameLookup = (uuid: Profile["uuid"]): [LookupStatus, { username: Profile["username"] | null }] => {
  const { token } = useAuthProvider();
  const [cache, setCache] = useSessionStorage<Cache>("uuidLookupCache", {});

  const cachedIndex = Object.values(cache).findIndex((v) => v === uuid);
  const cachedValue: Profile["username"] | null = cachedIndex > -1 ? Object.keys(cache)[cachedIndex] : null;

  // TODO: Two identical lookups will cause two network requests
  // find a way to prevent the 2nd request while the 1st is still loading

  const [status, setStatus] = useState<LookupStatus>(cachedValue ? LookupStatus.Success : LookupStatus.Loading);
  const [username, setUsername] = useState<Profile["username"] | null>(cachedValue);

  useEffect(() => {
    if (cachedValue || !token || !uuid) {
      return () => {};
    }

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const response = await fetch(ENDPOINTS.profile + uuid, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }).catch(() => setStatus(LookupStatus.Error));

      const { status, profile } = await response?.json() || {};
      if (status === STATUS_OK && !!profile?.username) {
        setCache((prev) => ({ ...prev, [profile.username]: uuid }));
        setStatus(LookupStatus.Success);
        setUsername(profile.username);
      }
    })();

    return () => controller.abort();
  }, []);

  return [status, { username }];
};

export default useUsernameLookup;
