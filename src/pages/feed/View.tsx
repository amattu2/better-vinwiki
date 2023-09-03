import React, { FC, useEffect, useMemo, useState } from 'react';
import { FilterList, Public, DynamicFeed, Image, Message } from '@mui/icons-material';
import { Alert, Box, Button, Container, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography, styled } from '@mui/material';
import { useLocalStorage } from 'usehooks-ts';
import { ProviderStatus, useFeedProvider } from '../../Providers/FeedProvider';
import { PostRouter } from '../../components/FeedPost';
import Loader from '../../components/Loader';
import SuggestionCard from '../../components/ProfileSuggestions';
import TransitionGroup from '../../components/TransitionGroup';
import TrendingPost from '../../components/TrendingPost';

const StyledBox = styled(Box)({
  padding: "16px",
});

const StyledFeedBox = styled(StyledBox)({
  backgroundColor: "#fff",
  flexGrow: 1,
});

const StyledSidebarBox = styled(StyledBox)({
  minWidth: "370px",
  flexGrow: 1,
});

const Feed : FC = () => {
  const { status, posts } = useFeedProvider();
  const [filtered, setFiltered] = useLocalStorage<boolean>("filteredFeed", false);
  const [postFilter, setPostFilter] = useLocalStorage<FeedPost["type"] | "">("postFilter", "");
  const [limit, setLimit] = useState<number>(10);

  const filteredPosts: FeedPost[] = useMemo(() => {
    return posts
      .filter((p) => postFilter ? p.type === postFilter : true)
      .filter((p) => !(p.client === "vinbot" && p.person.username !== "vinbot"))
      .slice(0, limit);
  }, [posts, postFilter, limit]);

  const topPost: { reason: string, post: FeedPost } = useMemo(() => {
    const topByComments = posts.sort((a, b) => b.comment_count - a.comment_count)?.[0];
    const topByLength = posts.sort((a, b) => b.post_text.length - a.post_text.length)?.[0];
    const topByRandom = posts[Math.floor(Math.random() * posts.length)];

    if (topByComments?.comment_count > 1) {
      return { reason: "Most Comments", post: topByComments };
    }
    if (topByLength?.post_text.length > 0) {
      return { reason: "Longest Post", post: topByLength };
    }

    return { reason: "Random Pick", post: topByRandom };
  }, [posts]);

  const suggestions: { profile: Profile, postCount: number }[] = useMemo(() => {
    const profileMap: { [uuid: string]: { profile: Profile, postCount: number } } = {};

    (filteredPosts.map((post) => post.person) || []).forEach((profile) => {
      if (profileMap[profile.uuid]) {
        profileMap[profile.uuid].postCount++;
      } else {
        profileMap[profile.uuid] = { profile, postCount: 1 };
      }
    });

    return Object.values(profileMap).sort((a, b) => b.postCount - a.postCount);
  }, [filteredPosts]);

  useEffect(() => {
    setLimit(10);
  }, [filtered, postFilter]);

  if (status === ProviderStatus.LOADING) {
    return <Loader />;
  }

  return (
    <Stack direction="row">
      <Container maxWidth="xl">
        <StyledFeedBox>
          <Container maxWidth="md">
            <Stack direction="row" alignItems="center" justifyContent="flex-start" gap={2}>
              <Typography variant="h4" sx={{ mr: "auto" }}>Feed</Typography>
              <ToggleButtonGroup
                color="primary"
                value={postFilter}
                onChange={(e, value) => setPostFilter(value || "")}
                exclusive
              >
                <ToggleButton value={""}>
                  <Tooltip title="Show all post types">
                    <DynamicFeed />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value={"generic"}>
                  <Tooltip title="Show text posts">
                    <Message />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value={"photo"}>
                  <Tooltip title="Show image posts">
                    <Image />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
              <ToggleButtonGroup
                color="primary"
                value={filtered}
                onChange={(e, value) => setFiltered(!!value)}
                exclusive
              >
                <ToggleButton value={false}>
                  <Tooltip title="Show all posts">
                    <Public />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value={true}>
                  <Tooltip title="Show following">
                    <FilterList />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            <hr />
            {status === ProviderStatus.RELOADING && (
              <Alert severity="info" sx={{ mb: 1 }}>Hang tight. We're fetching your latest feed...</Alert>
            )}
            {(status === ProviderStatus.LOADED && filteredPosts.length === 0) && (
              <Alert severity="info" sx={{ mb: 1 }}>Uh oh. We have no posts to show.</Alert>
            )}
            <TransitionGroup
              items={filteredPosts.map((post) => ({ post, key: post.uuid }))}
              render={({ post }) => <PostRouter {...post} />}
            />
            {(filteredPosts.length < posts.length && filteredPosts.length === limit) && (
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Button variant="outlined" onClick={() => setLimit(limit + 10)}>Show More</Button>
              </Box>
            )}
          </Container>
        </StyledFeedBox>
      </Container>
      <StyledSidebarBox>
        {topPost && <TrendingPost reason={topPost.reason} post={topPost.post} />}
        {suggestions?.length > 0 && <SuggestionCard suggestions={suggestions} limit={4} />}
      </StyledSidebarBox>
    </Stack>
  );
};

export default Feed;
