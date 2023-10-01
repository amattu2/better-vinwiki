import React, { FC, useId, useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, styled,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import { ENDPOINTS, STATUS_OK } from '../../config/Endpoints';
import { useAuthProvider } from '../../Providers/AuthProvider';

type Props = {
  onCreate: (list: List) => void;
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
 * A dialog that handles the creation of a Vehicle List
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const CreateListDialog: FC<Props> = ({ onCreate, onClose }: Props) => {
  const id = useId();
  const { token } = useAuthProvider();
  const { register, handleSubmit } = useForm<FormInputs>();
  const [saving, setSaving] = useState(false);

  const createList = async (data: FormInputs) => {
    if (!data.name.trim()) {
      return;
    }

    setSaving(true);

    const response = await fetch(ENDPOINTS.list_create, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }).catch(() => null);

    const { status, list } = await response?.json() || {};
    if (status === STATUS_OK && list?.uuid) {
      onCreate(list as List);
    }

    setSaving(false);
  };

  return (
    <StyledDialog maxWidth="sm" onClose={onClose} fullWidth open>
      <DialogTitle>
        Create List
      </DialogTitle>
      <StyledDialogContent dividers>
        <form onSubmit={handleSubmit(createList)} id={id}>
          <StyledTextField
            fullWidth
            label="Name"
            size="small"
            required
            {...register("name", { required: true })}
          />
          <StyledTextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            helperText="Supports @mentions and #VINs"
            {...register("description", { required: false })}
          />
        </form>
      </StyledDialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">Cancel</Button>
        <LoadingButton type="submit" form={id} loading={saving}>Create</LoadingButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default CreateListDialog;
