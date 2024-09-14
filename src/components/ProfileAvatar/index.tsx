import React from "react";
import { Avatar, AvatarProps, styled } from "@mui/material";

type Props = {
  username: Profile["username"];
  avatar?: Profile["avatar"];
  rounded?: boolean;
} & AvatarProps;

const StyledAvatar = styled(Avatar, { shouldForwardProp: (p) => p !== "rounded" })(
  ({ rounded }: { rounded?: boolean }) => ({
    borderRadius: rounded ? "50%" : "8px",
  })
);

/**
 * A generic User/Profile Avatar component
 *
 * @returns {JSX.Element}
 */
const ProfileAvatar: React.FC<Props> = ({ username, avatar, rounded, ...avatarProps }: Props) => {
  if (avatar) {
    return <StyledAvatar rounded={rounded} src={avatar} alt={username} {...avatarProps} />;
  }

  return (
    <StyledAvatar rounded={rounded} {...avatarProps}>
      {username.toUpperCase().slice(0, 2) || "NA"}
    </StyledAvatar>
  );
};

export default ProfileAvatar;
