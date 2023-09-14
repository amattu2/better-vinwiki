import React, { useState, FC, useEffect } from "react";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";

type AuthenticatedState = {
  status: ProviderStatus.LOADED;
  authenticated: true;
  profile: AuthProfile;
  token: string;
};

type UnauthenticatedState = {
  status: ProviderStatus;
  authenticated: false;
  token?: null;
  profile?: null;
};

export type ProviderState = UnauthenticatedState | AuthenticatedState;

export enum ProviderStatus {
  LOADING = "LOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

const defaultState: ProviderState = { status: ProviderStatus.LOADING, authenticated: false };

export const Context = React.createContext<ProviderState | null>(null);

export const useAuthProvider = (): ProviderState => {
  const contextState = React.useContext(Context);

  if (contextState === null) {
    throw new Error("useAuthProvider must be used within a AuthProvider");
  }

  return contextState;
};

type Props = {
  children?: React.ReactNode;
};

export const AuthProvider: FC<Props> = ({ children }: Props) => {
  const [profile, setProfile] = useLocalStorage<AuthProfile | null>("profile", null);
  const token = useReadLocalStorage<string>("token");
  const [state, setState] = useState<ProviderState>((token && profile?.uuid) ? {
    status: ProviderStatus.LOADED,
    authenticated: true,
    profile,
    token,
  } : defaultState);

  // TODO: Refactor each of these fetches into their own custom hooks
  // This will allow us to use the data in other components without having to
  // copy-paste the fetch logic and we can also abort the fetches when the
  // component unmounts.
  useEffect(() => {
    if (!token || !profile?.uuid) {
      return;
    }

    (async () => {
      if (profile?.recentVehicles?.length) {
        return;
      }

      const response = await fetch(`${ENDPOINTS.recent_vins}${profile.uuid}/25`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => null);

      const { status, recent_vins } = await response?.json() || {};
      if (status === STATUS_OK) {
        setState((p) => ({ ...p, profile: { ...p.profile, recentVehicles: recent_vins || [] } } as AuthenticatedState));
      }
    })();

    (async () => {
      if (profile?.followingVehicles?.length) {
        return;
      }

      const response = await fetch(`${ENDPOINTS.following_vehicles}${profile.uuid}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => null);

      const { status, vehicles_following } = await response?.json() || {};
      if (status === STATUS_OK) {
        setState((p) => ({ ...p, profile: { ...p.profile, followingVehicles: vehicles_following || [] } } as AuthenticatedState));
      }
    })();

    (async () => {
      if (profile?.followingProfiles?.length) {
        return;
      }

      const response = await fetch(`${ENDPOINTS.following}${profile.uuid}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => null);

      const { status, following } = await response?.json() || {};
      if (status === STATUS_OK) {
        setState((p) => ({ ...p, profile: { ...p.profile, followingProfiles: following || [] } } as AuthenticatedState));
      }
    })();

    (async () => {
      if (profile?.profileLists?.following && profile?.profileLists?.owned) {
        return;
      }

      const response = await fetch(`${ENDPOINTS.lists}${profile.uuid}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => null);

      const { status, lists_my, lists_following, lists_other } = await response?.json() || {};
      if (status === STATUS_OK) {
        setState((p) => ({
          ...p,
          profile: {
            ...p.profile,
            profileLists: {
              following: (lists_following as { list: List }[])?.map((r) => r?.list) || [],
              owned: (lists_my as { list: List }[])?.map((r) => r?.list) || [],
              other: (lists_other as { list: List }[])?.map((r) => r?.list) || [],
            },
          },
        } as AuthenticatedState));
      }
    })();
  }, []);

  useEffect(() => {
    if (!state.profile) {
      return;
    }

    setProfile(state.profile);
  }, [state.profile]);

  return (
    <Context.Provider value={state}>
      {children}
    </Context.Provider>
  );
};
