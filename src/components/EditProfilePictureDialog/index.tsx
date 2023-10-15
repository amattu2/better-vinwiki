import React, { FC, useEffect, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, FormHelperText, Stack, styled,
} from '@mui/material';
import { MEDIA_CDN_URL } from '../../config/Endpoints';
import { ImageUpload } from '../ImageUpload';

type Props = {
  profile: Profile;
  onConfirm: (image: FileList) => void;
  onClose: () => void;
};

type FormInputs = {
  image: FileList;
};

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    overflowX: "hidden",
  },
});

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  backgroundColor: theme.palette.modal.background,
}));

/**
 * A dialog that displays the edit form for a profile picture.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const EditProfilePictureDialog: FC<Props> = ({ profile, onConfirm, onClose }: Props) => {
  const id = useId();

  const { avatar } = profile;
  const { register, handleSubmit, watch, resetField, setValue } = useForm<FormInputs>();
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string>();

  const imageUpload = watch("image");

  const saveImage = async ({ image }: FormInputs) => {
    setSaving(true);
    await onConfirm(image);
    onClose();
    setSaving(false);
  };

  const deletePreview = () => {
    resetField("image");
    setPreview(undefined);
  };

  useEffect(() => {
    if (avatar) {
      setPreview(`${MEDIA_CDN_URL}${profile.avatar}`);
    }
  }, []);

  useEffect(() => {
    if (imageUpload?.[0]) {
      setPreview(URL.createObjectURL(imageUpload?.[0]));
    }
  }, [imageUpload]);

  return (
    <StyledDialog maxWidth="xs" open onClose={onClose} fullWidth>
      <DialogTitle component={Stack} direction="row" alignItems="center">
        Change Profile Picture
      </DialogTitle>
      <StyledDialogContent sx={{ pt: (theme) => (preview ? theme.spacing(0.5) : undefined) }} dividers>
        <form onSubmit={handleSubmit(saveImage)} id={id}>
          <ImageUpload
            InputProps={register("image", { required: true })}
            preview={preview}
            onPreviewClick={deletePreview}
            onDrop={(e) => setValue("image", e.dataTransfer.files)}
          />
          {imageUpload?.[0] && (
            <FormHelperText sx={{ mt: 2 }}>Depending on the size of your photo, it may take a few minutes for it to appear properly throughout the website.</FormHelperText>
          )}
        </form>
      </StyledDialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">Cancel</Button>
        <LoadingButton type="submit" form={id} loading={saving} disabled={!imageUpload?.[0]}>Save</LoadingButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default EditProfilePictureDialog;
