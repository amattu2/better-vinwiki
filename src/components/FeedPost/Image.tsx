import React, { FC, Ref, forwardRef, useRef, useState } from "react";
import { AspectRatio, Delete, MoreVert, Share } from "@mui/icons-material";
import {
  Box, Card, CardContent, Grid,
  IconButton, ListItemIcon, ListItemText,
  Menu, MenuItem, Modal, Stack,
  Typography, styled,
} from "@mui/material";
import { useCopyToClipboard } from "usehooks-ts";
import useProgressiveQuality from "../../hooks/useProgressiveQuality";
import PostComments from "./Components/PostComments";
import ProfileBit from "./Components/PostProfile";
import GenericText from "../GenericText/GenericText";
import { formatDateTime } from "../../utils/date";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { useFeedProvider } from "../../Providers/FeedProvider";
import DeletePostDialog from "./Components/DeletePostDialog";

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
  position: "relative",
  background: "#ddd",
  "&:hover .expand-button": {
    opacity: 1,
  },
});

const StyledBackground = styled("div", {
  shouldForwardProp: (p) => p !== "bg" && p !== "blur",
})(({ bg, blur }: { bg?: string, blur?: boolean }) => ({
  backgroundImage: `url(${bg})`,
  filter: blur ? "blur(6px)" : "none",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
  transition: "filter 0.3s ease-out",
  "&:hover": {
    filter: "brightness(0.8)",
  },
}));

const StyledMenuButton = styled(IconButton)({
  position: "absolute",
  right: "8px",
  top: "8px",
});

const StyledButton = styled("div")({
  position: "absolute",
  right: "8px",
  top: "8px",
  cursor: "pointer",
  color: "#fff",
  opacity: 0,
  transition: "opacity 0.3s ease-out",
  zIndex: 2,
});

const StyledExpandedBox = styled(Box)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
});

const StyledExpandedImage = styled("img")({
  maxHeight: "80vh",
  maxWidth: "80vw",
  borderRadius: "8px",
});

const ImagePost: FC<FeedPostProps> = forwardRef(({ isPreview, ...post }: FeedPostProps, ref: Ref<HTMLDivElement>) => {
  const { profile } = useAuthProvider();
  const { deletePost: deletePostByUUID } = useFeedProvider();
  const { uuid, image, comment_count, post_text, person } = post;
  const [src, { blur }] = useProgressiveQuality(image?.thumb, image?.large);
  const rootRef = useRef<HTMLDivElement>(null);

  const [expandedOpen, setExpandedOpen] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, copyValue] = useCopyToClipboard();

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
    await deletePostByUUID?.(uuid);
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
    <>
      <StyledCard elevation={0} onClick={openPost} ref={ref}>
        <CardContent ref={rootRef}>
          <Grid container>
            <Grid item xs={8}>
              <StyledImageBox className="image-box">
                <StyledBackground bg={src} blur={blur} />
                <StyledButton className="expand-button" onClick={() => setExpandedOpen(true)}>
                  <AspectRatio />
                </StyledButton>
              </StyledImageBox>
            </Grid>
            <Grid item xs={4}>
              <Stack gap={1}>
                <ProfileBit post={post} />
                <GenericText content={post_text} />
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
          {!isPreview && <PostComments key={uuid} uuid={uuid} count={comment_count} />}
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
      <Modal open={expandedOpen} onClose={() => setExpandedOpen(false)}>
        <StyledExpandedBox>
          <StyledExpandedImage src={src} alt={post_text} />
        </StyledExpandedBox>
      </Modal>
    </>
  );
});

export default ImagePost;
