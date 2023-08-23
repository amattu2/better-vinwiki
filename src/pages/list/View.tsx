import React, { FC } from "react";
import { ProviderStatus, useListProvider } from "../../Providers/ListProvider";

const View : FC = () => {
  const { status, list, vehicles } = useListProvider();

  if (status === ProviderStatus.LOADING) {
    return <span>Loading...</span>;
  }

  if (status === ProviderStatus.ERROR) {
    return <span>Something went wrong!</span>;
  }

  return (
    <div>
      <h1>{list?.name}</h1>
      <p>{list?.description}</p>
      <br/>
      {"Followers: "}
      <strong>{list?.follower_count}</strong>
      {" | Vehicles: "}
      <strong>{list?.vehicle_count}</strong>
      {" | Owned By: "}
      <strong>{list?.owner?.username}</strong>
      <h2>Vehicles</h2>
      <ul>
        {vehicles?.map((vehicle: Vehicle) => (
          <li key={vehicle.vin}>
            <a href={`/vehicle/${vehicle.vin}`}>{vehicle.long_name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default View;
