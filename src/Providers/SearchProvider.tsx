import React, { useState, FC, useEffect, useMemo } from "react";
import { useAuthProvider } from "./AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";

export type SearchTypes = "all" | "vehicles" | "lists";

export type VehicleResult = {
  type: "vehicle";
  result: Vehicle;
};

export type ListResult = {
  type: "list";
  result: List;
};

export type SearchResult = VehicleResult | ListResult;

export type ProviderState = {
  status: ProviderStatus;
  results: SearchResult[];
  recents?: Vehicle[];
  query?: string;
  type?: SearchTypes;
  count: number;
  next?: () => boolean;
  prev?: () => boolean;
};

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

const vehicleSearch = async (query: string, token: string, signal: AbortSignal) => {
  const response = await fetch(ENDPOINTS.vehicle_search, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
    signal,
  }).catch(() => null);

  const { status, results } = await response?.json() || {};

  return status === STATUS_OK && results.vehicles ? results.vehicles : null;
};

const listSearch = async (query: string, token: string, signal: AbortSignal) => {
  const response = await fetch(ENDPOINTS.list_search, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
    signal,
  }).catch(() => null);

  const { status, results } = await response?.json() || {};

  return status === STATUS_OK && results.lists ? results.lists : null;
};

type Props = {
  query?: string;
  type: SearchTypes;
  children?: React.ReactNode;
};

export const SearchProvider: FC<Props> = ({ query, type, children }: Props) => {
  const { token } = useAuthProvider();
  const [state, setState] = useState<ProviderState>({ ...defaultState, query, type });

  const next = () : boolean => false;

  const prev = () : boolean => false;

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
      type,
    }));

    if (!token || !query) {
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const [vehicles, lists] = (await Promise.allSettled([
        type !== "lists" ? vehicleSearch(query, token, signal) : null,
        type !== "vehicles" ? listSearch(query, token, signal) : null,
      ])).map((r) => (r.status === "fulfilled" ? r.value : null));

      if (vehicles || lists) {
        const results: SearchResult[] = [
          ...(vehicles?.map((v: Vehicle) => ({ type: "vehicle", result: v })) ?? []),
          ...(lists?.map((l: List) => ({ type: "list", result: l })) ?? []),
        ].filter((r) => r !== null);

        results.sort((a, b) => {
          const aTerm = a.type === "vehicle" ? a.result?.long_name : a.result?.name;
          const bTerm = b.type === "vehicle" ? b.result?.long_name : b.result?.name;

          return aTerm?.localeCompare(bTerm ?? "") ?? 0;
        });

        setState((prev) => ({
          ...prev,
          status: ProviderStatus.LOADED,
          results,
          count: results.length,
        }));
      }
    })();

    return () => controller.abort();
  }, [token, type, query]);

  const value = useMemo(() => ({ ...state, next, prev }), [state]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
