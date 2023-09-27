import React, { FC, useId, useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, Stack, TextField, styled,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';

type Props = {
  profile: Profile;
  onConfirm: (profile: Partial<Profile>) => void;
  onClose: () => void;
};

type FormInputs = {
  display_name: Profile["display_name"];
  location: Profile["location"];
  website_url: Profile["website_url"];
  bio: Profile["bio"];
};

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    overflowX: "hidden",
  },
});

const StyledDialogContent = styled(DialogContent)({
  backgroundColor: "#f4f7fa",
});

const StyledTextField = styled(TextField)({
  marginTop: "16px",
  "& .MuiInputBase-root": {
    backgroundColor: "#fff",
  },
});

/**
 * A dialog that displays the edit form for a profile.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const EditProfileDialog: FC<Props> = ({ profile, onConfirm, onClose }: Props) => {
  const id = useId();
  const { register, handleSubmit } = useForm<FormInputs>();
  const [saving, setSaving] = useState(false);

  const saveProfile = async (data: FormInputs) => {
    setSaving(true);
    await onConfirm(data);
    onClose();
    setSaving(false);
  };

  return (
    <StyledDialog maxWidth="sm" open onClose={onClose} fullWidth>
      <DialogTitle component={Stack} direction="row" alignItems="center">
        Edit Profile
      </DialogTitle>
      <StyledDialogContent dividers>
        <form onSubmit={handleSubmit(saveProfile)} id={id}>
          <StyledTextField
            fullWidth
            label="Name"
            defaultValue={profile.display_name}
            size="small"
            required
            {...register("display_name", { required: true })}
          />
          <StyledTextField
            fullWidth
            label="Location"
            defaultValue={profile.location}
            size="small"
            {...register("location", { required: false })}
          />
          <StyledTextField
            fullWidth
            label="Bio"
            multiline
            rows={4}
            defaultValue={profile.bio}
            helperText="Supports @mentions and #VINs"
            {...register("bio", { required: false })}
          />
          <StyledTextField
            fullWidth
            label="Website"
            defaultValue={profile.website_url}
            size="small"
            {...register("website_url", { required: false })}
          />
        </form>
      </StyledDialogContent>
      <DialogActions>
        <Button sx={{ mr: "auto" }} disabled>Change Password</Button>
        <Button onClick={onClose} color="error">Cancel</Button>
        <LoadingButton type="submit" form={id} loading={saving}>Save</LoadingButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default EditProfileDialog;
