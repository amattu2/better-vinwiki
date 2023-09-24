import React, { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  styled,
} from '@mui/material';
import { VehicleTable } from '../VehicleTable';
import useFollowingVehiclesLookup from '../../hooks/useFollowingVehiclesLookup';

type Props = {
  uuid: Profile['uuid'];
  onClose: () => void;
};

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    overflowX: "hidden",
  },
});

const StyledDialogContent = styled(DialogContent)({
  padding: "0 !important",
  backgroundColor: "#f4f7fa",
});

const NoVehicles = () => (
  <Typography variant="body1" color="textSecondary" sx={{ padding: "16px" }} textAlign="center" fontSize={14}>
    Uh oh... no vehicles to see here.
  </Typography>
);

/**
 * A dialog that displays the Vehicles a profile is following.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const VehicleTableDialog: FC<Props> = ({ uuid, onClose }: Props) => {
  const [lookupStatus, { vehicles }] = useFollowingVehiclesLookup(uuid);

  return (
    <StyledDialog maxWidth="md" open onClose={onClose} fullWidth>
      <DialogTitle>
        Following Vehicles
      </DialogTitle>
      <StyledDialogContent>
        <VehicleTable
          status={lookupStatus}
          vehicles={vehicles || []}
          EmptyComponent={NoVehicles}
        />
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default VehicleTableDialog;
