import React, { FC, Ref, forwardRef, useRef, useState } from "react";
import { Delete, MoreVert, Share } from "@mui/icons-material";
import {
  Box, Card, CardContent, Grid,
  IconButton, ListItemIcon, ListItemText,
  Menu, MenuItem, Skeleton, Stack,
  Typography, styled,
} from "@mui/material";
import { useCopyToClipboard } from "usehooks-ts";
import { useAuthProvider } from "../../../Providers/AuthProvider";
import { useFeedProvider } from "../../../Providers/FeedProvider";
import { ENDPOINTS } from "../../../config/Endpoints";
import { formatDateTime } from "../../../utils/date";
import { ExpandableImage } from "../../ExpandableImage";
import GenericText from "../../GenericText/GenericText";
import DeletePostDialog from "../Components/DeletePostDialog";
import PostComments from "../Components/PostComments";
import ProfileBit, { PostProfileSkeleton } from "../Components/PostProfile";
import Repeater from "../../Repeater";

const StyledCard = styled(Card)({
  borderRadius: "8px",
  marginBottom: "8px",
  border: "1px solid #e5e5e5",
  position: "relative",
  transition: "border-color 0.2s ease-out",
  "&:hover": {
    borderColor: "#bdbdbd",
    cursor: "pointer",
  },
});

const StyledImageBox = styled(Box)({
  height: "250px",
  maxWidth: "95%",
  overflow: "hidden",
  borderRadius: "8px",
  marginLeft: "8px",
});

const StyledMenuButton = styled(IconButton)({
  position: "absolute",
  right: "8px",
  top: "8px",
});

const PostTextSkeleton: FC = () => (
  <Skeleton
    variant="text"
    width="85%"
    sx={{ fontSize: "0.875rem", ml: "8px" }}
    animation="wave"
  />
);

/**
 * A skeleton representation of ImagePost
 *
 * @returns {JSX.Element}
 */
export const ImagePostSkeleton: FC = () => (
  <StyledCard elevation={0} sx={{ "&:hover": { cursor: "initial", borderColor: "#e5e5e5" } }}>
    <CardContent>
      <Grid container>
        <Grid item xs={8}>
          <StyledImageBox>
            <Skeleton variant="rectangular" width="100%" height="100%" animation="wave" />
          </StyledImageBox>
        </Grid>
        <Grid item xs={4}>
          <Stack gap={1} direction="column" height="100%">
            <PostProfileSkeleton filled />
            <Box flexGrow={1}>
              <Repeater count={4} Component={PostTextSkeleton} />
            </Box>
            <Skeleton variant="text" width={150} sx={{ fontSize: "12px", ml: "8px" }} animation="wave" />
          </Stack>
        </Grid>
      </Grid>
    </CardContent>
  </StyledCard>
);

/**
 * A post with an image attached
 *
 * @param {FeedPostProps} post
 * @returns {JSX.Element}
 */
const ImagePost: FC<FeedPostProps> = forwardRef(({ isPreview, omitComments, ...post }: FeedPostProps, ref: Ref<HTMLDivElement>) => {
  const { token, profile } = useAuthProvider();
  const { removePost: deletePostByUUID } = useFeedProvider();
  const { uuid, image, comment_count, post_text, person } = post;
  const rootRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [, copyValue] = useCopyToClipboard();

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

  const openPost = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== rootRef.current) {
      return;
    }
    if (isPreview) {
      return;
    }

    window.open(`/post/${uuid}`, "_blank");
  };

  const copyPostURL = () => {
    copyValue(`${window.location.origin}/post/${uuid}`);
    setOpen(false);
  };

  return (
    <StyledCard elevation={0} onClick={openPost} ref={ref}>
      <CardContent ref={rootRef}>
        <Grid container>
          <Grid item xs={8}>
            <StyledImageBox>
              <ExpandableImage lowRes={image.thumb} highRes={image.large} alt={post_text} />
            </StyledImageBox>
          </Grid>
          <Grid item xs={4}>
            <Stack gap={1} direction="column" height="100%">
              <ProfileBit post={post} />
              <Box flexGrow={1}>
                <GenericText content={post_text} />
              </Box>
              <Typography variant="body2" color="textSecondary" fontSize={12} fontWeight={600}>
                {formatDateTime(new Date(post.post_date))}
                {post.locale && (
                  <>
                    {" • "}
                    {post.locale}
                  </>
                )}
                {(post.client && !["web", "vinbot"].includes(post.client)) && (
                  <>
                    {" • "}
                    {post.client}
                  </>
                )}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
        {(!isPreview && !omitComments) && <PostComments key={uuid} uuid={uuid} count={comment_count} />}
      </CardContent>
      {!isPreview && (
        <StyledMenuButton size="small" onClick={menuToggle}>
          <MoreVert fontSize="small" />
        </StyledMenuButton>
      )}
      <Menu open={open} anchorEl={anchorEl} onClose={() => setOpen(false)}>
        <MenuItem onClick={copyPostURL}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
        {profile?.uuid === person.uuid && (
          <MenuItem onClick={confirmDelete}>
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
      <DeletePostDialog
        type="post"
        open={deleteDialogOpen}
        onConfirm={deletePost}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </StyledCard>
  );
});

export default ImagePost;
