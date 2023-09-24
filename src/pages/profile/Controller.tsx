import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { FeedProvider } from "../../Providers/FeedProvider";
import { ProfileProvider } from "../../Providers/ProfileProvider";
import ProfileView from "./View";

const Controller = () => {
  const { uuid } = useParams();
  const { profile } = useAuthProvider();

  if (!uuid) {
    return <Navigate to={`/profile/${profile?.uuid}`} />;
  }

  return (
    <ProfileProvider uuid={uuid}>
      <FeedProvider type="profile" identifier={uuid} limit={30}>
        <ProfileView uuid={uuid} />
      </FeedProvider>
    </ProfileProvider>
  );
};

export default Controller;
