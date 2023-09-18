import { useEffect, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useAuthProvider } from "../Providers/AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";
import { CacheKeys } from "../config/Cache";

type Cache = Record<List["uuid"], List["name"]>;

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

/**
 * A hook to cache and lookup List information by UUID
 *
 * @param uuid the uuid to lookup
 * @returns [status, { name }]
 */
const useListLookup = (uuid: List["uuid"]): [LookupStatus, { name: List["name"] | null }] => {
  const { token } = useAuthProvider();
  const [cache, setCache] = useSessionStorage<Cache>(CacheKeys.LIST_LOOKUP, {});
  const cachedValue: List["name"] | null = cache[uuid] || null;

  // TODO: Two identical lookups will cause two network requests
  // find a way to prevent the 2nd request while the 1st is still loading

  const [status, setStatus] = useState<LookupStatus>(cachedValue ? LookupStatus.Success : LookupStatus.Loading);
  const [name, setListName] = useState<List["name"] | null>(cachedValue);

  useEffect(() => {
    if (cachedValue || !token || !uuid) {
      return () => {};
    }

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const response = await fetch(ENDPOINTS.list + uuid, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }).catch(() => setStatus(LookupStatus.Error));

      const { status, list } = await response?.json() || {};
      if (status === STATUS_OK && !!list?.name) {
        setCache((prev) => ({ ...prev, [uuid]: list.name }));
        setStatus(LookupStatus.Success);
        setListName(list.name);
      }
    })();

    return () => controller.abort();
  }, []);

  return [status, { name }];
};

export default useListLookup;
