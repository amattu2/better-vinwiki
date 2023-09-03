import React, { FC } from "react";
import { OpenInNew } from "@mui/icons-material";
import { Box, Card, CardContent, Grid, Typography, styled } from "@mui/material";
import { Link } from "react-router-dom";
import useProgressiveQuality from "../../hooks/useProgressiveQuality";
import PostComments from "./Components/PostComments";
import ProfileBit from "./Components/PostProfile";

const StyledCard = styled(Card)({
  borderRadius: "8px",
  marginBottom: "8px",
  border: "1px solid #e5e5e5",
  position: "relative",
  "&:hover .external-button": {
    opacity: 1,
  },
});

const StyledImageBox = styled(Box)({
  height: "250px",
  maxWidth: "95%",
  overflow: "hidden",
  borderRadius: "8px",
  position: "relative",
  background: "#ddd",
});

const StyledBackground = styled("div", {
  shouldForwardProp: (p) => p !== "bg" && p !== "blur"
})(({ bg, blur }: { bg?: string, blur?: boolean }) => ({
  backgroundImage: `url(${bg})`,
  filter: blur ? "blur(6px)" : "none",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
  transition: "filter 0.3s ease-out, transform 0.3s ease-out",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));

const StyledLink = styled(Link)({
  position: "absolute",
  right: "8px",
  top: "8px",
  cursor: "pointer",
  color: "#838383",
  transition: "opacity 0.3s ease-out",
  opacity: 0,
});

const ImagePost: FC<FeedPost> = (post: FeedPost) => {
  const { uuid, image, post_text, comment_count } = post;
  const [src, { blur }] = useProgressiveQuality(image?.thumb, image?.large);

  return (
    <StyledCard elevation={0}>
      <CardContent>
        <Grid container>
          <Grid item xs={8}>
            <StyledImageBox>
              <StyledBackground bg={src} blur={blur} />
            </StyledImageBox>
          </Grid>
          <Grid item xs={4}>
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                {post_text}
              </Typography>
              <ProfileBit post={post} />
            </Box>
          </Grid>
        </Grid>
        <PostComments uuid={uuid} count={comment_count} />
      </CardContent>
      <StyledLink to={`/post/${uuid}`} target="_blank" className="external-button">
        <OpenInNew />
      </StyledLink>
    </StyledCard>
  );
};

export default ImagePost;
