import React, { useState, FC, useEffect } from "react";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";
import { useAuthProvider } from "./AuthProvider";

export type ProviderState = {
  status: ProviderStatus;
  profile?: Profile;
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
  const { token } = useAuthProvider();
  const [state, setState] = useState<ProviderState>(defaultState);

  useEffect(() => {
    if (!token || !uuid) {
      return;
    }

    setState(defaultState);

    (async () => {
      const [profile] = (await Promise.allSettled([
        fetchProfile(uuid, token),
      ])).map((r) => (r.status === "fulfilled" ? r.value : null));

      if (profile) {
        setState({
          status: ProviderStatus.LOADED,
          profile: profile as Profile,
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
