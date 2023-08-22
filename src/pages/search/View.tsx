import React, { FC } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, Link } from "react-router-dom";
import { ProviderStatus, useSearchProvider } from "../../Providers/SearchProvider";

type Inputs = {
  query: string,
}

const View : FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSearch] = useSearchParams();
  const { register, handleSubmit } = useForm<Inputs>();
  const { status, query, results, recents } = useSearchProvider();

  const onSubmit = async ({ query  }: Inputs) => {
    setSearch({ q: query });
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
          <input type="submit" />
        </form>
      </div>
      {(recents && recents.length > 0) && (
        <div>
          <h2>Recent Searches</h2>
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
                {results.map((vehicle: Vehicle) => (
                  <li key={vehicle.vin}>
                    <Link to={`/vehicle/${vehicle.vin}`}>{vehicle.long_name ?? vehicle.vin}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default View;
