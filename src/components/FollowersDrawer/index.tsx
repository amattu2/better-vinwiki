import React, { FC } from "react";
import { Link } from "react-router-dom";
import AutoResizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from "react-window";
import {
  Divider, Drawer, List, ListItem,
  ListItemAvatar, ListItemText,
  Typography, styled,
} from "@mui/material";
import { useAuthProvider } from "../../Providers/AuthProvider";
import useFollowingLookup from "../../hooks/useFollowingLookup";
import ProfileAvatar from "../ProfileAvatar";

type Props = {
  open: boolean;
  onClose: () => void;
};

const StyledDrawer = styled(Drawer)({
  "& .MuiDrawer-paper": {
    width: "350px",
  },
});

const StyledList = styled(List)<{ component: React.ElementType }>({
  paddingTop: 0,
  paddingBottom: 0,
  height: "100%",
  "& .MuiListItem-root:last-child": {
    borderBottom: "unset",
  },
});

const StyledLink = styled(Link)({
  color: "inherit",
  textDecoration: "none",
});

/**
 * A drawer that fetches and contains the authenticated user's following list
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
export const FollowersDrawer: FC<Props> = ({ open, onClose }: Props) => {
  const { profile } = useAuthProvider();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_status, { following }] = useFollowingLookup(profile!.uuid, false);

  return (
    <StyledDrawer anchor="left" open={open} onClose={onClose}>
      <Typography variant="h6" fontWeight={600} padding="16px">Following &ndash; Quick Look</Typography>
      <Divider />
      <StyledList component="div">
        {!following?.length && (
          <ListItem>
            <ListItemText
              primary="You are not following anyone."
              secondary="Follow someone to see their posts."
            />
          </ListItem>
        )}
        <AutoResizer>
          {({ height = 100, width = 100 }) => (
            <FixedSizeList
              height={height}
              width={width}
              itemSize={57}
              itemCount={following?.length || 0}
            >
              {({ index, style }) => {
                const { uuid, username, avatar, follower_count } = following?.[index] || {};

                if (!uuid || !username) {
                  return null;
                }

                return (
                  <ListItem key={uuid} component={StyledLink} to={`/profile/${uuid}`} onClick={onClose} style={style} divider>
                    <ListItemAvatar>
                      <ProfileAvatar username={username} avatar={avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body1" fontWeight={600}>{`@${username}`}</Typography>}
                      secondary={`${follower_count} followers`}
                    />
                  </ListItem>
                );
              }}
            </FixedSizeList>
          )}
        </AutoResizer>
      </StyledList>
    </StyledDrawer>
  );
};

export default FollowersDrawer;
