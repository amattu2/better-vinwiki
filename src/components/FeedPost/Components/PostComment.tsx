import React, { FC, useState } from "react";
import { Link } from "react-router-dom";
import { Delete, MoreVert } from "@mui/icons-material";
import {
  Collapse, Divider, IconButton, ListItemIcon,
  ListItemText, Menu, MenuItem, Stack,
  Typography, styled,
} from "@mui/material";
import { ENDPOINTS } from "../../../config/Endpoints";
import { useAuthProvider } from "../../../Providers/AuthProvider";
import { formatDateTime } from "../../../utils/date";
import ProfileAvatar from "../../ProfileAvatar";
import GenericText from "../../GenericText/GenericText";

type Props = {
  comment: PostComment;
  divider?: boolean;
};

const StyledStack = styled(Stack)({
  borderRadius: "8px",
  padding: "8px",
  position: "relative",
});

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

const StyledMenuButton = styled(IconButton)({
  position: "absolute",
  right: "8px",
  top: "8px",
});

/**
 * A representation of a Feed Post Comment
 *
 * @param {PostComment} comment
 * @returns {JSX.Element}
 */
const PostComment: FC<Props> = ({ comment, divider }: Props) => {
  const { token, profile } = useAuthProvider();
  const { uuid, person, text } = comment;
  const { uuid: authorUuid, username, avatar } = person;

  const [deleted, setDeleted] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  const deleteComment = async () => {
    setDeleted(true);
    setOpen(false);

    await fetch(ENDPOINTS.post_comment_delete + uuid, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => null);
  };

  return (
    <>
      <Collapse in={!deleted}>
        <StyledStack direction="row" gap={2}>
          <ProfileAvatar username={username} avatar={avatar} />
          <Stack direction="column" gap={1}>
            <Typography component={StyledLink} variant="body1" fontWeight={600} to={`/profile/${authorUuid}`}>
              {`@${username}`}
            </Typography>
            <GenericText content={text} />
            <Typography variant="body2" color="textSecondary" fontSize={12} fontWeight={600}>
              {formatDateTime(new Date(comment.created))}
            </Typography>
          </Stack>
          {(profile?.uuid === authorUuid) && (
            <>
              <StyledMenuButton size="small" onClick={menuToggle}>
                <MoreVert fontSize="small" />
              </StyledMenuButton>
              <Menu open={open} anchorEl={anchorEl} onClose={() => setOpen(false)}>
                <MenuItem onClick={deleteComment}>
                  <ListItemIcon>
                    <Delete fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Delete</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </StyledStack>
      </Collapse>
      {(divider && !deleted) && <Divider />}
    </>
  );
};

export default PostComment;
