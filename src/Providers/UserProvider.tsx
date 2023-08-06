import React, { useState, FC, useEffect } from "react";

type AuthenticatedState = {
  status: ProviderStatus.LOADED;
  authenticated: true;
  user: User;
  token: string;
};

type UnauthenticatedState = {
  status: ProviderStatus;
  authenticated: false;
  token?: null;
  user?: null;
};

export type ProviderState = UnauthenticatedState | AuthenticatedState;

export enum ProviderStatus {
  LOADING = "LOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

const defaultState: ProviderState = { status: ProviderStatus.LOADING, authenticated: false };

const Context = React.createContext<ProviderState | null>(null);

export const useUserProvider = (): ProviderState => {
  const contextState = React.useContext(Context);

  if (contextState === null) {
    throw new Error("useUserProvider must be used within a UserProvider");
  }

  return contextState;
};

type UserProviderProps = {
  token: string;
  children: React.ReactNode;
};

export const UserProvider: FC<UserProviderProps> = ({ token, children }: UserProviderProps) => {
  const user : User = JSON.parse(localStorage.getItem("user") || "{}");
  const [state, setState] = useState<ProviderState>(user && user.id ? {
    status: ProviderStatus.LOADED,
    authenticated: true,
    user,
    token,
  } : defaultState);

  useEffect(() => {
    if (state.status === ProviderStatus.LOADED) {
      return;
    }
    if (state.user) {
      return;
    }

    // TODO: Fetch user and cache data IF it's not already cached
  });

  useEffect(() => {
    if (state.authenticated && state.user) {
      localStorage.setItem("user", JSON.stringify(state.user));
      localStorage.setItem("token", state.token);
      return;
    }

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }, [state.authenticated, state.user, state.token]);

  return (
    <Context.Provider value={state}>
      {children}
    </Context.Provider>
  );
};
