import React from "react";
import { useReadLocalStorage } from "usehooks-ts";
import FeedView from "./View";
import { FeedProvider } from "../../Providers/FeedProvider";

const Controller = () => {
  const filteredFeed = useReadLocalStorage<boolean>("filteredFeed");

  return (
    <FeedProvider filtered={!!filteredFeed} limit={20}>
      <FeedView />
    </FeedProvider>
  );
}

export default Controller;
