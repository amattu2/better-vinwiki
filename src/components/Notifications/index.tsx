import React, { FC, useEffect, useState } from "react";
import {
  CircularProgress, List, ListItem,
  ListItemAvatar, ListItemText, Typography,
  styled
} from "@mui/material";
import { Link } from "react-router-dom";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../../config/Endpoints";
import { formatDateTime } from "../../utils/date";
import ProfileAvatar from "../ProfileAvatar";

type Props = {
  preload: boolean;
}

const StyledList = styled(List)({
  maxWidth: "350px",
  padding: "0",
});

const StyledListItem = styled(ListItem, { shouldForwardProp: (p) => p !== "unread" })(({ unread }: { unread: boolean }) => ({
  borderLeft: unread ? "4px solid #1976d2" : "none",
}));

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

const getNotifications = async (token: string) => {
  const response = await fetch(ENDPOINTS.notifications, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { notifications, status } = await response.json();
  if (status === STATUS_OK && notifications?.length) {
    return notifications.map((notification: { notification: ProfileNotification }) => (notification.notification));
  }
};

export const Notifications: FC<Props> = ({ preload }: Props) => {
  const { token } = useAuthProvider();
  const [data, setData] = useState<ProfileNotification[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!preload || !token) {
      return;
    }

    setLoading(true);

    (async () => {
      const notifications = await getNotifications(token);
      setData(notifications || []);
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preload]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!data) {
    return <Typography variant="body1">No notifications</Typography>;
  }

  return (
    <StyledList dense>
      {data.map(({ uuid, sender, type, text, post, created_date, seen }: ProfileNotification, index: number) => (
        <StyledListItem key={uuid} divider={index < data.length - 1} unread={!seen}>
          <ListItemAvatar>
            <ProfileAvatar username={sender.username} avatar={sender.avatar} />
          </ListItemAvatar>
          <ListItemText>
            <StyledLink to={`/profile/${sender.uuid}`} target='_blank'>
              <Typography variant="body1" fontWeight={600}>
                @{sender.username}
              </Typography>
            </StyledLink>
            {["origin_author", "post_mention"].includes(type) ? (
              <StyledLink to={`/post/${post.uuid}`} target='_blank'>
                <Typography variant="body2">
                  {text}
                </Typography>
              </StyledLink>
            ) : text}
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {formatDateTime(new Date(created_date))}
            </Typography>
          </ListItemText>
        </StyledListItem>
      ))}
    </StyledList>
  );
};

export default Notifications;
