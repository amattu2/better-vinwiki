import React, { FC } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { LoadingButton } from '@mui/lab';
import Loader from '../../components/Loader';
import TransitionGroup from '../../components/TransitionGroup';
import { ProviderStatus, useFeedProvider } from '../../Providers/FeedProvider';

const Feed : FC = () => {
  const { status, posts, count } = useFeedProvider();
  const [filtered, setFiltered] = useLocalStorage<boolean>("filteredFeed", false);
  const suggestions: { profile: Profile, postCount: number }[] = useMemo(() => {
    const profileMap: { [uuid: string]: { profile: Profile, postCount: number } } = {};

    (posts.map((post) => post.person) || []).forEach((profile) => {
      if (profileMap[profile.uuid]) {
        profileMap[profile.uuid].postCount++;
      } else {
        profileMap[profile.uuid] = { profile, postCount: 1 };
      }
    });

    return Object.values(profileMap).sort((a, b) => b.postCount - a.postCount);
  }, [posts]);

  if (status === ProviderStatus.LOADING) {
    return <Loader />;
  }

  return (
      <StyledSidebarBox>
        {suggestions?.length > 0 && <SuggestionCard suggestions={suggestions} limit={3} />}
      </StyledSidebarBox>
  );
};

export default Feed;
