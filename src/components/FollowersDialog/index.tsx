import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Typography,
  styled,
} from '@mui/material';
import ProfileAvatar from '../ProfileAvatar';
import Repeater from '../Repeater';
import useFollowersLookup, { LookupStatus } from '../../hooks/useFollowersLookup';

type Props = {
  uuid: Profile["uuid"];
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
 * A dialog that displays the Followers of a user
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const FollowersDialog: FC<Props> = ({ uuid, onClose }: Props) => {
  const [status, { followers }] = useFollowersLookup(uuid, true);

  return (
    <StyledDialog maxWidth="sm" open onClose={onClose} fullWidth>
      <DialogTitle>
        Followers
      </DialogTitle>
      <StyledDialogContent>
        <List>
          {(status === LookupStatus.Loading) && (<Repeater count={6} Component={ProfileSkeleton} />)}
          {(status === LookupStatus.Success && followers?.length === 0) && (<NoFollowers />)}
          {(status === LookupStatus.Success && (followers?.length || 0) > 0) && (
            followers?.map((result) => {
              const { uuid, username, avatar, display_name } = result;

              if (!uuid || !username) {
                return null;
              }

              return (
                <ListItem key={uuid} component={StyledLink} to={`/profile/${uuid}`} target="_blank" divider>
                  <ListItemAvatar>
                    <ProfileAvatar username={username} avatar={avatar} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={display_name && <Typography variant="body1" fontWeight={600}>{display_name}</Typography>}
                    secondary={`@${username}`}
                  />
                </ListItem>
              );
            })
          )}
        </List>
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default FollowersDialog;
