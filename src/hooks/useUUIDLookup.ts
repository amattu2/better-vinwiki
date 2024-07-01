import { useEffect, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useAuthProvider } from "../Providers/AuthProvider";
import { ENDPOINTS, STATUS_ERROR, STATUS_OK } from "../config/Endpoints";
import { CacheKeys } from "../config/Cache";

type Cache = Record<Profile["username"], Profile["uuid"]>;

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

/**
 * A hook to cache and lookup a uuid by username
 *
 * @param username username to lookup
 * @returns [status, { uuid }]
 */
const useUUIDLookup = (
  username: Profile["username"]
): [LookupStatus, { uuid: Profile["uuid"] | null }] => {
  const { token } = useAuthProvider();
  const [cache, setCache] = useSessionStorage<Cache>(CacheKeys.UUID_LOOKUP, {});
  const cachedValue: Profile["uuid"] | null = cache[username] || null;

  // TODO: Two identical mentions will cause two network requests
  // find a way to prevent the 2nd request while the 1st is still loading
  const [status, setStatus] = useState<LookupStatus>(
    cachedValue ? LookupStatus.Success : LookupStatus.Loading
  );
  const [uuid, setUUID] = useState<Profile["uuid"] | null>(cachedValue);

  useEffect(() => {
    if (cachedValue || !token || !username) {
      return () => {};
    }

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const response = await fetch(ENDPOINTS.profile_username_search + username, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }).catch(({ name }) => {
        if (name !== "AbortError") setStatus(LookupStatus.Error);
        return null;
      });

      const { status, person } = (await response?.json()) || {};
      if (status === STATUS_OK && !!person?.uuid) {
        setCache((prev) => ({ ...prev, [username]: person.uuid }));
        setStatus(LookupStatus.Success);
        setUUID(person.uuid);
      } else if (status === STATUS_ERROR) {
        setStatus(LookupStatus.Error);
      }
    })();

    return () => controller.abort();
  }, []);

  return [status, { uuid }];
};

export default useUUIDLookup;
