import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Avatar, Chip } from "@mui/material";
import useUsernameLookup, { LookupStatus } from "../../hooks/useUsernameLookup";

type Props = {
  handle: string;
};

/**
 * A `@mention` chip that links to a user's profile if they exist.
 * Otherwise, it just displays the handle.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const MentionChip: FC<Props> = ({ handle }: Props) => {
  const [status, { uuid }] = useUsernameLookup(handle);

  if (status !== LookupStatus.Success || !uuid) {
    return <span>{`@${handle}`}</span>;
  }

  return (
    <Chip
      component={Link}
      avatar={<Avatar>{handle.charAt(0).toUpperCase()}</Avatar>}
      label={handle}
      to={`/profile/${uuid}`}
      size="small"
      data-testid="mention-chip"
    />
  );
};

export default MentionChip;
