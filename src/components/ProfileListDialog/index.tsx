import React, { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
  styled,
} from '@mui/material';
import { DirectionsCar, PersonSearch } from '@mui/icons-material';
import { TabContext, TabPanel } from '@mui/lab';
import { ListSearchCard } from '../ListSearchCard';

type Props = {
  open: boolean;
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
});

const ProfileListDialog: FC<Props> = ({ open, lists: { owned, following }, onClose }: Props) => {
  const [tab, setTab] = React.useState<"owned" | "following">("owned");

  return (
    <StyledDialog maxWidth="md" open={open} onClose={onClose} fullWidth>
      <StyledDialogTitle>
        <StyledTabs value={tab} variant="fullWidth" onChange={(_, t) => setTab(t)} centered>
          <StyledTab value="owned" label="Owned" icon={<DirectionsCar />} iconPosition="start" />
          <StyledTab value="following" label="Following" icon={<PersonSearch />} iconPosition="start" />
        </StyledTabs>
      </StyledDialogTitle>
      <StyledDialogContent>
        <TabContext value={tab}>
          <TabPanel value="owned">
            {owned?.map((list) => (<ListSearchCard key={list.uuid} list={list} omitOwner />))}
          </TabPanel>
          <TabPanel value="following">
            {following?.map((list) => (<ListSearchCard key={list.uuid} list={list} />))}
          </TabPanel>
        </TabContext>
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default ProfileListDialog;
