import React, { useState, FC, useEffect } from "react";
import { useAuthProvider } from "./AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";

export type ProviderState = {
  status: ProviderStatus;
  vehicle?: VehicleResponse;
};

export enum ProviderStatus {
  LOADING = "LOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

const defaultState: ProviderState = { status: ProviderStatus.LOADING };

const Context = React.createContext<ProviderState | null>(null);

export const useVehicleProvider = (): ProviderState => {
  const contextState = React.useContext(Context);

  if (contextState === null) {
    throw new Error("useVehicleProvider must be used within a VehicleProvider");
  }

  return contextState;
};

const fetchVehicle = async (vin: Vehicle["vin"], token: string): Promise<VehicleResponse> => {
  const response = await fetch(ENDPOINTS.vehicle + vin, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { status, vehicle } = await response.json();
  if (status === STATUS_OK) {
    return vehicle;
  }

  throw new Error("Error fetching vehicle");
};

type Props = {
  vin: Vehicle["vin"];
  children?: React.ReactNode;
};

export const VehicleProvider: FC<Props> = ({ vin, children }: Props) => {
  const { token } = useAuthProvider();
  const [state, setState] = useState<ProviderState>(defaultState);

  useEffect(() => {
    if (!token || !vin) {
      return;
    }

    setState(defaultState);

    (async () => {
      const [vehicle] = (await Promise.allSettled([
        fetchVehicle(vin, token),
      ])).map((r) => (r.status === "fulfilled" ? r.value : null));

      if (vehicle) {
        setState({
          status: ProviderStatus.LOADED,
          vehicle: vehicle as VehicleResponse,
        });
      } else {
        setState({
          status: ProviderStatus.ERROR,
        });
      }
    })();
  }, [token, vin]);

  return (
    <Context.Provider value={state}>
      {children}
    </Context.Provider>
  );
};
