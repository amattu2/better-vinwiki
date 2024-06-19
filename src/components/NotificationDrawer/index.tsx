import React, { FC, useEffect, useMemo, useState } from "react";
import AutoResizer from "react-virtualized-auto-sizer";
import { FixedSizeList } from "react-window";
import {
  Divider,
  Drawer,
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
} from "@mui/material";
import { MarkEmailUnread, AllInbox } from "@mui/icons-material";
import { useAuthProvider } from "../../Providers/AuthProvider";
import ProfileAvatar from "../ProfileAvatar";
import { ENDPOINTS, STATUS_OK } from "../../config/Endpoints";
import { formatDateTime } from "../../utils/date";
import Repeater from "../Repeater";
import { StyledLink } from "../StyledLink";

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

const StyledListItem = styled(ListItem, { shouldForwardProp: (p) => p !== "unread" })(
  ({ unread }: { unread?: boolean }) => ({
    borderLeft: unread ? "4px solid #1976d2" : "none",
  })
);

const NotificationSkeleton: FC = () => (
  <StyledListItem alignItems="flex-start">
    <ListItemAvatar>
      <Skeleton variant="rounded" width={40} height={40} />
    </ListItemAvatar>
    <ListItemText
      primary={<Skeleton variant="text" width={100} height={24} animation="wave" />}
      secondary={
        <>
          <Skeleton variant="text" width={200} height={20} animation="wave" />
          <Skeleton variant="text" width={100} height={17} animation="wave" />
        </>
      }
    />
  </StyledListItem>
);

const getNotifications = async (
  token: string,
  signal: AbortSignal
): Promise<ProfileNotification[]> => {
  const response = await fetch(ENDPOINTS.notifications, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal,
  }).catch(() => null);

  const { notifications, status } = (await response?.json()) || {};
  if (status === STATUS_OK && notifications?.length) {
    return notifications.map(
      (notification: { notification: ProfileNotification }) => notification.notification
    );
  }

  return [];
};

/**
 * A sidebar drawer that contains a user's notifications
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
export const NotificationDrawer: FC<Props> = ({ open, onClose }: Props) => {
  const { token } = useAuthProvider();

  const [filter, setFilter] = useState<"all" | "unread">("unread");
  const [notifications, setNotifications] = useState<ProfileNotification[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!open || !token) {
      return () => {};
    }

    const controller = new AbortController();
    const { signal } = controller;

    setLoading(true);

    (async () => {
      const notifications = await getNotifications(token, signal);
      setNotifications(notifications || []);
      setLoading(false);
    })();

    return () => controller.abort();
  }, [open]);

  const data: ProfileNotification[] = useMemo(() => {
    if (!notifications || !notifications?.length || loading) {
      return [];
    }

    if (filter === "unread") {
      return notifications.filter(({ seen }) => !seen);
    }

    return notifications;
  }, [notifications, filter]);

  return (
    <StyledDrawer anchor="left" open={open} onClose={onClose}>
      <StyledStack direction="row" alignItems="center">
        <Typography variant="h6" fontWeight={600}>
          Notifications
        </Typography>
        <ToggleButtonGroup
          color="primary"
          value={filter}
          onChange={(e, value) => setFilter(value || "unread")}
          size="small"
          sx={{ ml: "auto" }}
          exclusive
        >
          <ToggleButton value="all">
            <Tooltip title="Show All">
              <AllInbox />
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="unread">
            <Tooltip title="Show Unread">
              <MarkEmailUnread />
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>
      </StyledStack>
      <Divider />
      <StyledList component="div">
        {!data.length && loading && <Repeater count={6} Component={NotificationSkeleton} />}
        {!loading && !data?.length && (
          <StyledListItem unread={false} sx={{ textAlign: "center" }}>
            <ListItemText secondary="Start interacting with other users to see notifications here." />
          </StyledListItem>
        )}
        <AutoResizer>
          {({ height = 100, width = 100 }) => (
            <FixedSizeList
              height={height}
              width={width}
              itemSize={92}
              itemCount={data.length || 0}
              style={data.length <= 0 ? { display: "none" } : undefined}
            >
              {({ index, style }) => {
                const { uuid, sender, type, text, post, created_date, seen } = data[index] || {};

                return (
                  <StyledListItem
                    key={uuid}
                    divider={index < data.length - 1}
                    unread={!seen}
                    style={style}
                    alignItems="flex-start"
                  >
                    <ListItemAvatar>
                      <ProfileAvatar username={sender.username} avatar={sender.avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <StyledLink to={`/profile/${sender.uuid}`} target="_blank">
                          <Typography variant="body1" fontWeight={600}>
                            {`@${sender.username}`}
                          </Typography>
                        </StyledLink>
                      }
                      secondary={
                        <>
                          {["origin_author", "post_mention", "comment_peer"].includes(type) ? (
                            <StyledLink to={`/post/${post.uuid}`} target="_blank">
                              <Typography
                                variant="body2"
                                sx={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {text}
                              </Typography>
                            </StyledLink>
                          ) : (
                            <Typography
                              variant="body2"
                              sx={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {text}
                            </Typography>
                          )}
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            fontSize={12}
                            fontWeight={600}
                            sx={{ mt: 0.5 }}
                          >
                            {formatDateTime(new Date(created_date))}
                          </Typography>
                        </>
                      }
                      secondaryTypographyProps={{ component: "div" }}
                    />
                  </StyledListItem>
                );
              }}
            </FixedSizeList>
          )}
        </AutoResizer>
      </StyledList>
    </StyledDrawer>
  );
};

export default NotificationDrawer;
