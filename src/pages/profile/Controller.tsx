import React from "react";
import { Navigate, useParams } from "react-router-dom";
import ProfileView from "./View";
import { ProfileProvider } from "../../Providers/ProfileProvider";
import { useAuthProvider } from "../../Providers/AuthProvider";

const Controller = () => {
  const { uuid } = useParams();
  const { user } = useAuthProvider();

  if (!uuid) {
    return <Navigate to={`/profile/${user?.uuid}`} />;
  }

  return (
    <ProfileProvider uuid={uuid} withPosts withFollowing withLists>
      <ProfileView />
    </ProfileProvider>
  );
};

export default Controller;
