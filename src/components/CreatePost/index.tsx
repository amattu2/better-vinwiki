import React, { FC, useState } from "react";
import { Card, IconButton, Stack, TextField, styled } from "@mui/material";
import ProfileAvatar from "../ProfileAvatar";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { AddPhotoAlternate } from "@mui/icons-material";

const StyledCard = styled(Card)({
  padding: "12px",
  borderRadius: "8px",
  margin: "8px 0",
  border: "1px solid #e5e5e5",
  position: "relative",
});

/**
 * A general feed call-to-action for creating a post
 *
 * @returns {JSX.Element}
 */
const CreatePost: FC = () => {
  const { user } = useAuthProvider();
  const [expanded, setExpanded] = useState(false); // TODO: Expand to full size on click

  return (
    <StyledCard elevation={0}>
      <Stack direction="row" spacing={2} alignItems="center">
        <ProfileAvatar username={user?.username || ""} avatar={user?.avatar} />
        <TextField fullWidth placeholder="Create a new post" size="small" />
        <IconButton>
          <AddPhotoAlternate />
        </IconButton>
      </Stack>
    </StyledCard>
  );
};

export default CreatePost;
