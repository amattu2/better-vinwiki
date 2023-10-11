import { useEffect, useRef, useState } from "react";
import { useAuthProvider } from "../Providers/AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";

export enum LookupStatus {
  Loading = "loading",
  LoadingMore = "loading_more",
  Success = "success",
  Error = "error",
}

export type SearchType = "Vehicle" | "List" | "Profile";

export type SearchResult<T extends SearchType> =
  T extends "Vehicle" ? Vehicle[] :
    T extends "List" ? List[] :
      T extends "Profile" ? Profile[] :
        never;

export type SearchResponse<T extends SearchType> = {
  type: T;
  count: number;
  hasMore: boolean;
  data: SearchResult<T> | null;
} | null;

const vehicleSearch = async (query: string, limit: number, token: string, signal: AbortSignal): Promise<SearchResponse<"Vehicle">> => {
  // NOTE: We're offsetting by 10 because of some strange bug in the API
  // Where we sometimes get less than `limit` results even though there are more
  const response = await fetch(`${ENDPOINTS.vehicle_search}0/${limit + 10}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
    signal,
  }).catch(() => null);

  const { status, results } = await response?.json() || {};
  const { vehicles } = results || {};
  if (status !== STATUS_OK || !vehicles?.length) {
    return null;
  }

  return {
    type: "Vehicle",
    count: vehicles.length - 10,
    hasMore: vehicles.length > limit,
    data: vehicles.slice(0, limit),
  };
};

const listSearch = async (query: string, token: string, signal: AbortSignal): Promise<SearchResponse<"List">> => {
  const response = await fetch(ENDPOINTS.list_search, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
    signal,
  }).catch(() => null);

  const { status, results } = await response?.json() || {};
  const { lists } = results || {};
  if (status !== STATUS_OK || !lists?.length) {
    return null;
  }

  return {
    type: "List",
    count: lists.length - 1,
    hasMore: false,
    data: lists,
  };
};

const profileSearch = async (query: string, limit: number, token: string, signal: AbortSignal): Promise<SearchResponse<"Profile">> => {
  const response = await fetch(`${ENDPOINTS.profile_search}0/${limit + 1}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
    signal,
  }).catch(() => null);

  const { status, results } = await response?.json() || {};
  const { people } = results || {};
  if (status !== STATUS_OK || !people?.length) {
    return null;
  }

  return {
    type: "Profile",
    count: people.length - 1,
    hasMore: people.length > limit,
    data: people.slice(0, limit),
  };
};

const mapTypeToSearch = async (type: SearchType, query: string, limit: number, token: string, signal: AbortSignal): Promise<SearchResponse<SearchType>> => {
  switch (type) {
    case "Vehicle":
      return vehicleSearch(query, limit, token, signal);
    case "List":
      return listSearch(query, token, signal);
    case "Profile":
      return profileSearch(query, limit, token, signal);
    default:
      return null;
  }
};

/**
 * A hook to search for data by `SearchType`
 *
 * @param uuid the uuid of the user to lookup
 * @param [limit] the number of results to return if the endpoint supports limiting. Default 25
 * @returns [status, SearchResult<SearchType>, setQuery, getNext]
 */
export const useSearch = (type: SearchType, limit = 25): [
  LookupStatus,
  SearchResponse<SearchType>,
  React.Dispatch<React.SetStateAction<string>>,
  (count: number) => Promise<boolean>,
] => {
  const { token } = useAuthProvider();

  const [status, setStatus] = useState<LookupStatus>(LookupStatus.Loading);
  const [data, setData] = useState<SearchResponse<SearchType>>(null);
  const [query, setQuery] = useState<string>("");
  const loadingNext = useRef(false);

  // TODO: cache results for type, query, limit for faster lookup
  // otherwise it will refetch data each time we switch tabs

  const getNext = async (count: number = 250): Promise<boolean> => {
    if (!query || !token || !data?.hasMore || !data?.count) {
      return false;
    }
    if (loadingNext.current) {
      return false;
    }

    setStatus(LookupStatus.LoadingMore);
    loadingNext.current = true;

    const d = await mapTypeToSearch(type, query, data.count + count, token, new AbortController().signal);
    if (!d) {
      setStatus(LookupStatus.Error);
      loadingNext.current = false;
      return false;
    }

    setStatus(LookupStatus.Success);
    setData(d);
    loadingNext.current = false;

    return true;
  };

  useEffect(() => {
    if (!token || query?.trim().length <= 1) {
      setStatus(LookupStatus.Success);
      setData(null);
      return () => {};
    }

    setStatus(LookupStatus.Loading);

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

  return [status, data, setQuery, getNext];
};

export default useSearch;
