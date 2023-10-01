import React, { FC, useId, useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, Stack, TextField, styled,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import DeleteContentDialog from '../DeleteContentConfirm';

type Props = {
  list: List;
  onConfirm: (list: Partial<List>) => void;
  onDelete: () => void;
  onClose: () => void;
};

type FormInputs = {
  name: List["name"];
  description: List["description"];
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
 * A dialog that displays the edit form for a Vehicle List.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const EditListDialog: FC<Props> = ({ list, onDelete, onConfirm, onClose }: Props) => {
  const id = useId();
  const { register, handleSubmit } = useForm<FormInputs>();
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const saveList = async (data: FormInputs) => {
    setSaving(true);
    await onConfirm(data);
    onClose();
    setSaving(false);
  };

  return (
    <>
      <StyledDialog maxWidth="sm" open onClose={onClose} fullWidth>
        <DialogTitle component={Stack} direction="row" alignItems="center">
          Edit List
        </DialogTitle>
        <StyledDialogContent dividers>
          <form onSubmit={handleSubmit(saveList)} id={id}>
            <StyledTextField
              fullWidth
              label="Name"
              size="small"
              defaultValue={list.name}
              required
              {...register("name", { required: true })}
            />
            <StyledTextField
              fullWidth
              label="Description"
              rows={4}
              helperText="Supports @mentions and #VINs"
              defaultValue={list.description}
              multiline
              {...register("description", { required: false })}
            />
          </form>
        </StyledDialogContent>
        <DialogActions>
          <Button sx={{ mr: "auto" }} color="error" onClick={() => setDeleteDialogOpen(true)}>Delete</Button>
          <Button onClick={onClose} color="error">Cancel</Button>
          <LoadingButton type="submit" form={id} loading={saving}>Save</LoadingButton>
        </DialogActions>
      </StyledDialog>
      <DeleteContentDialog
        type="list"
        open={deleteDialogOpen}
        onConfirm={onDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
};

export default EditListDialog;
