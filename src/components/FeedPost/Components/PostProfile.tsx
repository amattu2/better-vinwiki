import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Stack, Typography, styled } from "@mui/material";
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

/**
 * A general component for displaying a Profile of a Feed Post
 *
 * @param {FeedPost} post
 * @returns {JSX.Element}
 */
const ProfileBit: FC<Props> = ({ post, filled = true }: Props) => {
  const { person, vehicle } = post;
  const { uuid, username, avatar } = person;
  const { vin } = vehicle;

  return (
    <StyledStack direction="row" gap={1} filled={filled}>
      <ProfileAvatar username={username} avatar={avatar} />
      <Stack direction="column" justifyContent="center">
        <Typography variant="body1" fontWeight={600}>
          <StyledLink to={`/profile/${uuid}`}>@{username}</StyledLink>
        </Typography>
        <Typography variant="body2">
          <StyledLink to={`/vehicle/${vin}`}>{formatVehicleName(vehicle)}</StyledLink>
          {post.mileage && (
            <>
              {" - "}
              {formatOdometer(post.mileage)}mi
            </>
          )}
        </Typography>
      </Stack>
    </StyledStack>
  )
};

export default ProfileBit;
