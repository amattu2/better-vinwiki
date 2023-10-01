import React, { useState, FC, useEffect, useMemo } from "react";
import { useAuthProvider } from "./AuthProvider";
import { ENDPOINTS, STATUS_ERROR, STATUS_OK } from "../config/Endpoints";

export type ProviderState = {
  status: ProviderStatus;
  count: number;
  vehicles?: Vehicle[];
  addVehicle?: (vehicle: Vehicle) => Promise<boolean>;
  removeVehicle?: (vin: Vehicle["vin"]) => Promise<boolean>;
  hasNext?: boolean;
  next?: (count: number) => Promise<boolean>;
};

export enum ProviderStatus {
  LOADING = "LOADING",
  LOADED = "LOADED",
  LOADING_MORE = "LOADING_MORE",
  ERROR = "ERROR",
}

const defaultState: ProviderState = { status: ProviderStatus.LOADING, count: 0 };

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

  const addVehicle = async (vehicle: Vehicle) : Promise<boolean> => {
    if (!token || !uuid || !vehicle?.vin) {
      return false;
    }

    const response = await fetch(`${ENDPOINTS.list_add_vehicle}${uuid}/${vehicle.vin}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => null);

    const { status, list } = await response?.json().catch(() => null) || {};
    if (status !== STATUS_OK || !list?.uuid) {
      return false;
    }

    let result = true;
    setState((prev) => {
      if (prev.count === list?.vehicles?.count || prev.vehicles?.find((v) => v.vin === vehicle.vin)) {
        result = false;
        return prev;
      }

      const newCount = list?.vehicles?.count || prev.count + 1;

      return { ...prev, count: newCount, vehicles: [...(prev.vehicles || []), vehicle] };
    });

    return result;
  };

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

    const { status, total, vehicles, last_id, end } = await response.json();
    if (status === STATUS_OK) {
      setState((prev) => ({
        ...prev,
        status: ProviderStatus.LOADED,
        count: parseInt(total, 10),
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

      const { status, total, vehicles, last_id, end } = await response?.json().catch(() => null) || {};
      if (status === STATUS_OK && vehicles) {
        setState((prev) => ({
          ...prev,
          status: ProviderStatus.LOADED,
          count: parseInt(total, 10),
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

  const value = useMemo(() => ({ ...state, addVehicle, next, hasNext }), [state, hasNext]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
