import { useEffect, useState } from "react";
import { useLocalStorage, useSessionStorage } from "usehooks-ts";
import { useAuthProvider } from "../Providers/AuthProvider";
import { ENDPOINTS, MEDIA_ENDPOINTS, STATUS_ERROR, STATUS_OK } from "../config/Endpoints";
import { CacheKeys } from "../config/Cache";

type Cache = Record<Profile["uuid"], Profile>;
type UUIDCache = Record<Profile["username"], Profile["uuid"]>;

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

/**
 * A hook to cache and lookup a Profile by UUID.
 *
 * @param uuid the uuid to lookup
 * @param refetch whether to refetch the profile even if it's cached
 * @returns [{ status, Profile }, (profile: Partial<Profile>) => Promise<boolean>, (image: FileList) => Promise<boolean>]
 */
const useProfileLookup = (
  uuid: Profile["uuid"],
  refetch = false
): [
  { status: LookupStatus; profile: Profile | null },
  (profile: Partial<Profile>) => Promise<boolean>,
  (image: FileList) => Promise<boolean>,
] => {
  const { token, profile: authProfile } = useAuthProvider();
  const [cache, setCache] = useSessionStorage<Cache>(CacheKeys.PROFILE, {});

  const [, setUUIDCache] = useSessionStorage<UUIDCache>(CacheKeys.UUID_LOOKUP, {});
  const [, setAuthProfileCache] = useLocalStorage<AuthProfile | null>(CacheKeys.AUTH_PROFILE, null);

  // TODO: Two identical lookups will cause two network requests
  // find a way to prevent the 2nd request while the 1st is still loading

  const cachedValue: Profile | null = cache[uuid] || null;
  const [status, setStatus] = useState<LookupStatus>(
    cachedValue ? LookupStatus.Success : LookupStatus.Loading
  );
  const [profile, setProfile] = useState<Profile>(cachedValue);

  /**
   * A function to edit a profile.
   *
   * Notes:
   * - This only allows editing of the current authenticated user's profile.
   * - This updates the `useProfileLookup` cache
   * - This updates the `useAuthProvider` profile cache
   *
   * @param {Partial<Profile>} editedProfile the partially edited profile
   * @returns Promise<boolean>
   */
  const editProfile = async (editedProfile: Partial<Profile>): Promise<boolean> => {
    if (!token || !profile || profile?.uuid !== authProfile?.uuid) {
      return false;
    }

    const response = await fetch(`${ENDPOINTS.profile_update}${uuid}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editedProfile),
    }).catch(() => null);

    const { status } = (await response?.json()) || {};
    if (status === STATUS_OK) {
      setProfile((prev) => ({ ...prev, ...editedProfile }));
      return true;
    }

    return false;
  };

  /**
   * A function to change a Profile Picture.
   *
   * Notes:
   * - This only allows editing of the current authenticated user's PFP.
   * - This updates the `useProfileLookup` cache
   * - This updates the `useAuthProvider` profile cache
   *
   * @param {FileList} image the image to upload
   * @returns Promise<boolean>
   */
  const editProfilePicture = async (imageUpload: FileList): Promise<boolean> => {
    if (!token || !profile || profile?.uuid !== authProfile?.uuid || !imageUpload?.[0]) {
      return false;
    }

    const formData = new FormData();
    formData.append("media", imageUpload?.[0]);

    const response = await fetch(`${MEDIA_ENDPOINTS.person_image_add}${uuid}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }).catch(() => null);

    const { status, image } = (await response?.json()) || {};
    if (status === STATUS_OK && image?.uuid) {
      setProfile((prev) => ({
        ...prev,
        avatar: image.files?.small_sq,
        profile_picture_uuid: image.uuid,
      }));
      return true;
    }

    return false;
  };

  useEffect(() => {
    if ((cachedValue && !refetch) || !token || !uuid) {
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
      }).catch(({ name }) => {
        if (name !== "AbortError") setStatus(LookupStatus.Error);
        return null;
      });

      const { status, profile } = (await response?.json()) || {};
      if (status === STATUS_OK && !!profile?.username) {
        setStatus(LookupStatus.Success);
        setProfile(profile);
      } else if (status === STATUS_ERROR) {
        setStatus(LookupStatus.Error);
      }
    })();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!profile?.uuid || !profile?.username) {
      return;
    }
    if (profile?.uuid === authProfile?.uuid) {
      setAuthProfileCache((prev) => ({ ...prev, ...profile }));
    }

    setCache((prev) => ({ ...prev, [profile.uuid]: profile }));
    setUUIDCache((prev) => ({ ...prev, [profile.username]: profile.uuid }));
  }, [profile]);

  return [{ status, profile }, editProfile, editProfilePicture];
};

export default useProfileLookup;
