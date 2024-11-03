import React from "react";
import { useReadLocalStorage } from "usehooks-ts";
import FeedView from "./View";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { FeedProvider } from "../../Providers/FeedProvider";
import { CacheKeys } from "../../config/Cache";

const Controller = () => {
  const { profile } = useAuthProvider();
  const filteredFeed = useReadLocalStorage<boolean>(CacheKeys.FEED_TYPE);

  return (
    <FeedProvider
      type={filteredFeed ? "filtered" : "feed"}
      identifier={profile?.uuid || ""}
      limit={30}
    >
      <FeedView />
    </FeedProvider>
  );
};

export default Controller;
