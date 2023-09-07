import React from "react";
import { Navigate, useParams } from "react-router-dom";
import VehicleView from "./View";
import { VehicleProvider } from "../../Providers/VehicleProvider";

const Controller = () => {
  const { vin } = useParams();

  if (!vin) {
    return <Navigate to="/" />;
  }

  return (
    <VehicleProvider vin={vin} withPosts withFollowing>
      <VehicleView />
    </VehicleProvider>
  );
};

export default Controller;
