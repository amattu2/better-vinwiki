import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Avatar, Chip } from "@mui/material";
import useUsernameLookup, { LookupStatus } from "../../hooks/useUsernameLookup";

type Props = {
  handle: string;
};

/**
 * A generic text/body display for Feed Post or Comment
 * parsing for @mentions
 *
 * @param {FeedPost} post
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
    />
  );
};

export default MentionChip;
