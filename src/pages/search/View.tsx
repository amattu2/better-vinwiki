import React, { FC } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, Link } from "react-router-dom";
import { SearchResult, ProviderStatus, useSearchProvider } from "../../Providers/SearchProvider";

type Inputs = {
  query: string,
  type: "all" | "vehicles" | "lists",
}

const View : FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSearch] = useSearchParams();
  const { register, handleSubmit } = useForm<Inputs>();
  const { status, query, type, results, recents } = useSearchProvider();

  const onSubmit = async ({ query, type }: Inputs) => {
    setSearch({
      q: query,
      type
    });
  };

  return (
    <div>
      <h1>Search</h1>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            type="text"
            placeholder="Search Query"
            {...register("query", {
              required: false,
              value: query
            })}
          />
          <br />
          <input
            type="radio"
            {...register("type", {
              required: false,
            })}
            value="all"
            defaultChecked={type === "all"}
            id="radio-all"
          />
          <label htmlFor="radio-all">All</label>
          <input
            type="radio"
            {...register("type", {
              required: false,
            })}
            value="vehicles"
            defaultChecked={type === "vehicles"}
            id="radio-vehicles"
          />
          <label htmlFor="radio-vehicles">Vehicles</label>
          <input
            type="radio"
            {...register("type", {
              required: false,
            })}
            value="lists"
            defaultChecked={type === "lists"}
            id="radio-lists"
          />
          <label htmlFor="radio-lists">Lists</label>
          <br />
          <input type="submit" />
        </form>
      </div>
      {(recents && recents.length > 0) && (
        <div>
          <h2>Recent Vehicle Searches</h2>
          <ul>
            {recents.map((vehicle: Vehicle) => (
              <li key={vehicle.vin}>
                <Link to={`/vehicle/${vehicle.vin}`}>{vehicle.long_name ?? vehicle.vin}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {query && (
        <>
          <h2>Results</h2>
          {(status === ProviderStatus.LOADING) && (
            <div>Loading...</div>
          )}
          {(status === ProviderStatus.LOADED && results) && (
            <div>
              <ul>
                {results.map(({ type, result }: SearchResult) => {
                  if (type === "vehicle") {
                    return (
                      <li key={result.vin}>
                        <Link to={`/vehicle/${result.vin}`}>{result.long_name ?? result.vin}</Link>
                      </li>
                    );
                  } else if (type === "list") {
                    return (
                      <li key={result.uuid}>
                        <Link to={`/list/${result.uuid}`}>{result.name ?? "No name"} &ndash; {result.owner?.username}</Link>
                      </li>
                    );
                  }

                  return null;
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default View;
