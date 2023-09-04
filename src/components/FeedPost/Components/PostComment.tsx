import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Stack, Typography, styled } from "@mui/material";
import ProfileAvatar from "../../ProfileAvatar";
import { formatDateTime } from "../../../utils/date";
import GenericText from "./GenericText";

type Props = {
  comment: PostComment;
};

const StyledStack = styled(Stack)({
  borderRadius: "8px",
  padding: "8px",
});

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

/**
 * A representation of a Feed Post Comment
 *
 * @param {PostComment} comment
 * @returns {JSX.Element}
 */
const PostComment: FC<Props> = ({ comment }: Props) => {
  const { person, text } = comment
  const { uuid, username, avatar } = person

  return (
    <StyledStack direction="row" gap={2}>
      <ProfileAvatar username={username} avatar={avatar} />
      <Stack direction="column" gap={1}>
        <Typography variant="body1" fontWeight={600}>
          <StyledLink to={`/profile/${uuid}`}>@{username}</StyledLink>
        </Typography>
        <GenericText content={text} />
        <Typography variant="body2" color="textSecondary" fontSize={12} fontWeight={600}>
          {formatDateTime(new Date(comment.created))}
        </Typography>
      </Stack>
    </StyledStack>
  )
};

export default PostComment;
