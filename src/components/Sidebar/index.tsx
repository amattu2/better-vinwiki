import React, { ElementType, FC, useState } from 'react';
import { Link, NavigateProps, useLocation } from 'react-router-dom';
import {
  Code, DashboardOutlined, Logout, NotificationsActive,
  PeopleOutline, SearchOutlined, ListOutlined,
} from '@mui/icons-material';
import {
  Avatar, Badge, IconButton, Popover,
  Tooltip, Typography, Box, Stack, styled,
} from '@mui/material';
import { useAuthProvider } from '../../Providers/AuthProvider';
import { useNotificationCountProvider } from '../../Providers/NotificationCountProvider';
import { Notifications } from '../Notifications';
import { FollowersDrawer } from '../FollowersDrawer';
import { MEDIA_CDN } from '../../config/Endpoints';

const StyledBox = styled(Box)({
  padding: "32px 12px",
  background: "#fff",
  width: "72px",
  borderRight: "1px solid #ddd",
  position: "fixed",
  top: "0",
  left: "0",
  bottom: "0",
  "& *": {
    userSelect: "none",
  },
});

const StyledLogoBox = styled(Box)({
  margin: "15px auto",
});

const StyledLogo = styled('img')({
  width: "100%",
  height: "auto",
  border: "1px solid #ddd",
  borderRadius: "6px",
});

const StyledAvatarBox = styled(StyledLogoBox)({
  marginTop: "35px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const StyledControlGroup = styled(Stack)({
  marginTop: "42px",
  textAlign: "center",
  "&:last-of-type": {
    position: "absolute",
    bottom: "32px",
  },
});

const StyledIconButton = styled(IconButton)<{ component?: ElementType, to?: NavigateProps["to"] }>({
  color: "rgba(0, 0, 0, 0.54)",
  height: "47px",
});

const StyledLink = styled(Link)({
  color: "inherit",
  textDecoration: "none",
});

const Sidebar: FC = () => {
  const { authenticated, profile } = useAuthProvider();
  const { unseen } = useNotificationCountProvider();
  const { pathname } = useLocation();

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const openNotifications = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
    setOpen(true);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  if (!authenticated) {
    return null;
  }

  return (
    <StyledBox>
      <StyledLogoBox>
        <StyledLogo src="https://api.placeholder.app/image/90x90/3b3b3b?text=BV" alt="logo" />
      </StyledLogoBox>
      <StyledAvatarBox>
        <Avatar
          component={StyledLink}
          to={`/profile/${profile.uuid}`}
          sx={{ width: 36, height: 36 }}
          src={profile.avatar ? `${MEDIA_CDN}${profile.avatar}` : undefined}
        >
          {profile?.username?.charAt(0).toUpperCase()}
        </Avatar>
      </StyledAvatarBox>
      <StyledControlGroup direction="column" gap={1}>
        <StyledIconButton component={StyledLink} to="/search" disabled={pathname === "/search"}>
          <Tooltip title="Search" placement="right">
            <SearchOutlined />
          </Tooltip>
        </StyledIconButton>
        <StyledIconButton component={StyledLink} to="/" disabled={pathname === "/"}>
          <Tooltip title="Feed" placement="right">
            <DashboardOutlined />
          </Tooltip>
        </StyledIconButton>
        <StyledIconButton component={StyledLink} to="/lists" disabled={pathname === "/lists"}>
          <Tooltip title="Lists" placement="right">
            <ListOutlined />
          </Tooltip>
        </StyledIconButton>
        <StyledIconButton onClick={toggleDrawer}>
          <Tooltip title="Following" placement="right">
            <PeopleOutline />
          </Tooltip>
        </StyledIconButton>
      </StyledControlGroup>
      <StyledControlGroup direction="column" gap={1}>
        <Typography variant="caption" color="textSecondary" fontWeight={600}>
          Tools
        </Typography>
        <IconButton onClick={openNotifications}>
          <Tooltip title="Notifications" placement="right">
            <Badge badgeContent={unseen} color="error">
              <NotificationsActive />
            </Badge>
          </Tooltip>
        </IconButton>
        <IconButton>
          <StyledLink to="documentation" target="_blank">
            <Tooltip title="API Documentation" placement="right">
              <Code />
            </Tooltip>
          </StyledLink>
        </IconButton>
        <IconButton>
          <StyledLink to="/logout">
            <Tooltip title="Logout" placement="right">
              <Logout />
            </Tooltip>
          </StyledLink>
        </IconButton>
      </StyledControlGroup>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Notifications preload={open} />
      </Popover>
      <FollowersDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </StyledBox>
  );
};

export default Sidebar;
