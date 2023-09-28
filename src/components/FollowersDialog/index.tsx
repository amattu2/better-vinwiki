import React, { FC, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FixedSizeList } from 'react-window';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { Event, SortByAlpha } from '@mui/icons-material';
import { cloneDeep } from 'lodash';
import ProfileAvatar from '../ProfileAvatar';
import Repeater from '../Repeater';
import useFollowersLookup, { LookupStatus, LookupType } from '../../hooks/useFollowersLookup';

type Props = {
  identifier: Profile["uuid"] | Vehicle["vin"];
  type: LookupType;
  count: number;
  onClose: () => void;
};

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    overflowX: "hidden",
  },
});

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

const StyledDialogContent = styled(DialogContent)({
  padding: "0 !important",
  backgroundColor: "#f4f7fa",
  "& .MuiList-root": {
    padding: "0 !important",
  },
  "& .MuiListItem-root:last-child": {
    borderBottom: "unset",
  },
});

const NoFollowers = () => (
  <Typography variant="body1" color="textSecondary" sx={{ padding: "16px" }} textAlign="center" fontSize={14}>
    Uh oh... No followers to see here
  </Typography>
);

const ProfileSkeleton: FC = () => (
  <ListItem divider>
    <ListItemAvatar>
      <Skeleton variant="rounded" width={40} height={40} animation="wave" />
    </ListItemAvatar>
    <ListItemText
      primary={<Skeleton variant="text" animation="wave" width={200} />}
      secondary={<Skeleton variant="text" animation="wave" width={150} />}
    />
  </ListItem>
);

/**
 * A dialog that displays the Followers of a model (Profile, vehicle, etc)
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const FollowersDialog: FC<Props> = ({ identifier, type, count, onClose }: Props) => {
  const [status, { followers }] = useFollowersLookup(identifier, type, true);
  const [sort, setSort] = useState<"date" | "alpha">("alpha");

  const skeletonCount = count > 0 && count < 8 ? count : 8;
  const data: Profile[] = useMemo(() => {
    if (!followers || status !== LookupStatus.Success) {
      return [];
    }

    const cloned: Profile[] = cloneDeep(followers);
    if (sort === "alpha") {
      cloned?.sort((a, b) => a.username.localeCompare(b.username));
    }

    return cloned;
  }, [followers, sort]);

  return (
    <StyledDialog maxWidth="sm" open onClose={onClose} fullWidth>
      <DialogTitle component={Stack} direction="row" alignItems="center">
        Followers
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
      </DialogTitle>
      <StyledDialogContent dividers>
        {(status !== LookupStatus.Loading && data.length === 0) && (<NoFollowers />)}
        <List>
          {(status === LookupStatus.Loading) && (<Repeater count={skeletonCount} Component={ProfileSkeleton} />)}
          <FixedSizeList
            height={57 * skeletonCount}
            width="100%"
            itemSize={57}
            itemCount={data.length}
            style={status !== LookupStatus.Success ? { display: "none" } : undefined}
          >
            {({ index, style }) => {
              const { uuid, username, avatar, display_name } = data[index];

              return (
                <ListItem key={uuid} component={StyledLink} to={`/profile/${uuid}`} divider style={style}>
                  <ListItemAvatar>
                    <ProfileAvatar username={username} avatar={avatar} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={display_name && <Typography variant="body1" fontWeight={600}>{display_name}</Typography>}
                    secondary={`@${username}`}
                  />
                </ListItem>
              );
            }}
          </FixedSizeList>
        </List>
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default FollowersDialog;
