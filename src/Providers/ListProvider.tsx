import React, { useState, FC, useEffect, useMemo} from "react";
import { useAuthProvider } from "./AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";

export type ProviderState = {
  status: ProviderStatus;
  list?: List;
  vehicles?: Vehicle[];
  following?: boolean; // TODO: Determine how to fetch this information
  hasMore?: boolean;
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
  const [hasMore, setHasMore] = useState<boolean>(false);

  const next = async (count = 1000) : Promise<boolean> => {
    if (!hasMore) return false;

    setState((prev) => ({
      ...prev,
      status: ProviderStatus.LOADING_MORE,
    }));

    // NOTE: There is no way to offset the result, so we have to
    // refetch the entire list.
    const newCount = count + (state.vehicles?.length || 0);
    const response = await fetch(`${ENDPOINTS.list_vehicles}${uuid}/${newCount}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { status, vehicles, end } = await response.json();
    if (status === STATUS_OK) {
      vehicles?.sort((a: Vehicle, b: Vehicle) => a.long_name.localeCompare(b.long_name));

      setState((prev) => ({
        ...prev,
        status: ProviderStatus.LOADED,
        vehicles: vehicles,
      }));
      setHasMore(!end);
      return true;
    }

    return false;
  };

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
        vehicles.vehicles?.sort((a: Vehicle, b: Vehicle) => a.long_name.localeCompare(b.long_name));

        setState({
          status: ProviderStatus.LOADED,
          list: list,
          vehicles: vehicles?.vehicles,
        });
        setHasMore(!vehicles?.end);
      } else {
        setState({
          status: ProviderStatus.ERROR,
        });
      }
    })();
  }, [token, uuid]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(() => ({ ...state, next, hasMore }), [state, hasMore]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
