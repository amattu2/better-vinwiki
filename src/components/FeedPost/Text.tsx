import { FC } from "react";
import { Card, CardContent, Typography, styled } from "@mui/material";
import ProfileBit from "./Components/PostProfile";
import { OpenInNew } from "@mui/icons-material";
import { Link } from "react-router-dom";
import PostComments from "./Components/PostComments";
import GenericText from "./Components/GenericText";
import { formatDateTime } from "../../utils/date";

const StyledCard = styled(Card)({
  borderRadius: "8px",
  marginBottom: "8px",
  border: "1px solid #e5e5e5",
  position: "relative",
  "&:hover .external-button": {
    opacity: 1,
  },
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
  const { uuid, comment_count, post_text } = post;

  return (
    <StyledCard elevation={0}>
      <CardContent>
        <ProfileBit post={post} filled={false} />
        <GenericText content={post_text} padding={"8px"} />
        <Typography variant="body2" color="textSecondary" fontSize={12} fontWeight={600} paddingLeft={"8px"}>
          {formatDateTime(new Date(post.post_date))}
        </Typography>
        <PostComments key={uuid} uuid={uuid} count={comment_count} />
      </CardContent>
      <StyledLink to={`/post/${uuid}`} target="_blank" className="external-button">
        <OpenInNew />
      </StyledLink>
    </StyledCard>
  );
};

export default TextPost;
