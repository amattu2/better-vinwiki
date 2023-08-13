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

type Props = {
  uuid: Profile["uuid"];
  children: React.ReactNode;
};

export const ProfileProvider: FC<Props> = ({ uuid, children }: Props) => {
  const { token } = useAuthProvider();
  const [state, setState] = useState<ProviderState>(defaultState);

  useEffect(() => {
    if (!token || !uuid) {
      return;
    }

    setState(defaultState);

    (async () => {
      const response = await fetch(ENDPOINTS.profile + uuid, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { status, profile } = await response.json();
      if (status === STATUS_OK) {
        setState({
          status: ProviderStatus.LOADED,
          profile,
        });
      } else {
        setState({
          status: ProviderStatus.ERROR,
        });
      }
    })();
  }, [token, uuid]);

  return (
    <Context.Provider value={state}>
      {children}
    </Context.Provider>
  );
};
