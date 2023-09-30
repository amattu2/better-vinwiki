import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Skeleton, Stack, Typography, styled } from "@mui/material";
import ProfileAvatar from "../../ProfileAvatar";
import { formatVehicleName, formatOdometer } from "../../../utils/vehicle";

type Props = {
  post: FeedPost;
  filled?: boolean;
};

const StyledStack = styled(Stack, { shouldForwardProp: (p) => p !== "filled" })(({ filled }: { filled: boolean }) => ({
  borderRadius: "8px",
  padding: "8px",
  backgroundColor: !filled ? "transparent" : "rgb(244, 247, 250)",
}));

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

export const PostProfileSkeleton: FC<{ filled?: boolean }> = ({ filled = true }) => (
  <StyledStack direction="row" gap={1} filled={filled}>
    <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: "8px" }} />
    <Stack direction="column" justifyContent="center">
      <Skeleton variant="text" width={100} sx={{ fontSize: "1rem" }} animation="wave" />
      <Stack direction="row" justifyContent="center" gap={1}>
        <Skeleton variant="text" width={120} sx={{ fontSize: "0.875rem" }} animation="wave" />
        <Skeleton variant="text" width={40} sx={{ fontSize: "0.875rem" }} animation="wave" />
      </Stack>
    </Stack>
  </StyledStack>
);

/**
 * A general component for displaying a Profile of a Feed Post
 *
 * @param {FeedPost} post
 * @returns {JSX.Element}
 */
const PostProfile: FC<Props> = ({ post, filled = true }: Props) => {
  const { person, vehicle } = post;
  const { uuid, username, avatar } = person;
  const { vin } = vehicle;

  return (
    <StyledStack direction="row" gap={1} filled={filled}>
      <ProfileAvatar username={username} avatar={avatar} />
      <Stack direction="column" justifyContent="center">
        <Typography variant="body1" fontWeight={600}>
          <StyledLink to={`/profile/${uuid}`}>
            @
            {username}
          </StyledLink>
        </Typography>
        <Typography variant="body2">
          <StyledLink to={`/vehicle/${vin}`}>{formatVehicleName(vehicle)}</StyledLink>
          {post.mileage && (
            <>
              {" - "}
              {formatOdometer(post.mileage)}
              mi
            </>
          )}
        </Typography>
      </Stack>
    </StyledStack>
  );
};

export default PostProfile;
