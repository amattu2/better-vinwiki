import React, { FC, useId, useMemo, useRef, useState } from 'react';
import {
  Button, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, FormControlLabel, ListItemText,
  Radio, RadioGroup, Stack, Typography, styled,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import { useAuthProvider } from '../../Providers/AuthProvider';
import useProfileListsLookup from '../../hooks/useProfileListsLookup';
import { formatDate } from '../../utils/date';
import { ENDPOINTS, STATUS_OK } from '../../config/Endpoints';

type Props = {
  vehicle: Vehicle;
  onClose: () => void;
};

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    overflowX: "hidden",
  },
  "& .MuiDivider-root:last-of-type": {
    display: "none",
  },
});

/**
 * A dialog that allows the user to quickly add a vehicle to a list.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const ListAssignmentDialog: FC<Props> = ({ vehicle, onClose }: Props) => {
  const id = useId();
  const controllerRef = useRef<AbortController>(new AbortController());
  const { token, profile } = useAuthProvider();
  const { register, handleSubmit } = useForm<{ uuid: List["uuid"] }>();
  const [, lists] = useProfileListsLookup(profile?.uuid || "");
  const [saving, setSaving] = useState(false);

  const ownedLists: List[] = useMemo(() => {
    if (!lists?.owned) {
      return [];
    }

    const clonedLists = [...lists.owned];
    clonedLists.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
    return clonedLists;
  }, [lists]);

  const submitForm = async (data: { uuid: List["uuid"] }) => {
    if (!token || !vehicle?.vin || !data?.uuid) {
      return;
    }

    setSaving(true);

    const { signal } = controllerRef.current;
    const response = await fetch(`${ENDPOINTS.list_add_vehicle}${data.uuid}/${vehicle.vin}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    }).catch(() => null);

    const { status } = await response?.json() || {};
    if (status === STATUS_OK) {
      onClose();
    }

    setSaving(false);
  };

  const onCloseWrapper = () => {
    if (saving) {
      controllerRef?.current?.abort();
    }
    onClose();
  };

  return (
    <StyledDialog maxWidth="sm" open onClose={onCloseWrapper} fullWidth>
      <DialogTitle component={Stack} direction="row" alignItems="center">
        Add to List
      </DialogTitle>
      <DialogContent dividers>
        {ownedLists.length === 0 && (
          <Typography variant="body1" color="textSecondary" textAlign="center">
            You don&apos;t have any lists to add this vehicle to
          </Typography>
        )}
        <form onSubmit={handleSubmit(submitForm)} id={id}>
          <RadioGroup>
            {ownedLists.map(({ uuid, name, vehicle_count, follower_count, created_date }: List) => (
              <React.Fragment key={uuid}>
                <FormControlLabel
                  {...register("uuid")}
                  value={uuid}
                  control={<Radio />}
                  label={(
                    <ListItemText
                      primary={(
                        <Typography variant="body1" fontWeight={600}>
                          {name}
                        </Typography>
                      )}
                      secondary={(
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                          <Chip label={`${vehicle_count} vehicle${vehicle_count !== 1 ? "s" : ""}`} />
                          <Chip label={`${follower_count} follower${follower_count !== 1 ? "s" : ""}`} />
                          <Chip label={formatDate(new Date(created_date))} />
                        </Stack>
                      )}
                      secondaryTypographyProps={{ component: "div" }}
                    />
                  )}
                />
                <Divider sx={{ my: 1 }} />
              </React.Fragment>
            ))}
          </RadioGroup>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseWrapper} color="error">Cancel</Button>
        <LoadingButton type="submit" form={id} loading={saving}>Add</LoadingButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default ListAssignmentDialog;
