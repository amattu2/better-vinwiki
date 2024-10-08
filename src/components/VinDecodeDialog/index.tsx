import React, { FC } from "react";
import { FixedSizeList } from "react-window";
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
} from "@mui/material";
import { DecodeVinValuesResults } from "@shaggytools/nhtsa-api-wrapper";
import Repeater from "../Repeater";
import useVinDecoder, { LookupStatus } from "../../hooks/useVinDecoder";

type Props = {
  vin: Vehicle["vin"];
  year: Vehicle["year"];
  onClose: () => void;
};

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    overflowX: "hidden",
  },
});

const StyledDialogContent = styled(DialogContent)({
  padding: "0 !important",
  "& .MuiList-root": {
    padding: "0 !important",
  },
  "& .MuiListItem-root:last-child": {
    borderBottom: "unset",
  },
});

const StyledListItemText = styled(ListItemText)({
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const NoContent = () => (
  <Typography
    variant="body1"
    color="textSecondary"
    sx={{ padding: "16px" }}
    textAlign="center"
    fontSize={14}
  >
    Uh oh... Nothing to see here
  </Typography>
);

const DecoderItemSkeleton: FC = () => (
  <ListItem dense divider>
    <ListItemText
      primary={<Skeleton variant="text" width={100} height={24} animation="wave" />}
      secondary={<Skeleton variant="text" width={200} height={24} animation="wave" />}
    />
  </ListItem>
);

/**
 * A dialog that displays the NHTSA decoded VIN options
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const VinDecodeDialog: FC<Props> = ({ vin, year, onClose }: Props) => {
  const [status, options] = useVinDecoder(vin, year);

  const optionKeys = options ? (Object.keys(options) as (keyof DecodeVinValuesResults)[]) : [];
  const hasNoOptions = optionKeys.length === 0 && status !== LookupStatus.Loading;

  return (
    <StyledDialog maxWidth="sm" open onClose={onClose} fullWidth>
      <DialogTitle>VIN Decode</DialogTitle>
      <StyledDialogContent dividers>
        {hasNoOptions && <NoContent />}
        <List sx={{ display: hasNoOptions ? "none" : "block" }}>
          {status === LookupStatus.Loading && (
            <Repeater count={6} Component={DecoderItemSkeleton} />
          )}
          <FixedSizeList
            height={57 * 6}
            width="100%"
            itemSize={57}
            itemCount={optionKeys.length}
            style={status !== LookupStatus.Success ? { display: "none" } : undefined}
          >
            {({ index, style }) => (
              <ListItem key={optionKeys[index]} style={style} dense divider>
                <StyledListItemText
                  primary={optionKeys[index]}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    textTransform: "uppercase",
                    fontSize: 12,
                  }}
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
