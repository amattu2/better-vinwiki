import React, { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  Typography,
  styled,
} from '@mui/material';
import { Bookmark, Source } from '@mui/icons-material';
import { TabContext, TabPanel } from '@mui/lab';
import { ListSearchCard } from '../ListSearchCard';

type Props = {
  lists: ProfileLists;
  onClose: () => void;
};

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    overflowX: "hidden",
  },
});

const StyledDialogTitle = styled(DialogTitle)({
  padding: "0 !important",
});

const StyledTabs = styled(Tabs)({
  marginLeft: "-24px",
  marginRight: "-24px",
});

const StyledTab = styled(Tab)({
  textTransform: "none",
});

const StyledDialogContent = styled(DialogContent)({
  padding: "0 !important",
  backgroundColor: "#f4f7fa",
});

const NoLists = () => (
  <Typography variant="body1" color="textSecondary" sx={{ padding: "16px" }} textAlign="center" fontSize={14}>
    Uh oh... No lists to see here
  </Typography>
);

/**
 * A dialog that displays the Following and Owned lists of a user
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const ListsDialog: FC<Props> = ({ lists: { owned, following }, onClose }: Props) => {
  const [tab, setTab] = React.useState<"owned" | "following">("owned");

  return (
    <StyledDialog maxWidth="md" open onClose={onClose} fullWidth>
      <StyledDialogTitle>
        <StyledTabs value={tab} variant="fullWidth" onChange={(_, t) => setTab(t)} centered>
          <StyledTab value="owned" label="Owned" icon={<Source />} iconPosition="start" />
          <StyledTab value="following" label="Following" icon={<Bookmark />} iconPosition="start" />
        </StyledTabs>
      </StyledDialogTitle>
      <StyledDialogContent>
        <TabContext value={tab}>
          <TabPanel value="owned">
            {owned?.length === 0 && (<NoLists />)}
            {owned?.map((list) => (<ListSearchCard key={list.uuid} list={list} omitOwner />))}
          </TabPanel>
          <TabPanel value="following">
            {following?.length === 0 && (<NoLists />)}
            {following?.map((list) => (<ListSearchCard key={list.uuid} list={list} />))}
          </TabPanel>
        </TabContext>
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default ListsDialog;
