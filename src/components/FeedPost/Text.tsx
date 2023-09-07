import { FC, Ref, forwardRef, useRef, useState } from "react";
import { Delete, MoreVert, Share } from "@mui/icons-material";
import {
  Card, CardContent, IconButton,
  ListItemIcon, ListItemText, Menu,
  MenuItem, Typography, styled
} from "@mui/material";
import { useCopyToClipboard } from "usehooks-ts";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { formatDateTime } from "../../utils/date";
import GenericText from "./Components/GenericText";
import PostComments from "./Components/PostComments";
import ProfileBit from "./Components/PostProfile";
import DeletePostDialog from "./Components/DeletePostDialog";
import { useFeedProvider } from "../../Providers/FeedProvider";

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

const StyledMenuButton = styled(IconButton)({
  position: "absolute",
  right: "8px",
  top: "8px",
});

const TextPost: FC<FeedPostProps> = forwardRef(({ isPreview, ...post }: FeedPostProps, ref: Ref<HTMLDivElement>) => {
  const { user } = useAuthProvider();
  const { deletePost: deletePostByUUID } = useFeedProvider();
  const { uuid, comment_count, post_text, person } = post;
  const rootRef = useRef<HTMLDivElement>(null);

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
    <StyledCard elevation={0} onClick={openPost} ref={ref}>
      <CardContent ref={rootRef}>
        <ProfileBit post={post} filled={false} />
        <GenericText content={post_text} padding="8px" />
        <Typography variant="body2" color="textSecondary" fontSize={12} fontWeight={600} paddingLeft="8px">
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
        {user?.uuid === person.uuid && (
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

export default TextPost;
