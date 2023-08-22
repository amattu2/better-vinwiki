import React, { FC } from "react";
import { ProviderStatus, useVehicleProvider } from "../../Providers/VehicleProvider";

const View : FC = () => {
  const { status, vehicle, posts, following } = useVehicleProvider();

  if (status === ProviderStatus.LOADING) {
    return <span>Loading...</span>;
  }

  if (status === ProviderStatus.ERROR) {
    return <span>Something went wrong!</span>;
  }

  return (
    <div>
      <h3>Vehicle</h3>
      <strong>VIN:</strong> {vehicle?.vin}
      <br />
      <strong>Make:</strong> {vehicle?.make}
      <br />
      <strong>Model:</strong> {vehicle?.model}
      <br />
      <strong>You are following:</strong> {following ? "Yes" : "No"}
      <h3>Posts</h3>
      {posts?.map((post) => (
        <div key={post.uuid}>
          &ndash; <strong>{post.post_text ?? post.post_date_ago}</strong>
        </div>
      ))}      
    </div>
  );
};

export default View;
