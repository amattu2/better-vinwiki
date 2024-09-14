import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Avatar, Chip } from "@mui/material";
import useProfileLookup, { LookupStatus } from "../../hooks/useProfileLookup";

type Props = {
  uuid: string;
};

/**
 * A profile UUID chip that returns a `@mention` chip
 * if the user exists. Otherwise, returns a localized
 * link to the profile.
 *
 * Not to be confused with the `<MentionChip />` itself, which
 * is used when `@username` is in the post body.
 *
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
    />
  );
};

export default ProfileLinkChip;
