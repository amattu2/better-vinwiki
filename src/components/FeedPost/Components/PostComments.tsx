import React, { FC, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Send } from "@mui/icons-material";
import { Box, Button, Stack, TextField, Typography, styled } from "@mui/material";
import { useAuthProvider } from "../../../Providers/AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../../../config/Endpoints";
import Repeater from "../../Repeater";
import PostComment, { CommentSkeleton } from "./PostComment";

type Props = {
  uuid: FeedPost["uuid"];
  count: number;
  limit?: number;
};

type CommentForm = {
  text: string;
};

const StyledCommentBox = styled(Box)({
  marginTop: "0px",
  padding: "8px",
  position: "sticky",
  top: "57px",
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
 * Pass `Infinity` to `limit` to display all comments.
 *
 * @param {PostComment} comment
 * @returns {JSX.Element}
 */
const PostComments: FC<Props> = ({ uuid, limit = 4, count: commentCount }: Props) => {
  const { token, profile } = useAuthProvider();
  const { register, watch, handleSubmit, setValue } = useForm<CommentForm>();
  const isFormValid = useMemo(() => watch("text")?.length > 0 && watch("text")?.length <= 500, [watch("text")]);

  const [count, setCount] = useState<number>(commentCount);
  const [loading, setLoading] = useState<boolean>(count > 0);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [creating, setCreating] = useState<boolean>(false);

  const createComment = async ({ text }: CommentForm) => {
    if (!isFormValid || creating) {
      return;
    }

    setCreating(true);

    const response = await fetch(`${ENDPOINTS.post_comment_create}${uuid}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    }).catch(() => null);

    const { status, uuid: commentUuid, comment } = await response?.json() || {};
    if (status === STATUS_OK && commentUuid) {
      const mockComment: PostComment = {
        uuid: commentUuid,
        text: comment,
        created: (new Date()).toISOString(),
        ago: "",
        // NOTE: We're casting here because the AuthProfile properties are ignored anyway
        person: { ...profile } as Profile,
      };
      setComments((prevComments) => [mockComment, ...prevComments]);
      setValue("text", "");
    }

    setCreating(false);
  };

  const onCommentDelete = (uuid: PostComment["uuid"]) => {
    setComments((prevComments) => prevComments.filter((comment) => comment.uuid !== uuid));
  };

  useEffect(() => {
    if (commentCount <= 0) {
      setLoading(false);
      return () => null;
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
        comments?.sort((a: PostComment, b: PostComment) => (new Date(b.created).getTime() - new Date(a.created).getTime()));
        setComments(comments);
      }

      setLoading(false);
    })();

    return () => controller.abort();
  }, [commentCount]);

  useEffect(() => {
    setCount(comments.length);
  }, [comments.length]);

  return (
    <StyledCommentBox>
      <Typography variant="body1" mb={1} fontWeight={600}>
        Comments
        {count > 0 && ` (${count})`}
      </Typography>

      <Stack direction="row" spacing={1} component="form" onSubmit={handleSubmit(createComment)}>
        <TextField
          fullWidth
          placeholder="Reply to this post"
          size="small"
          inputProps={{ maxLength: 500 }}
          {...register("text", { required: true })}
        />
        <Button variant="text" disabled={!isFormValid || creating} type="submit">
          <Send />
        </Button>
      </Stack>

      {count > 0 && (
        <StyledCommentStack direction="column" spacing={1}>
          {creating && <CommentSkeleton />}
          {!loading ? (
            <>
              {comments.slice(0, limit).map((comment: PostComment) => (
                <PostComment key={comment.uuid} comment={comment} onDelete={onCommentDelete} divider />
              ))}
              {count > limit && (
                <Typography variant="body2" textAlign="center">
                  <Link to={`/post/${uuid}`} target="_blank">
                    View remaining comments in thread
                  </Link>
                </Typography>
              )}
            </>
          ) : (
            <Repeater count={count > 4 ? 4 : count} Component={CommentSkeleton} />
          )}
        </StyledCommentStack>
      )}
    </StyledCommentBox>
  );
};

export default PostComments;
