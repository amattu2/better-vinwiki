import React, { FC, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { Bookmark, SortByAlpha, Source, Event } from '@mui/icons-material';
import { TabContext, TabPanel } from '@mui/lab';
import { cloneDeep } from 'lodash';
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
  const [tab, setTab] = useState<"owned" | "following">("owned");
  const [sort, setSort] = useState<"date" | "alpha">("alpha");

  const sortedOwned = useMemo(() => {
    const sorted = cloneDeep(owned);
    sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [owned]);

  const sortedFollowing = useMemo(() => {
    const sorted = cloneDeep(following);
    if (sort === "alpha") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime());
    }
    return sorted;
  }, [following, sort]);

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
            {sortedOwned?.length === 0 && (<NoLists />)}
            {sortedOwned?.map((list) => (<ListSearchCard key={list.uuid} list={list} omitOwner />))}
          </TabPanel>
          <TabPanel value="following">
            <Stack direction="row" alignItems="center">
              <ToggleButtonGroup
                color="primary"
                value={sort}
                onChange={(e, value) => setSort(value || "alpha")}
                size="small"
                sx={{ ml: "auto" }}
                exclusive
              >
                <ToggleButton value="alpha">
                  <Tooltip title="Alphabetical">
                    <SortByAlpha />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="date">
                  <Tooltip title="Created Date">
                    <Event />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            {sortedFollowing?.length === 0 && (<NoLists />)}
            {sortedFollowing?.map((list) => (<ListSearchCard key={list.uuid} list={list} />))}
          </TabPanel>
        </TabContext>
      </StyledDialogContent>
    </StyledDialog>
  );
};

export default ListsDialog;
