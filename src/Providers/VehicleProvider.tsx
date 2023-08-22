import React, { useState, FC} from "react";

export type ProviderState = {
  status: ProviderStatus;
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
  withFeed?: true;
  withFollowing?: true;
  children?: React.ReactNode;
};

export const VehicleProvider: FC<Props> = ({ vin, children }: Props) => {
  const [state] = useState<ProviderState>(defaultState);

  return (
    <Context.Provider value={state}>
      {children}
    </Context.Provider>
  );
};
