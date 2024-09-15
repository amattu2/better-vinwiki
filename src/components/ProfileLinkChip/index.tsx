import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Avatar, Chip } from "@mui/material";
import useProfileLookup, { LookupStatus } from "../../hooks/useProfileLookup";

type Props = {
  uuid: string;
};

/**
 * A profile embed chip used to pretty-link to a user's profile when a full profile link
 * is in a message.
 *
 * @note This is the opposite of `<MentionChip />`, which is used when a username is known.
 * @param {Props} props
 * @returns {JSX.Element}
 */
const ProfileLinkChip: FC<Props> = ({ uuid }: Props) => {
  const [{ status, profile }] = useProfileLookup(uuid);

  if (status !== LookupStatus.Success || !profile?.username) {
    return <Link to={`/profile/${uuid}`}>{`${window.origin}/profile/${uuid}`}</Link>;
  }

  return (
    <Chip
      component={Link}
      avatar={<Avatar>{profile.username.charAt(0).toUpperCase()}</Avatar>}
      label={profile.username}
      to={`/profile/${uuid}`}
      size="small"
      data-testid="mention-chip"
      clickable
    />
  );
};

export default ProfileLinkChip;
