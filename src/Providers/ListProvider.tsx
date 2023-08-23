import React, { useState, FC, useEffect} from "react";
import { useAuthProvider } from "./AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";

export type ProviderState = {
  status: ProviderStatus;
  list?: List;
  vehicles?: Vehicle[];
  following?: boolean; // TODO: Determine how to fetch this information
  next?: () => boolean;
  prev?: () => boolean;
};

export enum ProviderStatus {
  LOADING = "LOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

const defaultState: ProviderState = { status: ProviderStatus.LOADING };

const Context = React.createContext<ProviderState | null>(null);

export const useListProvider = (): ProviderState => {
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

export const ListProvider: FC<Props> = ({ uuid, children }: Props) => {
  const { token } = useAuthProvider();
  const [state, setState] = useState<ProviderState>(defaultState);

  useEffect(() => {
    if (!token || !uuid) {
      return;
    }

    setState(defaultState);

    (async () => {
      const response = await fetch(ENDPOINTS.list + uuid, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { status, list } = await response.json();
      if (status === STATUS_OK) {
        const { vehicles } = list as ListResponse;
        delete list.vehicles;

        setState({
          status: ProviderStatus.LOADED,
          list: list,
          vehicles: vehicles?.vehicles,
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
