import React, { useState, FC, useEffect } from "react";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";
import { useAuthProvider } from "./AuthProvider";

export type ProviderState = {
  status: ProviderStatus;
  profile?: Profile;
  posts?: FeedPost[];
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

type Props = {
  uuid: Profile["uuid"];
  withPosts?: true;
  withFollowing?: true;
  children: React.ReactNode;
};

export const ProfileProvider: FC<Props> = ({ uuid, withPosts, withFollowing, children }: Props) => {
  const { token, user } = useAuthProvider();
  const [state, setState] = useState<ProviderState>(defaultState);

  useEffect(() => {
    if (!token || !uuid) {
      return;
    }

    setState(defaultState);

    (async () => {
      const [profile, posts, following] = (await Promise.allSettled([
        fetchProfile(uuid, token),
        withPosts ? fetchPosts(uuid, token) : Promise.resolve([]),
        withFollowing && uuid !== user?.uuid ? fetchFollowing(uuid, token) : Promise.resolve(false),
      ])).map((r) => r.status === "fulfilled" ? r.value : null);

      if (profile) {
        setState({
          status: ProviderStatus.LOADED,
          profile: profile as Profile,
          posts: (posts as { post: FeedPost}[])?.map(r => r?.post),
          following: following as boolean,
        });
      } else {
        setState({
          status: ProviderStatus.ERROR,
        });
      }
    })();
  }, [token, uuid, withPosts, withFollowing]);

  return (
    <Context.Provider value={state}>
      {children}
    </Context.Provider>
  );
};
