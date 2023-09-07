import React, { useState, FC, useEffect, useMemo } from "react";
import { useAuthProvider } from "./AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";

export type ProviderState = {
  status: ProviderStatus;
  list?: List;
  vehicles?: Vehicle[];
  following?: boolean;
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

const fetchList = async (uuid: string, token: string): Promise<ListResponse | null> => {
  const response = await fetch(ENDPOINTS.list + uuid, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { status, list } = await response.json();
  if (status === STATUS_OK) {
    return list as ListResponse;
  }

  return null;
};

const fetchFollowing = async (uuid: string, token: string): Promise<boolean> => {
  const response = await fetch(ENDPOINTS.list_following + uuid, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { status, following } = await response.json();
  if (status === STATUS_OK) {
    return !!following;
  }

  return false;
};

type Props = {
  uuid: string;
  children?: React.ReactNode;
};

export const ListProvider: FC<Props> = ({ uuid, children }: Props) => {
  const { token } = useAuthProvider();
  const [state, setState] = useState<ProviderState>(defaultState);
  const [lastID, setLastID] = useState<string>("");
  const [hasMore, setHasMore] = useState<boolean>(false);

  const next = async (count = 1000) : Promise<boolean> => {
    if (!token || !hasMore || !lastID) {
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
      setHasMore(!end);
      setLastID(last_id || "");
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
      const [list, following] = (await Promise.allSettled([
        fetchList(uuid, token),
        fetchFollowing(uuid, token),
      ])).map((r) => (r.status === "fulfilled" ? r.value : null));

      if (list) {
        const { vehicles } = list as ListResponse;

        setState({
          status: ProviderStatus.LOADED,
          list: list as List,
          vehicles: vehicles?.vehicles,
          following: following as boolean,
        });
        setHasMore(!vehicles?.end);
        setLastID(vehicles?.last_id || "");
      } else {
        setState({ status: ProviderStatus.ERROR });
      }
    })();
  }, [token, uuid]);

  const value = useMemo(() => ({ ...state, next, hasMore }), [state, hasMore]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
