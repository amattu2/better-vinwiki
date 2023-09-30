import { useEffect, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useAuthProvider } from "../Providers/AuthProvider";
import { ENDPOINTS, STATUS_ERROR, STATUS_OK } from "../config/Endpoints";
import { CacheKeys } from "../config/Cache";

type Cache = Record<List["uuid"], List>;

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

/**
 * A hook to cache and lookup List information by UUID
 *
 * @param uuid the uuid to lookup
 * @param refetch if true, will refetch the list
 * @returns [status, List | null]
 */
const useListLookup = (uuid: List["uuid"], refetch = false): [LookupStatus, List | null] => {
  const { token } = useAuthProvider();
  const [cache, setCache] = useSessionStorage<Cache>(CacheKeys.LIST_LOOKUP, {});
  const cachedValue: List | null = cache[uuid] || null;

  // TODO: Two identical lookups will cause two network requests
  // find a way to prevent the 2nd request while the 1st is still loading

  const [status, setStatus] = useState<LookupStatus>(cachedValue ? LookupStatus.Success : LookupStatus.Loading);
  const [list, setList] = useState<List | null>(cachedValue);

  useEffect(() => {
    if ((cachedValue !== null && !refetch) || !token || !uuid) {
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
      }).catch(({ name }) => {
        if (name !== "AbortError") setStatus(LookupStatus.Error);
        return null;
      });

      const { status, list } = await response?.json() || {};
      if (status === STATUS_OK && !!list?.uuid) {
        delete list.vehicles;
        setCache((prev) => ({ ...prev, [uuid]: list }));
        setStatus(LookupStatus.Success);
        setList(list);
      } else if (status === STATUS_ERROR) {
        setStatus(LookupStatus.Error);
      }
    })();

    return () => controller.abort();
  }, []);

  return [status, list];
};

export default useListLookup;
