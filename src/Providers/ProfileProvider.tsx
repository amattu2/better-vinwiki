import React, { useState, FC, useEffect } from "react";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";
import { useAuthProvider } from "./AuthProvider";

export type ProviderState = {
  status: ProviderStatus;
  profile?: Profile;
  posts?: FeedPost[];
  lists?: ProfileLists;
  following?: boolean;
};

export enum ProviderStatus {
  LOADING = "LOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

const defaultState: ProviderState = { status: ProviderStatus.LOADING };

const Context = React.createContext<ProviderState | null>(null);

export const useProfileProvider = (): ProviderState => {
  const contextState = React.useContext(Context);

  if (contextState === null) {
    throw new Error("useProfileProvider must be used within a ProfileProvider");
  }

  return contextState;
};

const fetchProfile = async (uuid: Profile["uuid"], token: string): Promise<Profile> => {
  const response = await fetch(ENDPOINTS.profile + uuid, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { status, profile } = await response.json();
  if (status === STATUS_OK) {
    return profile;
  }

  throw new Error("Error fetching profile");
};

const fetchPosts = async (uuid: Profile["uuid"], token: string): Promise<{ post: FeedPost }[]> => {
  const response = await fetch(ENDPOINTS.posts + uuid, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { status, posts } = await response.json();
  if (status === STATUS_OK) {
    return posts;
  }

  throw new Error("Error fetching posts");
};

const fetchFollowing = async (uuid: Profile["uuid"], token: string): Promise<boolean> => {
  const response = await fetch(ENDPOINTS.is_following + uuid, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { status, following } = await response.json();
  if (status === STATUS_OK) {
    return following;
  }

  return false;
};

const fetchLists = async (uuid: Profile["uuid"], token: string): Promise<ProfileLists | null> => {
  const response = await fetch(ENDPOINTS.lists + uuid, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { status, lists_following, lists_my, lists_other } = await response.json();
  if (status === STATUS_OK) {
    return {
      following: (lists_following as { list: List }[])?.map((r) => r?.list),
      owned: (lists_my as { list: List }[])?.map((r) => r?.list),
      other: (lists_other as { list: List }[])?.map((r) => r?.list),
    };
  }

  return null;
};

type Props = {
  uuid: Profile["uuid"];
  withPosts?: true;
  withFollowing?: true;
  withLists?: true;
  children?: React.ReactNode;
};

export const ProfileProvider: FC<Props> = ({
  uuid, withPosts, withFollowing, withLists,
  children,
}: Props) => {
  const { token, profile: authProfile } = useAuthProvider();
  const [state, setState] = useState<ProviderState>(defaultState);

  useEffect(() => {
    if (!token || !uuid) {
      return;
    }

    setState(defaultState);

    (async () => {
      const [profile, posts, following, lists] = (await Promise.allSettled([
        fetchProfile(uuid, token),
        withPosts ? fetchPosts(uuid, token) : Promise.resolve([]),
        withFollowing && uuid !== authProfile?.uuid ? fetchFollowing(uuid, token) : Promise.resolve(false),
        withLists ? fetchLists(uuid, token) : Promise.resolve([]),
      ])).map((r) => (r.status === "fulfilled" ? r.value : null));

      if (profile) {
        setState({
          status: ProviderStatus.LOADED,
          profile: profile as Profile,
          posts: (posts as { post: FeedPost }[])?.map((r) => r?.post),
          lists: lists as ProfileLists,
          following: following as boolean,
        });
      } else {
        setState({
          status: ProviderStatus.ERROR,
        });
      }
    })();
  }, [token, uuid, withPosts, withFollowing, withLists]);

  return (
    <Context.Provider value={state}>
      {children}
    </Context.Provider>
  );
};
