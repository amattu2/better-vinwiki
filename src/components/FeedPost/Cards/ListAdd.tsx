import React, { FC, Ref, forwardRef, useRef, useState } from "react";
import { Delete, MoreVert, PlaylistAdd } from "@mui/icons-material";
import {
  Card, CardContent, IconButton,
  ListItemIcon, ListItemText, Menu,
  MenuItem, Skeleton, styled,
} from "@mui/material";
import { useAuthProvider } from "../../../Providers/AuthProvider";
import usePostDeleteWrapper from "../../../hooks/usePostDeleteWrapper";
import { ENDPOINTS } from "../../../config/Endpoints";
import GenericText from "../../GenericText/GenericText";
import DeleteContentDialog from "../../DeleteContentConfirm";
import ProfileBit, { PostProfileSkeleton } from "../Components/PostProfile";
import PostMeta from "../Components/PostMeta";
import ListAssignmentDialog from "../../ListAssignmentDialog";

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
const ListAddPost: FC<FeedPostProps> = forwardRef(({ isPreview, isVehiclePage, ...post }: FeedPostProps, ref: Ref<HTMLDivElement>) => {
  const { token, profile } = useAuthProvider();
  const { removePost: deletePostByUUID } = usePostDeleteWrapper();
  const { uuid, subject_uuid, person, vehicle } = post;
  const rootRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [listDialogOpen, setListDialogOpen] = useState<boolean>(false);

  const menuToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(!open);
  };

  const confirmDelete = () => {
    setDeleteDialogOpen(true);
    setOpen(false);
  };

  const addToList = () => {
    setListDialogOpen(true);
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
        <PostMeta post={post} paddingLeft="8px" />
      </CardContent>
      {(!isPreview && (profile?.uuid === person.uuid || !isVehiclePage)) && (
        <>
          <StyledMenuButton size="small" onClick={menuToggle}>
            <MoreVert fontSize="small" />
          </StyledMenuButton>
          <Menu open={open} anchorEl={anchorEl} onClose={() => setOpen(false)}>
            {profile?.uuid === person.uuid && (
              <MenuItem onClick={confirmDelete}>
                <ListItemIcon>
                  <Delete fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            )}
            {(profile?.uuid !== person.uuid && !isVehiclePage) && (
              <MenuItem onClick={addToList}>
                <ListItemIcon>
                  <PlaylistAdd fontSize="small" />
                </ListItemIcon>
                <ListItemText>Add to List</ListItemText>
              </MenuItem>
            )}
          </Menu>
        </>
      )}
      <DeleteContentDialog
        type="post"
        open={deleteDialogOpen}
        onConfirm={deletePost}
        onCancel={() => setDeleteDialogOpen(false)}
      />
      {listDialogOpen && (<ListAssignmentDialog vehicle={vehicle} onClose={() => setListDialogOpen(false)} />)}
    </StyledCard>
  );
});

export default ListAddPost;
