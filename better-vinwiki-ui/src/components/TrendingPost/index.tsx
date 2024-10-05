import React, { FC } from "react";
import { Card, Stack, Typography, styled } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "../../utils/date";
import { prettySubstring } from "../../utils/text";
import ProfileAvatar from "../ProfileAvatar";
import { randomGradient } from "../../utils/gradient";
import { StyledLink } from "../StyledLink";

type Props = {
  reason: string;
  post: FeedPost;
};

const StyledCard = styled(Card)({
  borderRadius: "8px",
  backgroundColor: "transparent",
  marginBottom: "16px",
  maxWidth: "450px",
  cursor: "pointer",
});

const StyledPostBox = styled(Stack)({
  padding: "16px",
  height: "275px",
  overflow: "hidden",
  position: "relative",
});

const StyledBackground = styled("div", { shouldForwardProp: (p) => p !== "bg" })(
  ({ bg }: { bg?: string }) => ({
    backgroundImage: bg ? `url(${bg})` : randomGradient(),
    filter: bg ? "blur(6px) brightness(0.8)" : "none",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  })
);

const StyledReasonChip = styled(Typography)({
  backgroundColor: "#EC53B0",
  color: "#fff",
  borderRadius: "6px",
  padding: "4px 8px",
  fontSize: "18px",
  marginRight: "auto",
  marginBottom: "8px",
  zIndex: 2,
});

const StyledPostText = styled(Typography)({
  fontWeight: 800,
  color: "#fff",
  zIndex: 2,
  marginRight: "auto",
});

const StyledAuthor = styled(Stack)(({ theme }) => ({
  padding: "8px",
  backgroundColor: theme.palette.background.default,
  borderRadius: "0 0 8px 8px",
}));

const TopPost: FC<Props> = ({ reason, post }: Props) => {
  const navigate = useNavigate();

  const openPost = () => {
    navigate(`/post/${post.uuid}`);
  };

  return (
    <StyledCard raised onClick={openPost}>
      <StyledPostBox direction="column" alignItems="center" justifyContent="center">
        <StyledBackground bg={post.image?.thumb ?? post.image?.poster} />
        <StyledReasonChip>Trending &ndash; {reason}</StyledReasonChip>
        <StyledPostText variant="h4">
          &quot;
          {prettySubstring(post.post_text, 40)}
          &quot;
        </StyledPostText>
      </StyledPostBox>
      <StyledAuthor direction="row" gap={1}>
        <ProfileAvatar username={post.person.username} avatar={post.person.avatar} />
        <Stack direction="column" justifyContent="center">
          <Typography variant="body1" fontWeight={600}>
            <StyledLink to={`/profile/${post.person.uuid}`}>@{post.person.username}</StyledLink>
          </Typography>
          <Typography variant="body2">
            {formatDateTime(new Date(post.post_date), true)} &middot; {post.comment_count}{" "}
            {post.comment_count === 1 ? "comment" : "comments"}
          </Typography>
        </Stack>
      </StyledAuthor>
    </StyledCard>
  );
};

export default TopPost;
