import React, { FC } from "react";
import { Box, Card, CardContent, styled } from "@mui/material";
import useProgressiveQuality from "../../hooks/useProgressiveQuality";
import ProfileBit from "./Components/PostProfile";

const StyledCard = styled(Card)({
  borderRadius: "8px",
  marginBottom: "8px",
  border: "1px solid #e5e5e5",
});

const StyledImageBox = styled(Box)({
  maxHeight: "350px",
  maxWidth: "95%",
  overflow: "hidden",
  borderRadius: "8px",
});

const StyledImage = styled("img")(({ blur }: { blur: boolean }) => ({
  width: "100%",
  filter: blur ? "blur(20px)" : "none",
  transition: "filter 0.3s ease-out, transform 0.3s ease-out",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));

const StyledContentBox = styled(Box)({

});

const ImagePost: FC<FeedPost> = (post: FeedPost) => {
  const {
    image, post_date, post_text,
  } = post;
  const [src, { blur }] = useProgressiveQuality(image?.thumb, image?.large);

  return (
    <StyledCard elevation={0}>
      <CardContent>
        <StyledImageBox>
          <StyledImage
            src={src}
            alt="post"
            blur={blur}
          />
        </StyledImageBox>
        <StyledContentBox>
          {/* TODO: Profile, date, text, vehicle */}
          <br />
          {(new Date(post_date)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' } as any)}
          <br />
          {post_text}
          <br />
          <ProfileBit post={post} />
        </StyledContentBox>
      </CardContent>
    </StyledCard>
  );
};

export default ImagePost;
