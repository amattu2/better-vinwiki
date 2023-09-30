import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { FeedProvider } from "../../Providers/FeedProvider";
import { VehicleProvider } from "../../Providers/VehicleProvider";
import VehicleView from "./View";

const Controller = () => {
  const { vin } = useParams<{ vin: string }>();

  if (!vin) {
    return <Navigate to="/" />;
  }

  return (
    <VehicleProvider vin={vin}>
      <FeedProvider type="vehicle" identifier={vin} limit={30}>
        <VehicleView vin={vin} />
      </FeedProvider>
    </VehicleProvider>
  );
};

export default Controller;
