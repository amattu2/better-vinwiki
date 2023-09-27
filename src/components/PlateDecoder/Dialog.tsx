import React, { FC, useState } from "react";
import { LoadingButton } from "@mui/lab";
import {
  Button, Dialog, DialogActions,
  DialogContent, DialogTitle, List, ListItem,
  ListItemAvatar, ListItemText, MenuItem,
  TextField, Typography, styled,
} from "@mui/material";
import { Form, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { ENDPOINTS, STATUS_OK } from "../../config/Endpoints";
import { Countries, Territories } from "../../config/Locations";
import { formatVehicleName } from "../../utils/vehicle";
import ProfileAvatar from "../ProfileAvatar";

type Props = {
  open: boolean;
  onConfirm?: (vehicle: PlateDecodeResponse | null) => void;
  onCancel?: () => void;
};

type Fields = {
  plate: string;
  country: "US" | "UK";
  state: string;
};

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    width: "400px",
  },
});

const StyledTextField = styled(TextField)({
  marginTop: "18px !important",
});

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

const ResultItem : FC<{ vehicle: PlateDecodeResponse, onCancel: () => void }> = ({ vehicle, onCancel }) => {
  const { description, vin } = vehicle;

  return (
    <List>
      <ListItem>
        <ListItemAvatar>
          <ProfileAvatar username={description} />
        </ListItemAvatar>
        <ListItemText
          primary={(
            <StyledLink to={`/vehicle/${vin}`}>
              <Typography variant="body1" fontWeight={600}>
                {formatVehicleName(vehicle)}
              </Typography>
            </StyledLink>
          )}
          secondary={vin}
        />
        <Button onClick={onCancel}>
          Not It
        </Button>
      </ListItem>
    </List>
  );
};

const plateLookup = async (token: string, data: Fields): Promise<PlateDecodeResponse | null> => {
  const response = await fetch(ENDPOINTS.plate_lookup, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  }).catch(() => null);

  const { status, plate_lookup } = await response?.json() || {};
  return status === STATUS_OK && plate_lookup ? plate_lookup : null;
};

/**
 * A dialog for plate decoding
 *
 * @param {uuid}
 * @returns {JSX.Element}
 */
const DecoderDialog: FC<Props> = ({ open, onConfirm, onCancel }: Props) => {
  const { token } = useAuthProvider();
  const { control, register, watch } = useForm<Fields>();
  const [selectedVehicle, setSelectedVehicle] = useState<PlateDecodeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const onConfirmWrapper = async () => {
    if (selectedVehicle) {
      onConfirm?.(selectedVehicle);
      return;
    }
    if (!token) {
      return;
    }

    setLoading(true);
    const data = await plateLookup(token, watch());
    setSelectedVehicle(data);
    setLoading(false);
  };

  const clearSelection = () => setSelectedVehicle(null);

  return (
    <StyledDialog open={open} onClose={onCancel}>
      <DialogTitle>
        License Plate Lookup
      </DialogTitle>
      <DialogContent dividers>
        <Form control={control}>
          <StyledTextField
            {...register("plate")}
            label="License Plate"
            variant="outlined"
            size="small"
            fullWidth
            autoFocus
          />
          <StyledTextField
            {...register("country")}
            fullWidth
            variant="outlined"
            size="small"
            defaultValue=""
            onClick={(e) => e.stopPropagation()}
            SelectProps={{ MenuProps: { disablePortal: true } }}
            label="Select a country"
            select
          >
            <MenuItem value="">Select a country</MenuItem>
            {Countries.map(({ code, name }) => (
              <MenuItem key={`${code}-${name}`} value={code}>{name}</MenuItem>
            ))}
          </StyledTextField>
          <StyledTextField
            {...register("state")}
            fullWidth
            variant="outlined"
            size="small"
            defaultValue=""
            onClick={(e) => e.stopPropagation()}
            SelectProps={{ MenuProps: { disablePortal: true } }}
            disabled={!Territories[watch("country")]}
            label="Select a territory"
            select
          >
            <MenuItem value="">Select a territory</MenuItem>
            {Territories[watch("country")]?.map(({ code, name }) => (
              <MenuItem key={`${code}-${name}`} value={code}>{name}</MenuItem>
            ))}
          </StyledTextField>
        </Form>
        {selectedVehicle ? (
          <ResultItem vehicle={selectedVehicle} onCancel={clearSelection} />
        ) : (
          <Typography variant="body2" sx={{ mt: 1 }}>
            No matches found
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <LoadingButton onClick={onConfirmWrapper} loading={loading}>
          {selectedVehicle ? `Select ${formatVehicleName(selectedVehicle)}` : "Lookup"}
        </LoadingButton>
        <Button onClick={onCancel} autoFocus>Cancel</Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default DecoderDialog;
