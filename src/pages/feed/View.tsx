import React, { FC } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { LoadingButton } from '@mui/lab';
import Loader from '../../components/Loader';
import TransitionGroup from '../../components/TransitionGroup';
import { ProviderStatus, useFeedProvider } from '../../Providers/FeedProvider';

const Feed : FC = () => {
  const { status, posts, count } = useFeedProvider();
  const [filtered, setFiltered] = useLocalStorage<boolean>("filteredFeed", false);

  if (status === ProviderStatus.LOADING) {
    return <Loader />;
  }

  return (
    <div>
      <hr />
      <h1>Feed</h1>
      <b>{count} posts</b>
      <br />
      <LoadingButton
        type="button"
        loading={status === ProviderStatus.RELOADING}
        onClick={() => setFiltered(!filtered)}
        variant='outlined'
      >
        {filtered ? "Show all" : "Show following"}
      </LoadingButton>
      <hr />
      <TransitionGroup
        items={posts.map((post) => ({ post, key: post.uuid }))}
        render={({ post }) => (
          <div key={`${post.uuid}-div`}>
            <p>{(new Date(post.post_date)).toLocaleTimeString()} &middot; {post.person.username}</p>
            <p>{post.post_text ?? post.type}</p>
          </div>
        )}
      />
    </div>
  );
};

export default Feed;
