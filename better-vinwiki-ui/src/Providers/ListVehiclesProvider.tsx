/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import React, { useState, FC, useEffect, useMemo } from "react";
import { useAuthProvider } from "./AuthProvider";
import { ENDPOINTS, STATUS_ERROR, STATUS_OK } from "../config/Endpoints";
import { validateVIN } from "../utils/vehicle";

export type ProviderState = {
  status: ProviderStatus;
  count: number;
  vehicles?: Vehicle[];
  hasNext?: boolean;
  /**
   * Add a vehicle to the list
   *
   * @param vehicles The vehicles to add
   * @returns Promise<number> The number of vehicles added
   */
  addVehicles?: (vehicles: Vehicle[]) => Promise<number>;
  /**
   * Will add `vins` to the list and refetch the list vehicles
   *
   * NOTE: This is used in place of `addVehicles` when we don't
   * have a `Vehicle` object to work from.
   *
   * @param vins The VINs to add to the list
   * @returns Promise<number> The number of vehicles added
   */
  addVins?: (vins: Vehicle["vin"][]) => Promise<number>;
  /**
   * Removes vehicles from the list
   *
   * @param vins The VINs to remove from the list
   * @returns Promise<number> The number of vehicles removed
   */
  removeVehicles?: (vins: Vehicle["vin"][]) => Promise<number>;
  /**
   * Fetch the next `count` vehicles from the list
   *
   * @param count The number of vehicles to fetch
   * @returns Promise<boolean> Whether the operation was successful
   */
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

  const removeVehicles = async (vins: Vehicle["vin"][]): Promise<number> => {
    if (!token || !uuid || !vins?.length) {
      return 0;
    }

    let count = 0;
    for (const vin of vins) {
      if (!state.vehicles?.find((v) => v.vin === vin)) {
        continue;
      }

      const response = await fetch(`${ENDPOINTS.list_remove_vehicle}${uuid}/${vin}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => null);

      const { status, list } = (await response?.json().catch(() => null)) || {};
      if (status !== STATUS_OK || !list?.uuid) {
        continue;
      }

      setState((prev) => ({
        ...prev,
        count: list?.vehicles?.count || prev.count - 1,
        vehicles: prev.vehicles?.filter((v) => v.vin !== vin),
      }));
      count += 1;
    }

    return count;
  };

  const addVehicles = async (vehicles: Vehicle[]): Promise<number> => {
    if (!token || !uuid) {
      return 0;
    }

    let count = 0;
    for (const vehicle of vehicles) {
      if (state.vehicles?.find((v) => v.vin === vehicle.vin)) {
        continue;
      }

      const response = await fetch(`${ENDPOINTS.list_add_vehicle}${uuid}/${vehicle.vin}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => null);

      const { status, list } = (await response?.json().catch(() => null)) || {};
      if (status !== STATUS_OK || !list?.uuid) {
        continue;
      }

      setState((prev) => ({
        ...prev,
        count: list?.vehicles?.count || prev.count + 1,
        vehicles: [...(prev.vehicles || []), vehicle],
      }));
      count += 1;
    }

    return count;
  };

  const addVins = async (vins: Vehicle["vin"][]): Promise<number> => {
    if (!token || !uuid || !vins?.length) {
      return 0;
    }

    for (const vin of vins) {
      if (!vin || !validateVIN(vin)) {
        continue;
      }

      const response = await fetch(`${ENDPOINTS.list_add_vehicle}${uuid}/${vin}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => null);

      const { status, list } = (await response?.json().catch(() => null)) || {};
      if (status !== STATUS_OK || !list?.uuid) {
        continue;
      }
    }

    const response = await fetch(`${ENDPOINTS.list_vehicles}${uuid}/${state.count + vins.length}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => null);

    const { status, total, vehicles, last_id, end } =
      (await response?.json().catch(() => null)) || {};
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

    const addedCount = parseInt(total, 10) - state.count;
    return addedCount > 0 ? addedCount : 0;
  };

  const next = async (count = 1000): Promise<boolean> => {
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

      const { status, total, vehicles, last_id, end } =
        (await response?.json().catch(() => null)) || {};
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
      } else {
        setState((prev) => ({ ...prev, status: ProviderStatus.LOADED }));
      }
    })();

    return () => controller.abort();
  }, [token, uuid]);

  const value: ProviderState = useMemo(
    () => ({ ...state, addVehicles, removeVehicles, next, addVins, hasNext }),
    [state, hasNext]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};
