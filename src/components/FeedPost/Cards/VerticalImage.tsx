import React, { FC, Ref, forwardRef, useRef, useState } from "react";
import { Delete, MoreVert, PlaylistAdd, Share } from "@mui/icons-material";
import {
  Box, Card, CardContent, IconButton,
  ListItemIcon, ListItemText, Menu,
  MenuItem, Skeleton, Stack, styled,
} from "@mui/material";
import { useCopyToClipboard } from "usehooks-ts";
import { useAuthProvider } from "../../../Providers/AuthProvider";
import usePostDeleteWrapper from "../../../hooks/usePostDeleteWrapper";
import { ENDPOINTS } from "../../../config/Endpoints";
import { ExpandableImage } from "../../ExpandableImage";
import GenericText from "../../GenericText/GenericText";
import DeleteContentDialog from "../../DeleteContentConfirm";
import PostComments from "../Components/PostComments";
import ProfileBit, { PostProfileSkeleton } from "../Components/PostProfile";
import PostMeta from "../Components/PostMeta";
import ListAssignmentDialog from "../../ListAssignmentDialog";

const StyledCard = styled(Card, { shouldForwardProp: (p) => p !== "hoverAction" })(({ hoverAction } : { hoverAction?: boolean }) => ({
  borderRadius: "8px",
  marginBottom: "8px",
  border: "1px solid #e5e5e5",
  position: "relative",
  transition: "border-color 0.2s ease-out",
  [hoverAction ? "&:hover" : ""]: {
    borderColor: "#bdbdbd",
    cursor: "pointer",
  },
}));

const StyledImageBox = styled(Box, { shouldForwardProp: (p) => p !== "isIndividual" })(({ isIndividual } : Pick<FeedPostProps, "isIndividual">) => ({
  height: isIndividual ? "450px" : "300px",
  maxWidth: "100%",
  overflow: "hidden",
  borderRadius: "8px",
}));

const StyledMenuButton = styled(IconButton)({
  position: "absolute",
  right: "8px",
  top: "8px",
});

/**
 * A skeleton representation of VerticalImagePost
 *
 * @returns {JSX.Element}
 */
export const VerticalImagePostSkeleton: FC = () => (
  <StyledCard elevation={0} sx={{ "&:hover": { cursor: "initial", borderColor: "#e5e5e5" } }}>
    <CardContent>
      <Stack direction="column" gap={1}>
        <Box>
          <Stack gap={1}>
            <PostProfileSkeleton filled />
            <Skeleton variant="text" width="90%" sx={{ fontSize: "0.875rem" }} animation="wave" />
            <Skeleton variant="text" width="85%" sx={{ fontSize: "0.875rem", mb: 1 }} animation="wave" />
          </Stack>
        </Box>
        <StyledImageBox>
          <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
        </StyledImageBox>
        <Skeleton variant="text" width={150} sx={{ fontSize: "12px" }} animation="wave" />
      </Stack>
    </CardContent>
  </StyledCard>
);

/**
 * A extension to the Image card but oriented vertically,
 * designed for images with lots of text
 *
 * @param {FeedPostProps} post
 * @returns {JSX.Element}
 */
const VerticalImagePost: FC<FeedPostProps> = forwardRef(({ isPreview, isIndividual, isVehiclePage, ...post }: FeedPostProps, ref: Ref<HTMLDivElement>) => {
  const { token, profile } = useAuthProvider();
  const { removePost: deletePostByUUID } = usePostDeleteWrapper();
  const { uuid, image, comment_count, post_text, person, vehicle } = post;
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
    <StyledCard elevation={0} onClick={openPost} ref={ref} hoverAction={!isPreview && !isIndividual}>
      <CardContent ref={rootRef}>
        <Stack direction="column" gap={1}>
          <Box>
            <Stack gap={1}>
              <ProfileBit post={post} />
              <GenericText content={post_text} />
            </Stack>
          </Box>
          <StyledImageBox isIndividual={isIndividual}>
            <ExpandableImage lowRes={image.thumb} highRes={image.large} alt={post_text} />
          </StyledImageBox>
          <PostMeta post={post} textAlign="right" />
        </Stack>
        {(!isPreview && !isIndividual) && <PostComments key={uuid} uuid={uuid} count={comment_count} />}
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
      {listDialogOpen && (<ListAssignmentDialog vehicle={vehicle} onClose={() => setListDialogOpen(false)} />)}
    </StyledCard>
  );
});

export default VerticalImagePost;
