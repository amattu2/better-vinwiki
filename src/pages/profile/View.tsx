import React, { FC } from "react";
import { ProviderStatus, useProfileProvider } from "../../Providers/ProfileProvider";

const View : FC = () => {
  const { status, profile } = useProfileProvider();

  if (status === ProviderStatus.LOADING) {
    return <span>Loading...</span>;
  }

  if (status === ProviderStatus.ERROR) {
    return <span>Something went wrong!</span>;
  }

  return (
    <div>
      <div>
        <strong>Username</strong>: {profile?.username}
        <br />
        <strong>Display Name</strong>: {profile?.display_name}
        <br />
        <strong>Bio</strong>: {profile?.bio}
      </div>
    </div>
  );
};

export default View;
