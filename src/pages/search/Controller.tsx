import React from "react";
import { useSearchParams } from "react-router-dom";
import SearchView from "./View";
import { SearchTypes, SearchProvider } from "../../Providers/SearchProvider";

const Controller = () => {
  const [search] = useSearchParams();
  const query = search.get("q") || undefined;
  const type = search.get("type") || "";
  const parsedType = ["all", "vehicles", "lists"].includes(type) ? type as SearchTypes : "all";

  return (
    <SearchProvider query={query} type={parsedType}>
      <SearchView />
    </SearchProvider>
  );
}

export default Controller;
