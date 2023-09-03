import React, { FC, useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Divider, Stack, TextField, Typography, styled } from "@mui/material";
import ProfileBit from "./Components/PostProfile";
import { ENDPOINTS, STATUS_OK } from "../../config/Endpoints";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { Send, OpenInNew } from "@mui/icons-material";
import { Link } from "react-router-dom";
import PostComment from "./Components/PostComment";

const StyledCard = styled(Card)({
  borderRadius: "8px",
  marginBottom: "8px",
  border: "1px solid #e5e5e5",
  position: "relative",
  "&:hover .external-button": {
    opacity: 1,
  },
});

const StyledTypography = styled(Typography)({
  padding: "8px",
});

const StyledCommentBox = styled(Box)({
  marginTop: "0px",
  padding: "8px",
  "& .MuiDivider-root:last-child": {
    display: "none",
  },
});

const StyledCommentStack = styled(Stack)({
  marginTop: "8px",
});

const StyledLink = styled(Link)({
  position: "absolute",
  right: "8px",
  top: "8px",
  cursor: "pointer",
  color: "#838383",
  transition: "opacity 0.3s ease-out",
  opacity: 0,
});

const TextPost: FC<FeedPost> = (post: FeedPost) => {
  const { token } = useAuthProvider();
  const { uuid, post_text, comment_count } = post;
  const [comments, setComments] = useState<PostComment[]>([]);

  useEffect(() => {
    if (comment_count === 0) {
      return;
    }

    (async () => {
      const response = await fetch(`${ENDPOINTS.comments}${uuid}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { status, comments } = await response.json();
      if (status === STATUS_OK) {
        setComments(comments);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <StyledCard elevation={0}>
      <CardContent>
        <ProfileBit post={post} filled={false} />
        <StyledTypography variant="body1">
          {post_text}
        </StyledTypography>

        <StyledCommentBox>
          <Typography variant="body1" mb={1} fontWeight={600}>Comments</Typography>

          {/* TODO: Stylize and activate this button */}
          <Stack direction="row" spacing={1}>
            <TextField fullWidth label="What's on your mind?" multiline />
            <Button variant="text">
              <Send />
            </Button>
          </Stack>

          {comment_count > 0 && (
            <StyledCommentStack direction="column" spacing={1}>
              {comments.slice(0, 4).map((comment) => (
                <>
                  <PostComment key={comment.uuid} comment={comment} />
                  <Divider />
                </>
              ))}
              {comment_count > 4 && (
                <Typography variant="body2" textAlign="center">
                  <Link to={`/post/${uuid}`} target="_blank">
                    View remaining comments in thread
                  </Link>
                </Typography>
              )}
            </StyledCommentStack>
          )}
        </StyledCommentBox>
      </CardContent>

      <StyledLink to={`/post/${uuid}`} target="_blank" className="external-button">
        <OpenInNew />
      </StyledLink>
    </StyledCard>
  );
};

export default TextPost;
