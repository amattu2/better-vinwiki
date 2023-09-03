import React, { useState, FC, useEffect, useMemo } from "react";
import { useAuthProvider } from "./AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";
import { useSessionStorage } from "usehooks-ts";

export type ProviderState = {
  status: ProviderStatus;
  posts: FeedPost[];
  count: number;
  next?: () => boolean;
  prev?: () => boolean;
}

export enum ProviderStatus {
  LOADING = "LOADING",
  RELOADING = "RELOADING",
  LOADED = "LOADED",
  ERROR = "ERROR",
}

const defaultState: ProviderState = { status: ProviderStatus.LOADING, posts: [], count: 0 };

const Context = React.createContext<ProviderState | null>(null);

export const useFeedProvider = (): ProviderState => {
  const contextState = React.useContext(Context);

  if (contextState === null) {
    throw new Error("useFeedProvider must be used within a FeedProvider");
  }

  return contextState;
};

type Props = {
  filtered: boolean;
  children?: React.ReactNode;
};

export const FeedProvider: FC<Props> = ({ filtered, children }: Props) => {
  const { token, user } = useAuthProvider();
  const [cache, setCache] = useSessionStorage<Pick<ProviderState, "posts" | "count"> | null>("FeedProvider", null);
  const [state, setState] = useState<ProviderState>(cache
    ? { ...defaultState, ...cache, status: ProviderStatus.RELOADING }
    : defaultState
  );

  const next = () : boolean => {
    return false
  };

  const prev = () : boolean => {
    return false;
  };

  useEffect(() => {
    if (!token || !user?.uuid) {
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    setState((prev) => ({
      ...prev,
      status: prev.posts?.length > 0 ? ProviderStatus.RELOADING : ProviderStatus.LOADING,
    }));

    (async () => {
      const response = await fetch((filtered ? ENDPOINTS.filtered_feed : ENDPOINTS.feed) + user.uuid, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }).catch(() => null);

      const { status, count, feed } = await response?.json() || {};
      if (status === STATUS_OK) {
        setState({
          status: ProviderStatus.LOADED,
          posts: feed?.map((post: any) => post.post),
          count: count,
        });
      }
    })();

    return () => controller.abort();
  }, [filtered, token, user?.uuid]);

  useEffect(() => {
    setCache({ posts: state?.posts, count: state?.count });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.posts, state?.count]);

  const value = useMemo(() => ({ ...state, next, prev }), [state]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
