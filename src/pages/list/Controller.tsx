import React from "react";
import { Navigate, useParams } from "react-router-dom";
import ListView from "./View";
import { ListProvider } from "../../Providers/ListProvider";

const Controller = () => {
  const { uuid } = useParams();

  if (!uuid) {
    return <Navigate to="/" />;
  }

  return (
    <ListProvider uuid={uuid}>
      <ListView />
    </ListProvider>
  );
}

export default Controller;
