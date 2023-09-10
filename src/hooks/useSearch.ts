import { useEffect, useState } from "react";
import { useAuthProvider } from "../Providers/AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";

export enum LookupStatus {
  Loading = "loading",
  Success = "success",
  Error = "error",
}

export type SearchType = "Vehicle" | "List" | "Profile";

export type SearchResult<T extends SearchType> = T extends "Vehicle"
  ? Vehicle[] : T extends "List"
    ? List[] : T extends "Profile"
      ? Profile[] : never;

const vehicleSearch = async (query: string, limit: number, token: string, signal: AbortSignal): Promise<Vehicle[]> => {
  const response = await fetch(`${ENDPOINTS.vehicle_search}0/${limit}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
    signal,
  }).catch(() => null);

  const { status, results } = await response?.json() || {};

  return status === STATUS_OK && results?.vehicles ? results.vehicles : [];
};

const listSearch = async (query: string, token: string, signal: AbortSignal): Promise<List[]> => {
  const response = await fetch(ENDPOINTS.list_search, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
    signal,
  }).catch(() => null);

  const { status, results } = await response?.json() || {};
  return status === STATUS_OK && results?.lists ? results.lists : [];
};

const profileSearch = async (query: string, limit: number, token: string, signal: AbortSignal): Promise<Profile[]> => {
  const response = await fetch(`${ENDPOINTS.profile_search}0/${limit}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
    signal,
  }).catch(() => null);

  const { status, results } = await response?.json() || {};
  return status === STATUS_OK && results?.people ? results.people : [];
};

const mapTypeToSearch = async (type: SearchType, query: string, limit: number, token: string, signal: AbortSignal): Promise<SearchResult<SearchType>> => {
  switch (type) {
    case "Vehicle":
      return vehicleSearch(query, limit, token, signal);
    case "List":
      return listSearch(query, token, signal);
    case "Profile":
      return profileSearch(query, limit, token, signal);
    default:
      return [];
  }
};

/**
 * A hook to search for SearchType
 *
 * @param uuid the uuid of the user to lookup
 * @param [limit] the number of results to return if the endpoint supports limiting. Default 25
 * @returns [status, SearchResult<SearchType>, setQuery]
 */
export const useSearch = (type: SearchType, limit = 25): [
  LookupStatus,
  SearchResult<SearchType>,
  React.Dispatch<React.SetStateAction<string>>,
] => {
  const { token } = useAuthProvider();

  const [status, setStatus] = useState<LookupStatus>(LookupStatus.Loading);
  const [data, setData] = useState<SearchResult<SearchType>>([]);
  const [query, setQuery] = useState<string>("");

  // TODO: cache results for type, query, limit for faster lookup
  // otherwise it will refetch data each time we switch tabs

  useEffect(() => {
    if (!token || query?.trim().length <= 1) {
      setStatus(LookupStatus.Success);
      setData([]);
      return () => {};
    }

    setStatus(LookupStatus.Loading);
    setData([]);

    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const d = await mapTypeToSearch(type, query, limit, token, signal);

      if (signal.aborted) {
        return;
      }
      if (!d) {
        setStatus(LookupStatus.Error);
        return;
      }

      setStatus(LookupStatus.Success);
      setData(d);
    })();

    return () => controller.abort();
  }, [type, query, limit]);

  return [status, data, setQuery];
};

export default useSearch;
