import React, { FC } from "react";
import { ProviderStatus, useVehicleProvider } from "../../Providers/VehicleProvider";

const View : FC = () => {
  const { status } = useVehicleProvider();

  if (status === ProviderStatus.LOADING) {
    return <span>Loading...</span>;
  }

  if (status === ProviderStatus.ERROR) {
    return <span>Something went wrong!</span>;
  }

  return (
    <div>
      Vehicle View
    </div>
  );
};

export default View;
