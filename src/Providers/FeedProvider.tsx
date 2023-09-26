import React, { useState, FC, useEffect, useMemo } from "react";
import { useSessionStorage } from "usehooks-ts";
import { useAuthProvider } from "./AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../config/Endpoints";
import { CacheKeys } from "../config/Cache";

type FeedType = "profile" | "feed" | "vehicle" | "filtered";

export type ProviderState = {
  status: ProviderStatus;
  posts: FeedPost[];
  count: number;
  next?: (count: number) => Promise<boolean>;
  addPost?: (post: FeedPost) => boolean;
  removePost?: (uuid: FeedPost["uuid"]) => boolean;
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

const getFeedUrl = (type: FeedType, identifier: string, count: number, nextPage = ""): string => {
  let baseurl;
  switch (type) {
    case "feed":
      baseurl = `${ENDPOINTS.feed}`;
      break;
    case "profile":
      baseurl = `${ENDPOINTS.posts}`;
      break;
    case "vehicle":
      baseurl = `${ENDPOINTS.vehicle_feed}`;
      break;
    case "filtered":
      baseurl = `${ENDPOINTS.filtered_feed}`;
      break;
    default:
      throw new Error("Invalid feed type received");
  }

  baseurl += `${identifier}/${count}`;
  baseurl += nextPage ? `/${nextPage}` : "";

  return baseurl;
};

type Props = {
  type: FeedType;
  identifier: Profile["uuid"] | Vehicle["vin"];
  limit: number;
  children?: React.ReactNode;
};

/**
 * A general purpose feed provider.
 *
 * Supports:
 * - Profile Feeds
 * - Vehicle Feeds
 * - Home Feed
 *
 * Note: You must provide a `key` prop with the `identifier` as the value to ensure
 * the component is re-rendered when the identifier changes.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
export const FeedProvider: FC<Props> = ({ type, identifier, limit, children }: Props) => {
  const { token } = useAuthProvider();

  const cacheKey = `${CacheKeys.FEED}_${type}_${identifier}`;
  const [cache, setCache] = useSessionStorage<Pick<ProviderState, "posts" | "count"> | null>(cacheKey, null);
  const [state, setState] = useState<ProviderState>(cache
    ? { ...defaultState, ...cache, status: ProviderStatus.RELOADING }
    : defaultState);
  const [nextPage, setNextPage] = useState<string>("");

  const addPost = (post: FeedPost): boolean => {
    if (!post.uuid) {
      return false;
    }

    setState((prev) => ({ ...prev, posts: [post, ...prev.posts], count: prev.count + 1 }));

    return true;
  };

  const removePost = (uuid: string): boolean => {
    if (!token || !uuid) {
      return false;
    }

    setState((prev) => ({ ...prev, posts: prev.posts.filter((post) => post.uuid !== uuid), count: prev.count - 1 }));

    return false;
  };

  const next = async (count = limit): Promise<boolean> => {
    if (!nextPage || !token || !identifier) {
      return false;
    }

    setState((prev) => ({ ...prev, status: ProviderStatus.RELOADING }));

    const response = await fetch(getFeedUrl(type, identifier, count, nextPage), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => null);

    const { status, count: postCount, next_page_uuid, end, feed, posts } = await response?.json() || {};
    if (status === STATUS_OK) {
      setState((prev) => ({
        status: ProviderStatus.LOADED,
        posts: [...prev.posts, ...((feed || posts)?.map((post: { post: FeedPost }) => post.post) || [])],
        count: postCount + prev.count,
        hasNext: !end && next_page_uuid,
      }));
      setNextPage(next_page_uuid && !end ? next_page_uuid : "");

      return true;
    }

    return false;
  };

  useEffect(() => {
    if (!token || !identifier) {
      return () => null;
    }

    const controller = new AbortController();
    const { signal } = controller;

    setState((prev) => ({
      ...prev,
      status: prev.posts?.length > 0 ? ProviderStatus.RELOADING : ProviderStatus.LOADING,
    }));

    (async () => {
      const response = await fetch(getFeedUrl(type, identifier, limit), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }).catch(() => null);

      // NOTE: Either `feed` or `posts` will be returned, depending on the type of feed requested
      const { status, count, next_page_uuid, end, feed, posts } = await response?.json() || {};
      if (status === STATUS_OK) {
        setState({
          status: ProviderStatus.LOADED,
          posts: (feed || posts)?.map((post: { post: FeedPost }) => post.post),
          count,
          hasNext: !end && next_page_uuid,
        });
        setNextPage(next_page_uuid && !end ? next_page_uuid : "");
      }
    })();

    return () => controller.abort();
  }, [type, identifier, limit, token]);

  useEffect(() => {
    setCache({ posts: state?.posts, count: state?.count });
  }, [state?.posts, state?.count]);

  const value = useMemo(() => ({ ...state, next, addPost, removePost }), [state]);

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
};
