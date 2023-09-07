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
 * A hook to cache and lookup a uuid by username
 *
 * @param username username to lookup
 * @returns [status, { uuid }]
 */
const useUsernameLookup = (username: Profile["username"]): [LookupStatus, { uuid: Profile["uuid"] | null }] => {
  const { token } = useAuthProvider();
  const [cache, setCache] = useSessionStorage<Cache>("usernameLookupCache", {});
  const cachedValue: Profile["uuid"] | null = cache[username] || null;

  const [status, setStatus] = useState<LookupStatus>(cachedValue ? LookupStatus.Success : LookupStatus.Loading);
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
      }).catch(() => setStatus(LookupStatus.Error));

      const { status, person } = await response?.json() || {};
      if (status === STATUS_OK && !!person?.uuid) {
        setCache((prev) => ({ ...prev, [username]: person.uuid }));
        setStatus(LookupStatus.Success);
        setUUID(person.uuid);
      }
    })();

    return () => controller.abort();
  }, []);

  return [status, { uuid }];
};

export default useUsernameLookup;
