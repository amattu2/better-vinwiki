import React, { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, Chip, styled } from "@mui/material";
import { ENDPOINTS, STATUS_OK } from "../../config/Endpoints";
import { useAuthProvider } from "../../Providers/AuthProvider";

type Props = {
  handle: string;
};

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
  marginRight: "2px",
});

const searchUser = async (handle: string, token: string) : Promise<Pick<Profile, "uuid" | "first_name" | "last_name"> | null> => {
  const response = await fetch(ENDPOINTS.profile_username_search + handle, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { status, person } = await response.json();
  if (status === STATUS_OK && !!person?.uuid) {
    return person;
  }

  return null;
};

/**
 * A generic text/body display for Feed Post or Comment
 * parsing for @mentions
 *
 * @param {FeedPost} post
 * @returns {JSX.Element}
 */
const GenericText: FC<Props> = ({ handle }: Props) => {
  const { token } = useAuthProvider();
  const [user, setUser] = useState<Pick<Profile, "uuid" | "first_name" | "last_name"> | null>(null);

  useEffect(() => {
    if (token) {
      searchUser(handle, token).then((user) => {
        if (!user) {
          return;
        }

        setUser(user);
      });
    }
  }, [handle, token]);

  if (!user) {
    return (`@${handle}`);
  }

  return (
    <StyledLink to={user?.uuid ? `/profile/${user.uuid}` : ""}>
      <Chip
        avatar={<Avatar>{handle.charAt(0).toUpperCase()}</Avatar>}
        label={handle}
      />
    </StyledLink>
  );
};

export default GenericText;
