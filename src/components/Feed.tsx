import React, { FC } from 'react';
import { ProviderStatus, useFeedProvider } from '../Providers/FeedProvider';

const Feed : FC = () => {
  const { status, posts, count } = useFeedProvider();

  if (status === ProviderStatus.LOADING) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <b>{count} posts</b>
      <hr />
      {posts.map((post: FeedPost) => (
        <div key={post.id}>
          <span>{post.uuid} &ndash; {post.post_text}</span>
        </div>
      ))}
      <hr />
    </div>
  );
};

export default Feed;
