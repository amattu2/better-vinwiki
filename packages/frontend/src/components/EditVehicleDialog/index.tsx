import React, { FC, useEffect, useId, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormHelperText,
  Stack,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import { ImageUpload } from "../ImageUpload";

type Props = {
  vehicle: Vehicle;
  onConfirm: (vehicle: EditVehicleInput) => Promise<boolean>;
  onClose: () => void;
};

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    overflowX: "hidden",
  },
});

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  backgroundColor: theme.palette.modal.background,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginTop: "16px",
  "& .MuiInputBase-root": {
    backgroundColor: theme.palette.modal.contrast,
  },
}));

/**
 * A dialog that displays the edit form for a vehicle.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const EditVehicleDialog: FC<Props> = ({ vehicle, onConfirm, onClose }: Props) => {
  const id = useId();
  const { register, handleSubmit, watch, resetField, setValue } = useForm<EditVehicleInput>();
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string>();

  const imageUpload = watch("image");

  const saveVehicle = async (data: EditVehicleInput) => {
    setSaving(true);
    await onConfirm(data);
    onClose();
    setSaving(false);
  };

  const deletePreview = () => {
    resetField("image");
    setPreview(undefined);
  };

  useEffect(() => {
    if (imageUpload?.[0]) {
      setPreview(URL.createObjectURL(imageUpload?.[0]));
    }
  }, [imageUpload]);

  return (
    <StyledDialog maxWidth="sm" open onClose={onClose} fullWidth>
      <DialogTitle component={Stack} direction="row" alignItems="center">
        Edit Vehicle
      </DialogTitle>
      <StyledDialogContent dividers>
        <form onSubmit={handleSubmit(saveVehicle)} id={id}>
          <StyledTextField
            fullWidth
            label="Year"
            defaultValue={vehicle.year}
            size="small"
            required
            {...register("year", { required: true })}
          />
          <StyledTextField
            fullWidth
            label="Make"
            defaultValue={vehicle.make}
            size="small"
            required
            {...register("make", { required: true })}
          />
          <StyledTextField
            fullWidth
            label="Model"
            defaultValue={vehicle.model}
            size="small"
            required
            {...register("model", { required: true })}
          />
          <StyledTextField
            fullWidth
            label="Trim"
            defaultValue={vehicle.trim}
            size="small"
            {...register("trim", { required: false })}
          />
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Vehicle Photo (Optional)
          </Typography>
          <ImageUpload
            InputProps={register("image", { required: false })}
            preview={preview}
            onPreviewClick={deletePreview}
            onDrop={(e) => setValue("image", e.dataTransfer.files)}
          />
          {imageUpload?.[0] && (
            <FormHelperText sx={{ mt: 2 }}>
              Depending on the size of your photo, it may take a few minutes for it to appear
              properly on the vehicle page.
            </FormHelperText>
          )}
        </form>
      </StyledDialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">
          Cancel
        </Button>
        <LoadingButton type="submit" form={id} loading={saving}>
          Save
        </LoadingButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default EditVehicleDialog;
