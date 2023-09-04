import React, { FC, useState } from "react";
import { AspectRatio, OpenInNew } from "@mui/icons-material";
import { Box, Card, CardContent, Grid, Modal, Stack, Typography, styled } from "@mui/material";
import { Link } from "react-router-dom";
import useProgressiveQuality from "../../hooks/useProgressiveQuality";
import PostComments from "./Components/PostComments";
import ProfileBit from "./Components/PostProfile";
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

const StyledImageBox = styled(Box)({
  height: "250px",
  maxWidth: "95%",
  overflow: "hidden",
  borderRadius: "8px",
  position: "relative",
  background: "#ddd",
  "&:hover .expand-button": {
    opacity: 1,
  },
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
  transition: "filter 0.3s ease-out",
  "&:hover": {
    filter: "brightness(0.8)"
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
  zIndex: 2,
});

const StyledButton = styled("div")({
  position: "absolute",
  right: "8px",
  top: "8px",
  cursor: "pointer",
  color: "#fff",
  opacity: 0,
  transition: "opacity 0.3s ease-out",
  zIndex: 2,
});

const ImagePost: FC<FeedPost> = (post: FeedPost) => {
  const { uuid, image, comment_count, post_text } = post;
  const [src, { blur }] = useProgressiveQuality(image?.thumb, image?.large);

  const [open, setOpen] = useState(false);

  return (
    <>
      <StyledCard elevation={0}>
        <CardContent>
          <Grid container>
            <Grid item xs={8}>
              <StyledImageBox className="image-box">
                <StyledBackground bg={src} blur={blur} />
                <StyledButton className="expand-button" onClick={() => setOpen(true)}>
                  <AspectRatio />
                </StyledButton>
              </StyledImageBox>
            </Grid>
            <Grid item xs={4}>
              <Stack gap={1.5}>
                <ProfileBit post={post} />
                <GenericText content={post_text} />
                <Typography variant="body2" color="textSecondary" fontSize={12} fontWeight={600}>
                  {formatDateTime(new Date(post.post_date))}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <PostComments key={uuid} uuid={uuid} count={comment_count} />
        </CardContent>
        <StyledLink to={`/post/${uuid}`} target="_blank" className="external-button">
          <OpenInNew />
        </StyledLink>
      </StyledCard>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <img src={src} alt={post_text} style={{ maxHeight: "80vh", maxWidth: "80vw" }} />
        </Box>
      </Modal>
    </>
  );
};

export default ImagePost;
