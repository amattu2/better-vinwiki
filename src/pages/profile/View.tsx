import React, { FC } from "react";
import { ProviderStatus, useProfileProvider } from "../../Providers/ProfileProvider";

const View : FC = () => {
  const { status, profile, posts, following } = useProfileProvider();

  if (status === ProviderStatus.LOADING) {
    return <span>Loading...</span>;
  }

  if (status === ProviderStatus.ERROR) {
    return <span>Something went wrong!</span>;
  }

  return (
    <div>
      <div>
        <h2>User</h2>
        <strong>Username</strong>: {profile?.username}
        <br />
        <strong>Display Name</strong>: {profile?.display_name}
        <br />
        <strong>Bio</strong>: {profile?.bio}
        <br />
        <strong>You are Following</strong>: {following ? "Yes" : "No"}
      </div>
      <div>
        <h2>Posts</h2>
        {posts?.map((post) => (
          <div key={post.uuid}>
            <strong>{post.post_text ?? post.post_date_ago}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default View;
