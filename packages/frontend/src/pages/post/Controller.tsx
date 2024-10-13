import React from "react";
import { Navigate, useParams } from "react-router-dom";
import PostView from "./View";

const Controller = () => {
  const { uuid } = useParams<{ uuid: FeedPost["uuid"] }>();

  if (!uuid) {
    return <Navigate to="/" />;
  }

  return <PostView uuid={uuid} />;
};

export default Controller;
