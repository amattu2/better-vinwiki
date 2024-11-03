import React from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import ListView from "./List";
import ListsView from "./Lists";
import { ListVehiclesProvider } from "../../Providers/ListVehiclesProvider";

const Controller = () => {
  const { uuid } = useParams();
  const { pathname } = useLocation();

  if (!uuid && pathname === "/list") {
    return <Navigate to="/lists" />;
  }

  if (!uuid) {
    return <ListsView />;
  }

  return (
    <ListVehiclesProvider uuid={uuid}>
      <ListView uuid={uuid} />
    </ListVehiclesProvider>
  );
};

export default Controller;
