import { useEffect, useState } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useAuthProvider } from "../Providers/AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";
import { CacheKeys } from "../config/Cache";

type Cache = Record<Profile["uuid"], ProfileLists>;

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

/**
 * A hook to cache and lookup a user's profile lists by uuid
 *
 * @param uuid the profile uuid to lookup lists for
 * @param refetch if true, will refetch the lists behind the scenes
 * @returns [status, ProfileLists]
 */
const useProfileListsLookup = (uuid: Profile["uuid"], refetch = false): [LookupStatus, ProfileLists | null] => {
  const { token } = useAuthProvider();
  const [cache, setCache] = useSessionStorage<Cache>(CacheKeys.PROFILE_LISTS, {});
  const cachedValue: ProfileLists | null = cache[uuid] || null;

  const [status, setStatus] = useState<LookupStatus>(cachedValue ? LookupStatus.Success : LookupStatus.Loading);
  const [lists, setLists] = useState<ProfileLists | null>(cachedValue);

  useEffect(() => {
    if ((cachedValue && !refetch) || !token || !uuid) {
      return () => {};
    }

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const response = await fetch(ENDPOINTS.lists + uuid, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }).catch(() => setStatus(LookupStatus.Error));

      const { status, lists_my, lists_following, lists_other } = await response?.json() || {};
      if (status === STATUS_OK) {
        const result: ProfileLists = {
          following: (lists_following as { list: List }[])?.map((r) => r?.list),
          owned: (lists_my as { list: List }[])?.map((r) => r?.list),
          other: (lists_other as { list: List }[])?.map((r) => r?.list),
        };

        setCache((prev) => ({ ...prev, [uuid]: result }));
        setStatus(LookupStatus.Success);
        setLists(result);
      }
    })();

    return () => controller.abort();
  }, []);

  return [status, lists];
};

export default useProfileListsLookup;
