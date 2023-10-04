import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { FilterList, Public, DynamicFeed, Image, Message } from '@mui/icons-material';
import {
  Alert, Box, Container, Divider,
  Stack, ToggleButton, ToggleButtonGroup,
  Tooltip, Typography, styled,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useIntersectionObserver, useLocalStorage } from 'usehooks-ts';
import { ProviderStatus, useFeedProvider } from '../../Providers/FeedProvider';
import FeedPost, { PostSkeleton } from '../../components/FeedPost';
import SuggestionCard from '../../components/SuggestionCards/ProfileSuggestion';
import TransitionGroup from '../../components/TransitionGroup';
import TrendingPost from '../../components/TrendingPost';
import BlogPostCard from '../../components/BlogPost';
import CreatePost from '../../components/CreatePost';
import { ScrollToTop } from '../../components/ScrollToTop';
import { CacheKeys } from '../../config/Cache';
import Repeater from '../../components/Repeater';

const StyledBox = styled(Box)({
  padding: "16px",
});

const StyledFeedBox = styled(StyledBox)({
  backgroundColor: "#fff",
  flexGrow: 1,
  minHeight: "100vh",
  borderLeft: "1px solid #ddd",
  borderRight: "1px solid #ddd",
});

const StyledSidebarBox = styled(StyledBox)({
  minWidth: "400px",
  flexGrow: 1,
});

// TODO: Dynamically fetch this from the blog
const blogPost: BlogPost = {
  created: '2016-07-14T01:00:00.000Z',
  title: 'Discrepancy of Data',
  body: 'In 2001 when the Ferrari 360 Spider came out, the market premiums were more than $150k over MSRP. It was the first time in years where it made sense to have gray market cars in the US. The values were closer to MSRP in Europe and the federalization fees were only $30-40k.',
  link: 'https://vinwiki.com/discrepancy-of-data/',
  image: 'https://api.placeholder.app/image/350x350/E4E4E0/3b3b3b?text=B%20VW',
};

const Feed : FC = () => {
  const { status, posts, next, hasNext } = useFeedProvider();
  const lastElementRef = useRef<HTMLDivElement>(null);

  const [filtered, setFiltered] = useLocalStorage<boolean>(CacheKeys.FEED_TYPE, false);
  const [postFilter, setPostFilter] = useLocalStorage<FeedPost["type"] | "">(CacheKeys.FEED_POST_TYPE, "");
  const [limit, setLimit] = useState<number>(10);
  const entry = useIntersectionObserver(lastElementRef, {});
  const isVisible = !!entry?.isIntersecting;

  // NOTE: These are posts matching client-side filters
  const filteredPosts: FeedPost[] = useMemo(() => posts
    .filter((p) => (postFilter ? p.type === postFilter : true))
    .filter((p) => !(p.client === "vinbot" && p.person.username !== "vinbot" && !p.post_text))
    .sort((a, b) => (new Date(b.post_date)).getTime() - (new Date(a.post_date)).getTime()), [posts, postFilter]);

  // NOTE: These posts are a subset of filteredPosts, limited by the limit state
  const slicedPosts: FeedPost[] = useMemo(() => filteredPosts.slice(0, limit), [filteredPosts, limit]);

  const topPost: { reason: string, post: FeedPost } | null = useMemo(() => {
    const topByComments = posts.sort((a, b) => b.comment_count - a.comment_count)?.[0];
    const topByLength = posts.sort((a, b) => b.post_text.length - a.post_text.length)?.[0];
    const topByRandom = posts[Math.floor(Math.random() * posts.length)];

    if (topByComments?.comment_count > 0 && topByComments?.post_text.length > 0) {
      return { reason: "Most Comments", post: topByComments };
    }
    if (topByLength?.post_text.length > 0) {
      return { reason: "Longest Post", post: topByLength };
    }
    if (topByRandom?.post_text.length > 0) {
      return { reason: "Random Pick", post: topByRandom };
    }

    return null;
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

  const loadMore = () => {
    setLimit((prev) => prev + 10);

    if ((limit + 11) >= filteredPosts.length) {
      next?.(30);
    }
  };

  useEffect(() => {
    setLimit(10);
  }, [filtered, postFilter]);

  useEffect(() => {
    if (isVisible) {
      loadMore();
    }
  }, [isVisible]);

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
                <ToggleButton value="">
                  <Tooltip title="Show everything">
                    <DynamicFeed />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="generic">
                  <Tooltip title="Show text posts">
                    <Message />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="photo">
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
                <ToggleButton value>
                  <Tooltip title="Show following">
                    <FilterList />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <CreatePost />

            {status === ProviderStatus.LOADING && (
              <Repeater count={5} Component={PostSkeleton} />
            )}
            {status === ProviderStatus.RELOADING && (
              <Alert severity="info" sx={{ mb: 1 }}>Hang tight. We're fetching your latest feed...</Alert>
            )}
            {(status === ProviderStatus.LOADED && slicedPosts.length === 0) && (
              <Alert severity="info" sx={{ mb: 1 }}>Uh oh. We have no posts to show.</Alert>
            )}

            <TransitionGroup
              items={slicedPosts.map((post) => ({ post, key: post.uuid }))}
              render={({ post }, _, last) => <FeedPost {...post} ref={last ? lastElementRef : undefined} />}
            />
            {hasNext && (
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <LoadingButton
                  variant="outlined"
                  onClick={loadMore}
                  loading={status === ProviderStatus.RELOADING}
                >
                  Show More
                </LoadingButton>
              </Box>
            )}
          </Container>
        </StyledFeedBox>
      </Container>
      <StyledSidebarBox>
        {blogPost && <BlogPostCard post={blogPost} />}
        {topPost && <TrendingPost reason={topPost.reason} post={topPost.post} />}
        {suggestions?.length > 0 && <SuggestionCard suggestions={suggestions} limit={4} />}
      </StyledSidebarBox>
      <ScrollToTop />
    </Stack>
  );
};

export default Feed;
