import React, { ElementType, FC, useMemo } from 'react';
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Skeleton,
  Stack,
  StackProps,
  Typography,
  styled,
} from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { cloneDeep } from 'lodash';
import Repeater from '../Repeater';
import useRecallLookup, { LookupStatus, RecallEvent } from '../../hooks/useRecallLookup';
import { formatNHTSADate, parseNHTSADate } from '../../utils/date';

type Props = {
  year: Vehicle["year"];
  make: Vehicle["make"];
  model: Vehicle["model"];
  onClose: () => void;
};

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    overflowX: "hidden",
  },
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

const StyledCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(1),
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
}));

const StyledCardContent = styled(CardContent)<{
  component: ElementType,
  direction: StackProps["direction"],
  gap: StackProps["gap"]
}>(({ theme }) => ({
  padding: 0,
  paddingBottom: "0 !important",
  marginTop: theme.spacing(1),
  color: "#3b3b3b",
}));

const NoContent = () => (
  <Typography variant="body1" color="textSecondary" sx={{ padding: "16px" }} textAlign="center" fontSize={14}>
    No recalls associated with this year, make, and model combination
  </Typography>
);

const RecallItemSkeleton: FC = () => (
  <StyledCard elevation={0}>
    <Skeleton variant="text" width={150} height={18} animation="wave" />
    <Skeleton variant="text" width={200} height={30} animation="wave" />
    <Divider sx={{ my: 1 }} />
    <StyledCardContent component={Stack} direction="column" gap={1.5}>
      <Box>
        <Skeleton variant="text" width={120} height={18} animation="wave" />
        <Skeleton variant="text" width="85%" height={18} animation="wave" />
        <Skeleton variant="text" width="85%" height={18} animation="wave" />
        <Skeleton variant="text" width="75%" height={18} animation="wave" />
      </Box>
      <Box>
        <Skeleton variant="text" width={100} height={18} animation="wave" />
        <Skeleton variant="text" width="85%" height={18} animation="wave" />
        <Skeleton variant="text" width="85%" height={18} animation="wave" />
        <Skeleton variant="text" width="75%" height={18} animation="wave" />
      </Box>
      <Box>
        <Skeleton variant="text" width={120} height={18} animation="wave" />
        <Skeleton variant="text" width="85%" height={18} animation="wave" />
        <Skeleton variant="text" width="85%" height={18} animation="wave" />
        <Skeleton variant="text" width="75%" height={18} animation="wave" />
      </Box>
    </StyledCardContent>
  </StyledCard>
);

/**
 * A dialog that displays the NHTSA Recall Lookup results
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const RecallLookupDialog: FC<Props> = ({ year, make, model, onClose }: Props) => {
  const [status, recalls] = useRecallLookup(year, make, model);

  const data: RecallEvent[] = useMemo(() => {
    if (!recalls?.length) {
      return [];
    }

    const cloned: RecallEvent[] = cloneDeep(recalls);
    cloned.sort((a, b) => parseNHTSADate(b.ReportReceivedDate).getTime() - parseNHTSADate(a.ReportReceivedDate).getTime());

    return cloned;
  }, [recalls]);

  return (
    <StyledDialog maxWidth="md" open onClose={onClose} fullWidth>
      <DialogTitle>
        NHTSA Recalls
      </DialogTitle>
      <StyledDialogContent dividers>
        {(status !== LookupStatus.Loading && data?.length === 0) && (<NoContent />)}
        {(status === LookupStatus.Loading) && (<Repeater count={2} Component={RecallItemSkeleton} />)}
        {(status === LookupStatus.Success && data.length > 0) && data.map((recall: RecallEvent) => (
          <StyledCard key={recall.NHTSACampaignNumber} elevation={0}>
            <Typography variant="caption" color="#3b3b3b">
              {formatNHTSADate(recall.ReportReceivedDate)}
            </Typography>
            <Typography variant="h3" fontSize={24} color="primary.main">
              {`#${recall.NHTSACampaignNumber}`}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <StyledCardContent component={Stack} direction="column" gap={1.5}>
              <Box>
                <Typography variant="caption" fontWeight="bold">
                  Component Tree
                </Typography>
                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                  {recall.Component.split(":").map((component) => (
                    <Typography key={component} fontSize={14} textTransform="capitalize">{component}</Typography>
                  ))}
                </Breadcrumbs>
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="bold">
                  Summary
                </Typography>
                <Typography variant="body1" fontSize={14}>{recall.Summary}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="bold">
                  Remedy
                </Typography>
                <Typography variant="body1" fontSize={14}>{recall.Remedy}</Typography>
              </Box>
            </StyledCardContent>
          </StyledCard>
        ))}
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default RecallLookupDialog;
