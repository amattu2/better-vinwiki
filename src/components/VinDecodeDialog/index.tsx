import React, { FC } from 'react';
import { FixedSizeList } from 'react-window';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Typography,
  styled,
} from '@mui/material';
import { DecodeVinValuesResults } from '@shaggytools/nhtsa-api-wrapper';
import Repeater from '../Repeater';
import useVinDecoder, { LookupStatus } from '../../hooks/useVinDecoder';

type Props = {
  vin: Vehicle["vin"];
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
  "& .MuiList-root": {
    padding: "0 !important",
  },
  "& .MuiListItem-root:last-child": {
    borderBottom: "unset",
  },
});

const NoContent = () => (
  <Typography variant="body1" color="textSecondary" sx={{ padding: "16px" }} textAlign="center" fontSize={14}>
    Uh oh... Nothing to see here
  </Typography>
);

const DecoderItemSkeleton: FC = () => (
  <ListItem dense divider>
    <ListItemText
      primary={(<Skeleton variant="text" width={100} height={24} animation="wave" />)}
      secondary={(<Skeleton variant="text" width={200} height={24} animation="wave" />)}
    />
  </ListItem>
);

/**
 * A dialog that displays the NHTSA decoded VIN options
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const VinDecodeDialog: FC<Props> = ({ vin, onClose }: Props) => {
  const [status, options] = useVinDecoder(vin);

  const optionKeys = options ? Object.keys(options) as (keyof DecodeVinValuesResults)[] : [];

  return (
    <StyledDialog maxWidth="sm" open onClose={onClose} fullWidth>
      <DialogTitle>
        VIN Decode
      </DialogTitle>
      <StyledDialogContent dividers>
        {(status !== LookupStatus.Loading && optionKeys.length === 0) && (<NoContent />)}
        <List>
          {(status === LookupStatus.Loading) && (<Repeater count={6} Component={DecoderItemSkeleton} />)}
          <FixedSizeList
            height={57 * 6}
            width="100%"
            itemSize={57}
            itemCount={optionKeys.length}
            style={status !== LookupStatus.Success ? { display: "none" } : undefined}
          >
            {({ index, style }) => (
              <ListItem key={optionKeys[index]} style={style} dense divider>
                <ListItemText
                  primary={optionKeys[index]}
                  secondary={options?.[optionKeys[index]]}
                />
              </ListItem>
            )}
          </FixedSizeList>
        </List>
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default VinDecodeDialog;
