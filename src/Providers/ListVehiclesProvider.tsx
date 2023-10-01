import React, { useState, FC, useEffect, useMemo } from "react";
import { useAuthProvider } from "./AuthProvider";
import { ENDPOINTS, STATUS_ERROR, STATUS_OK } from "../config/Endpoints";

export type ProviderState = {
  status: ProviderStatus;
  vehicles?: Vehicle[];
  hasNext?: boolean;
  next?: (count: number) => Promise<boolean>;
};

export enum ProviderStatus {
  LOADING = "LOADING",
  LOADED = "LOADED",
  LOADING_MORE = "LOADING_MORE",
  ERROR = "ERROR",
}

const defaultState: ProviderState = { status: ProviderStatus.LOADING };

const Context = React.createContext<ProviderState | null>(null);

export const useListVehiclesProvider = (): ProviderState => {
  const contextState = React.useContext(Context);

  if (contextState === null) {
    throw new Error("useListProvider must be used within a ListProvider");
  }

  return contextState;
};

type Props = {
  uuid: string;
  children?: React.ReactNode;
};

export const ListVehiclesProvider: FC<Props> = ({ uuid, children }: Props) => {
  const { token } = useAuthProvider();
  const [state, setState] = useState<ProviderState>(defaultState);
  const [lastID, setLastID] = useState<string>("");
  const [hasNext, setHasNext] = useState<boolean>(false);

  const next = async (count = 1000) : Promise<boolean> => {
    if (!token || !hasNext || !lastID) {
      return false;
    }

    setState((prev) => ({ ...prev, status: ProviderStatus.LOADING_MORE }));

    const response = await fetch(`${ENDPOINTS.list_vehicles}${uuid}/${count}/${lastID}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { status, vehicles, last_id, end } = await response.json();
    if (status === STATUS_OK) {
      setState((prev) => ({
        ...prev,
        status: ProviderStatus.LOADED,
        vehicles: [...(prev.vehicles || []), ...(vehicles || [])],
      }));
      setHasNext(!end);
      setLastID(last_id || "");
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (!token || !uuid) {
      return () => {};
    }

    setState(defaultState);

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const response = await fetch(`${ENDPOINTS.list_vehicles}${uuid}/${200}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }).catch(({ name }) => {
        if (name !== "AbortError") setState((prev) => ({ ...prev, status: ProviderStatus.ERROR }));
        return null;
      });

      const { status, vehicles, last_id, end } = await response?.json().catch(() => null) || {};
      if (status === STATUS_OK && vehicles) {
        setState((prev) => ({
          ...prev,
          status: ProviderStatus.LOADED,
          vehicles,
        }));
        setHasNext(!end);
        setLastID(last_id || "");
      } else if (status === STATUS_ERROR) {
        setState((prev) => ({ ...prev, status: ProviderStatus.ERROR }));
      }
    })();

    return () => controller.abort();
  }, [token, uuid]);

  const value = useMemo(() => ({ ...state, next, hasNext }), [state, hasNext]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
