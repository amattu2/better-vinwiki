import React, { useState, FC, useEffect } from "react";
import { useLocalStorage, useReadLocalStorage } from "usehooks-ts";
import { CacheKeys } from "../config/Cache";

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
  const [profile, setProfile] = useLocalStorage<AuthProfile | null>(CacheKeys.AUTH_PROFILE, null);
  const token = useReadLocalStorage<string>(CacheKeys.AUTH_TOKEN);
  const [state] = useState<ProviderState>(
    token && profile?.uuid
      ? {
          status: ProviderStatus.LOADED,
          authenticated: true,
          profile,
          token,
        }
      : defaultState
  );

  useEffect(() => {
    if (!state?.profile) {
      return;
    }

    setProfile(state.profile);
  }, [state.profile]);

  return <Context.Provider value={state}>{children}</Context.Provider>;
};
