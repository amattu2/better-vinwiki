import React, { useState, FC, useEffect, useMemo } from "react";
import { useAuthProvider } from "./AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";

export type ProviderState = {
  status: ProviderStatus;
  results: Vehicle[];
  recents?: Vehicle[];
  query?: string;
  count: number;
  next?: () => boolean;
  prev?: () => boolean;
}

export enum ProviderStatus {
  LOADING = "LOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

const defaultState: ProviderState = { status: ProviderStatus.LOADING, results: [], count: 0 };

const Context = React.createContext<ProviderState | null>(null);

export const useSearchProvider = (): ProviderState => {
  const contextState = React.useContext(Context);

  if (contextState === null) {
    throw new Error("useSearchProvider must be used within a SearchProvider");
  }

  return contextState;
};

type Props = {
  query?: string;
  children?: React.ReactNode;
};

export const SearchProvider: FC<Props> = ({ query, children }: Props) => {
  const { token } = useAuthProvider();
  const [state, setState] = useState<ProviderState>({ ...defaultState, query });

  const next = () : boolean => {
    return false
  };

  const prev = () : boolean => {
    return false;
  };

  // Fetch recent VINs
  useEffect(() => {
    if (!token) {
      setState((prev) => ({ ...prev, recents: [] }));
      return;
    }

    (async () => {
      const response = await fetch(ENDPOINTS.recent_vins, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { status, recent_vins } = await response.json();
      if (status === STATUS_OK) {
        setState((prev) => ({ ...prev, recents: recent_vins }));
      }
    })();
  }, [token]);

  useEffect(() => {
    setState((prev) => ({
      ...defaultState,
      recents: prev.recents,
      query,
    }));

    if (!token || !query) {
      return;
    }


    (async () => {
      const response = await fetch(ENDPOINTS.search, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      const { status, results } = await response.json();
      if (status === STATUS_OK) {
        setState((prev) => ({
          ...prev,
          status: ProviderStatus.LOADED,
          results: results?.vehicles,
          count: results?.count,
        }));
      }
    })();
  }, [token, query]);

  const value = useMemo(() => ({ ...state, next, prev }), [state]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
