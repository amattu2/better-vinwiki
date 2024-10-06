import React, { FC, useEffect, useMemo, useState } from "react";
import { NavigateNext } from "@mui/icons-material";
import { Box, Breadcrumbs, Container, Divider, Stack, Typography, styled } from "@mui/material";
import FeedPost, { PostSkeleton } from "../../components/FeedPost";
import SuggestionCard from "../../components/SuggestionCards/ProfileSuggestion";
import { ScrollToTop } from "../../components/ScrollToTop/ScrollButton";
import PostComments from "../../components/FeedPost/Components/PostComments";
import { CommentSkeleton } from "../../components/FeedPost/Components/PostComment";
import Repeater from "../../components/Repeater";
import { ENDPOINTS, STATUS_OK } from "../../config/Endpoints";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { StyledLink } from "../../components/StyledLink";

type Props = {
  uuid: FeedPost["uuid"];
};

const StyledHeaderSection = styled(Stack)(({ theme }) => ({
  padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
  margin: "0 -16px",
  marginTop: "-16px",
  marginBottom: "16px",
  background: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  position: "sticky",
  top: 0,
  zIndex: 8,
}));

const StyledBox = styled(Box)({
  padding: "16px",
});

const StyledFeedBox = styled(StyledBox)({
  backgroundColor: "transparent",
  flexGrow: 1,
  minHeight: "100vh",
});

const StyledPostSidebar = styled(StyledBox)(({ theme }) => ({
  paddingTop: 0,
  position: "sticky",
  top: "72px",
  minWidth: "400px",
  maxWidth: "550px",
  flexGrow: 1,
  [theme.breakpoints.down("lg")]: {
    display: "none",
  },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  [theme.breakpoints.down("lg")]: {
    display: "none",
  },
}));

const PostContentSkeleton: FC = () => (
  <>
    <PostSkeleton />
    <Repeater count={5} Component={CommentSkeleton} />
  </>
);

const PostContent: FC<FeedPost> = (post: FeedPost) => {
  const { uuid, comment_count } = post;

  return (
    <>
      <FeedPost {...post} isIndividual />
      <PostComments uuid={uuid} count={comment_count} limit={Infinity} />
    </>
  );
};

const PostView: FC<Props> = ({ uuid }: Props) => {
  const { token } = useAuthProvider();
  const [post, setPost] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);

  const suggestions: { profile: Profile; postCount: number }[] = useMemo(() => {
    const profileMap: { [uuid: string]: { profile: Profile; postCount: number } } = {};

    (comments.map((comment) => comment.person) || []).forEach((profile) => {
      if (profileMap[profile.uuid]) {
        profileMap[profile.uuid].postCount += 1;
      } else {
        profileMap[profile.uuid] = { profile, postCount: 1 };
      }
    });

    return Object.values(profileMap).sort((a, b) => b.postCount - a.postCount);
  }, [comments]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const response = await fetch(`${ENDPOINTS.comments}${uuid}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal,
      }).catch(() => null);

      const { status, post, comments } = (await response?.json()) || {};
      if (status === STATUS_OK) {
        comments?.sort(
          (a: PostComment, b: PostComment) =>
            new Date(b.created).getTime() - new Date(a.created).getTime()
        );
        setPost(post);
        setComments(comments);
      }
    })();

    return () => controller.abort();
  }, []);

  return (
    <>
      <StyledFeedBox>
        <StyledHeaderSection
          direction="row"
          alignItems="center"
          justifyContent="flex-start"
          gap={2}
        >
          <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mr: "auto" }}>
            <StyledLink to="/">Home</StyledLink>
            <Typography>Post</Typography>
          </Breadcrumbs>
        </StyledHeaderSection>
        <Stack direction="row" alignItems="flex-start" justifyContent="flex-start" gap={2}>
          <Container maxWidth="lg">
            {post === null ? <PostContentSkeleton /> : <PostContent {...post} />}
          </Container>
          <StyledDivider hidden={suggestions.length <= 0} orientation="vertical" flexItem />
          <StyledPostSidebar hidden={suggestions.length <= 0}>
            <SuggestionCard cardTitle="In this thread" suggestions={suggestions} limit={10} />
          </StyledPostSidebar>
        </Stack>
      </StyledFeedBox>
      <ScrollToTop />
    </>
  );
};

export default PostView;
