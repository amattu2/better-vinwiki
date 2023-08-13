import React, { useState, FC, useEffect, useMemo } from "react";
import { useUserProvider } from "./UserProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";

export type ProviderState = {
  status: ProviderStatus;
  posts: FeedPost[];
  count: number;
  next?: () => boolean;
  prev?: () => boolean;
}

export enum ProviderStatus {
  LOADING = "LOADING",
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
  children: React.ReactNode;
};

export const FeedProvider: FC<Props> = ({ filtered, children }: Props) => {
  const { token, user } = useUserProvider();
  const [state, setState] = useState<ProviderState>(defaultState);

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

    setState(defaultState);

    (async () => {
      const response = await fetch((filtered ? ENDPOINTS.filtered_feed : ENDPOINTS.feed) + user.uuid, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { status, count, feed } = await response.json();
      if (status === STATUS_OK) {
        setState({
          status: ProviderStatus.LOADED,
          posts: feed?.map((post: any) => post.post),
          count: count,
        });
      }
    })();
  }, [filtered, token, user?.uuid]);

  const value = useMemo(() => ({ ...state, next, prev }), [state]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
