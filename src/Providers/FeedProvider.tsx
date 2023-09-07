import React, { useState, FC, useEffect, useMemo } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useAuthProvider } from "./AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";

export type ProviderState = {
  status: ProviderStatus;
  posts: FeedPost[];
  count: number;
  next?: (count: number) => Promise<boolean>;
  deletePost?: (uuid: string) => Promise<boolean>;
  createPost?: (post: FeedPost) => Promise<boolean>;
  hasNext?: boolean;
};

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
  limit: number;
  children?: React.ReactNode;
};

export const FeedProvider: FC<Props> = ({ filtered, limit, children }: Props) => {
  const { token, user } = useAuthProvider();
  const [cache, setCache] = useSessionStorage<Pick<ProviderState, "posts" | "count"> | null>("FeedProvider", null);
  const [state, setState] = useState<ProviderState>(cache
    ? { ...defaultState, ...cache, status: ProviderStatus.RELOADING }
    : defaultState);
  const [nextPage, setNextPage] = useState<string>("");

  const createPost = async (post: FeedPost): Promise<boolean> => {
    if (!post.uuid) {
      return false;
    }

    setState((prev) => ({
      ...prev,
      posts: [post, ...prev.posts],
      count: prev.count + 1,
    }));

    return true;
  };

  const deletePost = async (uuid: string): Promise<boolean> => {
    if (!token || !uuid) {
      return false;
    }

    setState((prev) => ({
      ...prev,
      posts: prev.posts.filter((post) => post.uuid !== uuid),
      count: prev.count - 1,
    }));

    const response = await fetch(ENDPOINTS.post_delete + uuid, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => null);

    const { status } = await response?.json() || {};
    if (status === STATUS_OK) {
      return true;
    }

    return true;
  };

  const next = async (count = limit): Promise<boolean> => {
    if (!nextPage || !token || !user?.uuid) {
      return false;
    }

    setState((prev) => ({ ...prev, status: ProviderStatus.RELOADING }));

    const endpoint = `${filtered ? ENDPOINTS.filtered_feed : ENDPOINTS.feed}${user?.uuid}/${count}/${nextPage}`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => null);

    const { status, count: postCount, next_page_uuid, end, feed } = await response?.json() || {};
    if (status === STATUS_OK) {
      setState((prev) => ({
        status: ProviderStatus.LOADED,
        posts: [...prev.posts, ...feed?.map((post: any) => post.post)],
        count: postCount + prev.count,
        hasNext: !end && next_page_uuid,
      }));
      setNextPage(next_page_uuid && !end ? next_page_uuid : "");

      return true;
    }

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
      const endpoint = `${filtered ? ENDPOINTS.filtered_feed : ENDPOINTS.feed}${user.uuid}/${limit}`;
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }).catch(() => null);

      const { status, count, next_page_uuid, end, feed } = await response?.json() || {};
      if (status === STATUS_OK) {
        setState({
          status: ProviderStatus.LOADED,
          posts: feed?.map((post: any) => post.post),
          count,
          hasNext: !end && next_page_uuid,
        });
        setNextPage(next_page_uuid && !end ? next_page_uuid : "");
      }
    })();

    return () => controller.abort();
  }, [filtered, limit, token, user?.uuid]);

  useEffect(() => {
    setCache({ posts: state?.posts, count: state?.count });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.posts, state?.count]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(() => ({ ...state, next, deletePost, createPost }), [state]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
