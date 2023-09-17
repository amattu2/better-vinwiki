import React, { FC } from "react";
import { Link } from "react-router-dom";
import useUsernameLookup, { LookupStatus } from "../../hooks/useUsernameLookup";
import MentionChip from "../MentionChip";

type Props = {
  uuid: string;
};

/**
 * A profile UUID chip that returns a `@mention` chip
 * if the user exists. Otherwise, returns a localized
 * link to the profile.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const UUIDChip: FC<Props> = ({ uuid }: Props) => {
  const [status, { username }] = useUsernameLookup(uuid);

  if (status !== LookupStatus.Success || !username) {
    return (
      <Link to={`/profile/${uuid}`}>
        {`${window.origin}/profile/${uuid}`}
      </Link>
    );
  }

  return <MentionChip handle={username} />;
};

export default UUIDChip;
