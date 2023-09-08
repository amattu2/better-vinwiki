import React, { useState, FC, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

type AuthenticatedState = {
  status: ProviderStatus.LOADED;
  authenticated: true;
  profile: Profile;
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

const Context = React.createContext<ProviderState | null>(null);

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
  const [profile, setProfile] = useLocalStorage<Profile | null>("profile", null);
  const [token, setToken] = useLocalStorage<string>("token", "");
  const [state, setState] = useState<ProviderState>(profile?.uuid ? {
    status: ProviderStatus.LOADED,
    authenticated: true,
    profile,
    token,
  } : defaultState);

  useEffect(() => {
    if (state.authenticated && state.profile) {
      setProfile(state.profile);
      setToken(state.token);
      return;
    }

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setState(defaultState);
  }, [state.authenticated, state.profile, state.token]);

  return (
    <Context.Provider value={state}>
      {children}
    </Context.Provider>
  );
};
