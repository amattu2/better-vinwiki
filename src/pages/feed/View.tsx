import React, { FC } from 'react';
import { ProviderStatus, useFeedProvider } from '../../Providers/FeedProvider';
import { useLocalStorage } from 'usehooks-ts';

const Feed : FC = () => {
  const { status, posts, count } = useFeedProvider();
  const [filtered, setFiltered] = useLocalStorage<boolean>("filteredFeed", false);

  if (status === ProviderStatus.LOADING) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <hr />
      <h1>Feed</h1>
      <b>{count} posts</b>
      <button onClick={() => setFiltered(!filtered)}>
        {filtered ? "Show all" : "Show following"}
      </button>
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
