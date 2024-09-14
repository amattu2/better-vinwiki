import React, { FC, Ref, forwardRef, useRef, useState } from "react";
import { Delete, MoreVert, PlaylistAdd, Share } from "@mui/icons-material";
import {
  Card,
  CardContent,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Theme,
  styled,
} from "@mui/material";
import { useCopyToClipboard } from "usehooks-ts";
import { useAuthProvider } from "../../../Providers/AuthProvider";
import usePostDeleteWrapper from "../../../hooks/usePostDeleteWrapper";
import { ENDPOINTS } from "../../../config/Endpoints";
import GenericText from "../../GenericText/GenericText";
import DeleteContentDialog from "../../DeleteContentConfirm";
import PostComments from "../Components/PostComments";
import ProfileBit, { PostProfileSkeleton } from "../Components/PostProfile";
import PostMeta from "../Components/PostMeta";
import ListAssignmentDialog from "../../ListAssignmentDialog";

const StyledCard = styled(Card, { shouldForwardProp: (p) => p !== "hoverAction" })<{
  hoverAction?: boolean;
  theme?: Theme;
}>(({ hoverAction, theme }) => ({
  borderRadius: "8px",
  marginBottom: "8px",
  border: `1px solid ${theme?.palette.divider}`,
  position: "relative",
  transition: "border-color 0.2s ease-out",
  [hoverAction ? "&:hover" : ""]: {
    borderColor: "#bdbdbd",
    cursor: "pointer",
  },
}));

const StyledMenuButton = styled(IconButton)({
  position: "absolute",
  right: "8px",
  top: "8px",
});

/**
 * A skeleton representation of TextPost
 *
 * @returns {JSX.Element}
 */
export const TextPostSkeleton: FC = () => (
  <StyledCard
    elevation={0}
    sx={{ "&:hover": { cursor: "initial", borderColor: (theme) => theme.palette.divider } }}
  >
    <CardContent>
      <PostProfileSkeleton filled={false} />
      <Skeleton
        variant="text"
        width={375}
        sx={{ fontSize: "0.875rem", ml: "8px" }}
        animation="wave"
      />
      <Skeleton
        variant="text"
        width={350}
        sx={{ fontSize: "0.875rem", mb: 1, ml: "8px" }}
        animation="wave"
      />
      <Skeleton variant="text" width={150} sx={{ fontSize: "12px", ml: "8px" }} animation="wave" />
    </CardContent>
  </StyledCard>
);

/**
 * A post with only text content
 *
 * @param {FeedPostProps} post
 * @returns {JSX.Element}
 */
const TextPost: FC<FeedPostProps> = forwardRef(
  (
    { isPreview, isIndividual, isVehiclePage, ...post }: FeedPostProps,
    ref: Ref<HTMLDivElement>
  ) => {
    const { token, profile } = useAuthProvider();
    const { removePost: deletePostByUUID } = usePostDeleteWrapper();
    const { uuid, comment_count, post_text, person, vehicle } = post;
    const rootRef = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [, copyValue] = useCopyToClipboard();
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

    const openPost = (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target !== rootRef.current) {
        return;
      }
      if (isPreview || isIndividual) {
        return;
      }

      window.open(`/post/${uuid}`, "_blank");
    };

    const copyPostURL = () => {
      copyValue(`${window.location.origin}/post/${uuid}`);
      setOpen(false);
    };

    return (
      <StyledCard
        elevation={0}
        onClick={openPost}
        ref={ref}
        hoverAction={!isPreview && !isIndividual}
      >
        <CardContent ref={rootRef}>
          <ProfileBit post={post} filled={false} />
          <GenericText content={post_text} padding="8px" />
          <PostMeta post={post} paddingLeft="8px" />
          {!isPreview && !isIndividual && (
            <PostComments key={uuid} uuid={uuid} count={comment_count} />
          )}
        </CardContent>
        {!isPreview && (
          <>
            <StyledMenuButton size="small" onClick={menuToggle}>
              <MoreVert fontSize="small" />
            </StyledMenuButton>
            <Menu open={open} anchorEl={anchorEl} onClose={() => setOpen(false)}>
              <MenuItem onClick={copyPostURL}>
                <ListItemIcon>
                  <Share fontSize="small" />
                </ListItemIcon>
                <ListItemText>Copy Link</ListItemText>
              </MenuItem>
              {!isVehiclePage && (
                <MenuItem onClick={addToList}>
                  <ListItemIcon>
                    <PlaylistAdd fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Add to List</ListItemText>
                </MenuItem>
              )}
              {profile?.uuid === person.uuid && (
                <MenuItem onClick={confirmDelete}>
                  <ListItemIcon>
                    <Delete fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Delete</ListItemText>
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
        {listDialogOpen && (
          <ListAssignmentDialog vehicle={vehicle} onClose={() => setListDialogOpen(false)} />
        )}
      </StyledCard>
    );
  }
);

export default TextPost;
