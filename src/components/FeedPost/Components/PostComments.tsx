import React, { FC, useEffect, useState } from "react";
import { Send } from "@mui/icons-material";
import { Box, Button, Divider, Stack, TextField, Typography, styled } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuthProvider } from "../../../Providers/AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../../../config/Endpoints";
import PostComment from "./PostComment";

type Props = {
  uuid: FeedPost["uuid"];
  count: number;
};

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

/**
 * A representation of a post's comments.
 *
 * Handles fetching, creating, and displaying comments.
 *
 * @param {PostComment} comment
 * @returns {JSX.Element}
 */
const PostComments: FC<Props> = ({ uuid, count }: Props) => {
  const { token } = useAuthProvider();
  const [comments, setComments] = useState<PostComment[]>([]);

  useEffect(() => {
    if (count <= 0) {
      return;
    }

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

      const { status, comments } = await response?.json() || {};
      if (status === STATUS_OK) {
        setComments(comments);
      }
    })();

    return () => controller.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <StyledCommentBox>
      <Typography variant="body1" mb={1} fontWeight={600}>
        Comments
        {count > 0 && ` (${count})`}
      </Typography>

      {/* TODO: Stylize and activate this button */}
      <Stack direction="row" spacing={1}>
        <TextField fullWidth placeholder="Reply to this post" size="small" multiline />
        <Button variant="text">
          <Send />
        </Button>
      </Stack>

      {count > 0 && (
        <StyledCommentStack direction="column" spacing={1}>
          {comments.slice(0, 4).map((comment) => (
            <React.Fragment key={comment.uuid}>
              <PostComment comment={comment} />
              <Divider />
            </React.Fragment>
          ))}
          {count > 4 && (
            <Typography variant="body2" textAlign="center">
              <Link to={`/post/${uuid}`} target="_blank">
                View remaining comments in thread
              </Link>
            </Typography>
          )}
        </StyledCommentStack>
      )}
    </StyledCommentBox>
  )
};

export default PostComments;
