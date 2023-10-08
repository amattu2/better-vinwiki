import React, { FC, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AutoResizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from "react-window";
import {
  Divider, Drawer, List, ListItem,
  ListItemAvatar, ListItemText,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography, styled,
} from "@mui/material";
import { SortByAlpha, Event } from "@mui/icons-material";
import { cloneDeep } from "lodash";
import { useAuthProvider } from "../../Providers/AuthProvider";
import useFollowingLookup, { LookupStatus } from "../../hooks/useFollowingLookup";
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

const StyledStack = styled(Stack)({
  padding: "16px",
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

  const [status, { following }] = useFollowingLookup(profile!.uuid, false);
  const [sort, setSort] = useState<"alpha" | "date">("alpha");

  const data: Profile[] = useMemo(() => {
    if (!following || status !== LookupStatus.Success) {
      return [];
    }

    const cloned: Profile[] = cloneDeep(following);
    if (sort === "alpha") {
      cloned?.sort((a, b) => a.username.localeCompare(b.username));
    }

    return cloned;
  }, [following, sort]);

  return (
    <StyledDrawer anchor="left" open={open} onClose={onClose}>
      <StyledStack direction="row" alignItems="center">
        <Typography variant="h6" fontWeight={600}>Following &ndash; Quick Look</Typography>
        <ToggleButtonGroup
          color="primary"
          value={sort}
          onChange={(e, value) => setSort(value || "alpha")}
          size="small"
          sx={{ ml: "auto" }}
          exclusive
        >
          <ToggleButton value="alpha">
            <Tooltip title="Alphabetical">
              <SortByAlpha />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="date">
            <Tooltip title="Follow Date">
              <Event />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </StyledStack>
      <Divider />
      <StyledList component="div">
        {!data?.length && (
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
              itemCount={data.length || 0}
            >
              {({ index, style }) => {
                const { uuid, username, avatar, follower_count } = data[index] || {};

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
                      secondary={`${follower_count} follower${(parseInt(follower_count.toString(), 10)) !== 1 ? "s" : ""}`}
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
