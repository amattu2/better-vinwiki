import React, { FC, useState } from 'react';
import { DashboardOutlined, Logout, NotificationsActive, Person2Outlined, SearchOutlined } from '@mui/icons-material';
import {
  Avatar, Badge, IconButton, Popover,
  Tooltip, Typography,
  Box, Stack, styled,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useAuthProvider } from '../../Providers/AuthProvider';
import { useNotificationCountProvider } from '../../Providers/NotificationCountProvider';
import { Notifications } from '../Notifications';

const StyledBox = styled(Box)({
  padding: "32px 12px",
  background: "#fff",
  width: "72px",
  borderRight: "1px solid #ebebeb",
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
  border: "1px solid #ebebeb",
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

const StyledIconButton = styled(IconButton)({
  color: "rgba(0, 0, 0, 0.54)",
});

const StyledLink = styled(Link)({
  color: "inherit",
  textDecoration: "none",
});

const Sidebar: FC = () => {
  const { authenticated, user } = useAuthProvider();
  const { unseen } = useNotificationCountProvider();
  const { pathname } = useLocation();

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const openNotifications = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
    setOpen(true);
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
        <StyledLink to="/profile">
          {user?.avatar ? (
            <StyledLogo src={user.avatar} alt="user" />
          ) : (
            <Avatar sx={{ width: 36, height: 36 }}>
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          )}
        </StyledLink>
      </StyledAvatarBox>
      <StyledControlGroup direction="column" gap={1}>
        <StyledIconButton disabled={pathname === "/"}>
          <StyledLink to="/">
            <Tooltip title="Feed" placement="right">
              <DashboardOutlined />
            </Tooltip>
          </StyledLink>
        </StyledIconButton>
        <StyledIconButton disabled={pathname === "/search"}>
          <StyledLink to="/search">
            <Tooltip title="Search" placement="right">
              <SearchOutlined />
            </Tooltip>
          </StyledLink>
        </StyledIconButton>
      </StyledControlGroup>
      <StyledControlGroup direction="column" gap={1}>
        <Typography variant="caption" color="textSecondary" fontWeight={600}>
          Account
        </Typography>
        <StyledIconButton disabled={pathname === "/profile"}>
          <StyledLink to="/profile">
            <Tooltip title="Profile" placement="right">
              <Person2Outlined />
            </Tooltip>
          </StyledLink>
        </StyledIconButton>
        <IconButton onClick={openNotifications}>
          <Tooltip title="Notifications" placement="right">
            <Badge badgeContent={unseen} color="error">
              <NotificationsActive />
            </Badge>
          </Tooltip>
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
    </StyledBox>
  );
};

export default Sidebar;
