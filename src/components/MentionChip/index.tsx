import React, { FC } from "react";
import { Link } from "react-router-dom";
import { Avatar, Chip, styled } from "@mui/material";
import useUsernameLookup, { LookupStatus } from "../../hooks/useUsernameLookup";

type Props = {
  handle: string;
};

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
  marginRight: "2px",
});

/**
 * A generic text/body display for Feed Post or Comment
 * parsing for @mentions
 *
 * @param {FeedPost} post
 * @returns {JSX.Element}
 */
const GenericText: FC<Props> = ({ handle }: Props) => {
  const [status, { uuid }] = useUsernameLookup(handle);

  if (status !== LookupStatus.Success || !uuid) {
    return <span>{`@${handle}`}</span>;
  }

  return (
    <StyledLink to={`/profile/${uuid}`}>
      <Chip avatar={<Avatar>{handle.charAt(0).toUpperCase()}</Avatar>} label={handle} />
    </StyledLink>
  );
};

export default GenericText;
