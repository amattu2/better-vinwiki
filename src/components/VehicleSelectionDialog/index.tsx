import React, { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
  styled,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { formatVehicleName } from '../../utils/vehicle';
import ProfileAvatar from '../ProfileAvatar';
import { VehicleSearch } from '../Typeahead/VehicleSearch';

type Props = {
  onSelect: (vehicles: Vehicle[]) => Promise<void>;
  onClose: () => void;
};

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    overflowX: "hidden",
  },
});

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: "0 !important",
  backgroundColor: theme.palette.modal.background,
  "& .MuiList-root": {
    padding: "0 !important",
  },
  "& .MuiListItem-root:last-child": {
    borderBottom: "unset",
  },
}));

const StyledSearchBox = styled(Stack)({
  padding: "16px 24px",
});

const VehicleSelectionItem: FC<{ vehicle: Vehicle; onRemove: (vehicle: Vehicle) => void }> = ({ vehicle, onRemove }) => {
  const { vin, long_name, icon_photo } = vehicle;

  return (
    <ListItem key={vin} divider>
      <ListItemAvatar>
        <ProfileAvatar username={long_name} avatar={icon_photo} />
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
      <Button color="error" onClick={() => onRemove(vehicle)}>Remove</Button>
    </ListItem>
  );
};

/**
 * A dialog that displays a Vehicle search and selection
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const VehicleSelectionDialog: FC<Props> = ({ onSelect, onClose }: Props) => {
  const [selection, setSelection] = useState<Vehicle[]>([]);
  const [saving, setSaving] = useState<boolean>(false);

  const onSelectWrapper = async () => {
    setSaving(true);
    await onSelect(selection);
    setSaving(false);
    onClose();
  };

  const onChangeWrapper = (e: React.SyntheticEvent, value: Vehicle | null, reason: string) => {
    if (!value || reason !== "selectOption") {
      return;
    }
    if (selection.find((vehicle) => vehicle.vin === value.vin)) {
      return;
    }

    setSelection([...selection, value]);
  };

  const onRemove = (vehicle: Vehicle) => {
    setSelection([...selection.filter((v) => v.vin !== vehicle.vin)]);
  };

  return (
    <StyledDialog maxWidth="sm" open onClose={onClose} fullWidth>
      <DialogTitle>
        Add Vehicles
      </DialogTitle>
      <StyledDialogContent dividers>
        <StyledSearchBox alignItems="center">
          <VehicleSearch value={null} onChange={onChangeWrapper} />
        </StyledSearchBox>
        <Divider textAlign="center">Selection</Divider>
        <List>
          {selection.map((vehicle) => (<VehicleSelectionItem key={vehicle.vin} vehicle={vehicle} onRemove={onRemove} />))}
        </List>
        {selection.length === 0 && (
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" textAlign="center">No vehicles selected</Typography>
          </Box>
        )}
      </StyledDialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">Cancel</Button>
        <LoadingButton onClick={onSelectWrapper} loading={saving}>Select</LoadingButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default VehicleSelectionDialog;
