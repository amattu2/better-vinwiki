import React, { useState, FC, useEffect, useRef } from "react";
import { useAuthProvider } from "./AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";

export type ProviderState = {
  status: ProviderStatus;
  vehicles: Vehicle[];
};

export enum ProviderStatus {
  LOADING = "LOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

const defaultState: ProviderState = { status: ProviderStatus.LOADING, vehicles: [] };

const Context = React.createContext<ProviderState | null>(null);

export const useRecentVehicles = (): ProviderState => {
  const contextState = React.useContext(Context);

  if (contextState === null) {
    throw new Error("useRecentVehicles must be used within a RecentVehiclesProvider");
  }

  return contextState;
};

type Props = {
  count?: number;
  children?: React.ReactNode;
};

export const RecentVehiclesProvider: FC<Props> = ({ count = 10, children }: Props) => {
  const { token, user } = useAuthProvider();
  const [state, setState] = useState<ProviderState>(defaultState);
  const [trigger, setTrigger] = useState<NodeJS.Timeout>();
  const controllerRef = useRef<AbortController>();

  const refetch = async () => {
    if (!token) {
      return;
    }
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();
    const { signal } = controllerRef.current;

    setState((prevState) => ({
      ...prevState,
      status: ProviderStatus.LOADING,
    }));

    const response = await fetch(`${ENDPOINTS.recent_vins}${user.uuid}/${count}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    }).catch(() => null);

    const { status, recent_vins } = await response?.json() || {};
    if (status === STATUS_OK) {
      setState({ status: ProviderStatus.LOADED, vehicles: recent_vins || [] });
    }
  };

  useEffect(() => {
    refetch();

    setTrigger(setInterval(refetch, (60 * 1000 * 5)));
    return () => clearInterval(trigger);
  }, []);

  return (
    <Context.Provider value={state}>
      {children}
    </Context.Provider>
  );
};
