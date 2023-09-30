import React, { FC, Ref, forwardRef, useRef, useState } from "react";
import { Delete, MoreVert } from "@mui/icons-material";
import {
  Card, CardContent, IconButton,
  ListItemIcon, ListItemText, Menu,
  MenuItem, Skeleton, Typography, styled,
} from "@mui/material";
import { useAuthProvider } from "../../../Providers/AuthProvider";
import usePostDeleteWrapper from "../../../hooks/usePostDeleteWrapper";
import { ENDPOINTS } from "../../../config/Endpoints";
import { formatDateTime } from "../../../utils/date";
import GenericText from "../../GenericText/GenericText";
import DeletePostDialog from "../Components/DeletePostDialog";
import ProfileBit, { PostProfileSkeleton } from "../Components/PostProfile";

const StyledCard = styled(Card)({
  borderRadius: "8px",
  marginBottom: "8px",
  border: "1px solid #e5e5e5",
  position: "relative",
});

const StyledMenuButton = styled(IconButton)({
  position: "absolute",
  right: "8px",
  top: "8px",
});

/**
 * A skeleton representation of ListAddPost
 *
 * @returns {JSX.Element}
 */
export const ListAddPostSkeleton: FC = () => (
  <StyledCard elevation={0} sx={{ "&:hover": { cursor: "initial", borderColor: "#e5e5e5" } }}>
    <CardContent>
      <PostProfileSkeleton filled={false} />
      <Skeleton variant="text" width={375} sx={{ fontSize: "0.875rem", mb: 1, ml: "8px" }} animation="wave" />
      <Skeleton variant="text" width={150} sx={{ fontSize: "12px", ml: "8px" }} animation="wave" />
    </CardContent>
  </StyledCard>
);

/**
 * A post for the `list_add` type
 *
 * @param {FeedPostProps} post
 * @returns {JSX.Element}
 */
const ListAddPost: FC<FeedPostProps> = forwardRef(({ isPreview, ...post }: FeedPostProps, ref: Ref<HTMLDivElement>) => {
  const { token, profile } = useAuthProvider();
  const { removePost: deletePostByUUID } = usePostDeleteWrapper();
  const { uuid, subject_uuid, person } = post;
  const rootRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  const menuToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  const confirmDelete = () => {
    setDeleteDialogOpen(true);
    setOpen(false);
  };

  const deletePost = async () => {
    setDeleteDialogOpen(false);
    deletePostByUUID?.(uuid);

    await fetch(ENDPOINTS.post_delete + uuid, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => null);
  };

  return (
    <StyledCard elevation={0} ref={ref}>
      <CardContent ref={rootRef}>
        <ProfileBit post={post} filled={false} />
        <GenericText content={`Added to List ${window.origin}/lists/${subject_uuid}`} padding="8px" />
        <Typography variant="body2" color="textSecondary" fontSize={12} fontWeight={600} paddingLeft="8px">
          {formatDateTime(new Date(post.post_date))}
        </Typography>
      </CardContent>
      {(profile?.uuid === person.uuid && !isPreview) && (
        <>
          <StyledMenuButton size="small" onClick={menuToggle}>
            <MoreVert fontSize="small" />
          </StyledMenuButton>
          <Menu open={open} anchorEl={anchorEl} onClose={() => setOpen(false)}>
            <MenuItem onClick={confirmDelete}>
              <ListItemIcon>
                <Delete fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}
      <DeletePostDialog
        type="post"
        open={deleteDialogOpen}
        onConfirm={deletePost}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </StyledCard>
  );
});

export default ListAddPost;
