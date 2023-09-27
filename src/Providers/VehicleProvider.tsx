import React, { useState, FC, useEffect, useMemo } from "react";
import { useAuthProvider } from "./AuthProvider";
import { ENDPOINTS, MEDIA_ENDPOINTS, STATUS_ERROR, STATUS_OK } from "../config/Endpoints";

export type ProviderState = {
  status: ProviderStatus;
  vehicle?: VehicleResponse;
  editVehicle?: (vehicle: EditVehicleInput) => Promise<boolean>;
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

type Props = {
  vin: Vehicle["vin"];
  children?: React.ReactNode;
};

export const VehicleProvider: FC<Props> = ({ vin, children }: Props) => {
  const { token } = useAuthProvider();
  const [state, setState] = useState<ProviderState>(defaultState);

  const editVehicle = async ({ image, ...vehicle }: EditVehicleInput): Promise<boolean> => {
    if (!token || !vin || !vehicle) {
      return false;
    }

    if (image?.[0]) {
      const formData = new FormData();
      formData.append("media", image?.[0]);

      const response = await fetch(MEDIA_ENDPOINTS.vehicle_image + vin, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }).catch(() => null);

      const { status, image: result } = await response?.json() || {};
      if (status === STATUS_OK && result?.uuid) {
        vehicle.image_uuid = result.uuid;
      }
    }

    const response = await fetch(`${ENDPOINTS.vehicle_update}${vin}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(vehicle),
    }).catch(() => null);

    const { status } = await response?.json() || {};
    if (status === STATUS_OK) {
      setState((prev) => ({
        ...prev,
        vehicle: {
          ...prev.vehicle!,
          ...vehicle,
          // NOTE: Rendering the new image takes a few minutes. Hide the old one until then.
          poster_photo: (vehicle.image_uuid ? null : prev.vehicle?.poster_photo) || "",
        },
      }));
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (!token || !vin) {
      return () => {};
    }

    setState(defaultState);

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const response = await fetch(ENDPOINTS.vehicle + vin, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }).catch(({ name }) => {
        if (name !== "AbortError") setState({ status: ProviderStatus.ERROR });
        return null;
      });

      const { status, vehicle } = await response?.json() || {};
      if (status === STATUS_OK) {
        setState({
          status: ProviderStatus.LOADED,
          vehicle: vehicle as VehicleResponse,
        });
      } else if (status === STATUS_ERROR) {
        setState({ status: ProviderStatus.ERROR });
      }
    })();

    return () => controller.abort();
  }, [token, vin]);

  const value = useMemo(() => ({ ...state, editVehicle }), [state]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
