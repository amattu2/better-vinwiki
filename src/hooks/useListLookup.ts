import { useEffect, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useAuthProvider } from "../Providers/AuthProvider";
import { ENDPOINTS, STATUS_ERROR, STATUS_OK } from "../config/Endpoints";
import { CacheKeys } from "../config/Cache";
import { Cache as ProfileListsCache } from "./useProfileListsLookup";

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
 * @returns [{ status, List }, (list: Partial<List>) => Promise<boolean>, () => Promise<boolean>]
 */
const useListLookup = (
  uuid: List["uuid"],
  refetch = false
): [
  { status: LookupStatus; list: List | null },
  (list: Partial<List>) => Promise<boolean>,
  () => Promise<boolean>,
] => {
  const { token, profile: authProfile } = useAuthProvider();
  const [cache, setCache] = useSessionStorage<Cache>(CacheKeys.LIST_LOOKUP, {});
  const cachedValue: List | null = cache[uuid] || null;

  const [, setProfileListsCache] = useSessionStorage<ProfileListsCache>(
    CacheKeys.PROFILE_LISTS,
    {}
  );

  // TODO: Two identical lookups will cause two network requests
  // find a way to prevent the 2nd request while the 1st is still loading

  const [status, setStatus] = useState<LookupStatus>(
    cachedValue ? LookupStatus.Success : LookupStatus.Loading
  );
  const [list, setList] = useState<List | null>(cachedValue);

  /**
   * A function to perform a list update
   *
   * Notes:
   * - Only the list owner can update a list
   * - This updates the `useListLookup` cache
   * - This updates the `useProfileListsLookup` cache where any reference to this list is found
   *
   * @param {Partial<List>} editedList the partially edited list
   * @returns Promise<boolean> true if the list was updated, false otherwise
   */
  const editList = async (editedList: Partial<List>): Promise<boolean> => {
    if (!list?.owner?.uuid || !authProfile?.uuid || list.owner.uuid !== authProfile.uuid) {
      return false;
    }

    const response = await fetch(`${ENDPOINTS.list_update}${uuid}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editedList),
    }).catch(() => null);

    const { status } = (await response?.json()) || {};
    if (status === STATUS_OK) {
      setCache((prev) => ({ ...prev, [uuid]: { ...list, ...editedList } }));
      setList((prev) => ({ ...prev!, ...editedList }));
      setProfileListsCache((prev) => {
        const { owned, following } = prev[authProfile.uuid] || {};

        return {
          ...prev,
          [authProfile.uuid]: {
            owned: owned?.map((l) => (l?.uuid === uuid ? { ...l, ...editedList } : l)),
            following,
          },
        };
      });

      return true;
    }

    return false;
  };

  /**
   * A function to completely delete a list
   *
   * Notes:
   * - Only the list owner can delete a list
   * - This updates the `useListLookup` cache
   * - This updates the `useProfileListsLookup` for the current user only
   *
   * @returns Promise<boolean> true if the list was updated, false otherwise
   */
  const deleteList = async (): Promise<boolean> => {
    if (!list?.owner?.uuid || !authProfile?.uuid || list.owner.uuid !== authProfile.uuid) {
      return false;
    }

    const response = await fetch(`${ENDPOINTS.list_delete}${uuid}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => null);

    const { status, deleted } = (await response?.json()) || {};
    if (status === STATUS_OK && !!deleted) {
      setCache((prev) => {
        const { [uuid]: _, ...rest } = prev;
        return rest;
      });
      setProfileListsCache((prev) => {
        const { owned, following } = prev[authProfile.uuid] || {};
        return {
          ...prev,
          [authProfile.uuid]: { owned: owned?.filter((l) => l?.uuid !== uuid), following },
        };
      });
      return true;
    }

    return false;
  };

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

      const { status, list } = (await response?.json()) || {};
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

  return [{ status, list }, editList, deleteList];
};

export default useListLookup;
