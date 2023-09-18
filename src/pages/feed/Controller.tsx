import React from "react";
import { useReadLocalStorage } from "usehooks-ts";
import FeedView from "./View";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { FeedProvider } from "../../Providers/FeedProvider";

const Controller = () => {
  const { profile } = useAuthProvider();
  const filteredFeed = useReadLocalStorage<boolean>("filteredFeed");

  return (
    <FeedProvider type={filteredFeed ? "filtered" : "feed"} identifier={profile!.uuid} limit={30}>
      <FeedView />
    </FeedProvider>
  );
};

export default Controller;
