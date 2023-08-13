import React from "react";
import { useSearchParams } from "react-router-dom";
import SearchView from "./View";
import { SearchProvider } from "../../Providers/SearchProvider";

const Controller = () => {
  const [search] = useSearchParams();
  const query = search.get("q") || undefined;

  return (
    <SearchProvider query={query}>
      <SearchView />
    </SearchProvider>
  );
}

export default Controller;
