import React from "react";
import { Navigate, useParams } from "react-router-dom";
import ListView from "./View";
import { ListVehiclesProvider } from "../../Providers/ListVehiclesProvider";

const Controller = () => {
  const { uuid } = useParams();

  if (!uuid) {
    return <Navigate to="/lists" />;
  }

  return (
    <ListVehiclesProvider uuid={uuid}>
      <ListView uuid={uuid} />
    </ListVehiclesProvider>
  );
};

export default Controller;
