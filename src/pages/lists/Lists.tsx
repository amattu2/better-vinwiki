import React, { FC, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Add, Event, NavigateNext, Numbers, SortByAlpha } from "@mui/icons-material";
import {
  Box,
  Breadcrumbs,
  Button,
  Grid,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  styled,
} from "@mui/material";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { ListSearchCard, ListSearchSkeleton } from "../../components/ListSearchCard";
import Repeater from "../../components/Repeater";
import useProfileListsLookup, { LookupStatus } from "../../hooks/useProfileListsLookup";
import { sortLists } from "../../utils/lists";
import CreateListDialog from "../../components/CreateListDialog";
import { ScrollToTop } from "../../components/ScrollToTop/ScrollButton";
import { StyledLink } from "../../components/StyledLink";

const StyledHeaderSection = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.default,
  position: "sticky",
  top: 0,
  zIndex: 8,
}));

const StyledHeaderButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(-1),
  marginBottom: theme.spacing(-1),
}));

const StyledStack = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(2),
  background: theme.palette.background.default,
  minHeight: "calc(100vh - 57px)",
}));

const OwnedListSkeleton: FC = () => (
  <Grid sm={12} lg={6} item>
    <ListSearchSkeleton omitOwner />
  </Grid>
);

const ListSkeleton: FC = () => (
  <Grid sm={12} xl={6} item>
    <ListSearchSkeleton omitOwner />
  </Grid>
);

/**
 * A page for viewing an index of Owned and Following Vehicle Lists.
 *
 * @returns {JSX.Element}
 */
const ListsView: FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuthProvider();
  const [status, lists] = useProfileListsLookup(profile?.uuid || "", true);
  const [ownedSort, setOwnedSort] = useState<"alpha" | "date" | "popularity">("alpha");
  const [followingSort, setFollowingSort] = useState<"alpha" | "date" | "popularity">("alpha");
  const [createOpen, setCreateOpen] = useState(false);

  const ownedLists: List[] = useMemo(() => {
    if (!lists?.owned || status !== LookupStatus.Success) {
      return [];
    }

    return sortLists(lists.owned, ownedSort);
  }, [ownedSort, lists?.owned]);

  const followingLists: List[] = useMemo(() => {
    if (!lists?.following || status !== LookupStatus.Success) {
      return [];
    }

    return sortLists(lists.following, followingSort);
  }, [followingSort, lists?.following]);

  const listCreated = (list: List) => {
    setCreateOpen(false);
    navigate(`/list/${list.uuid}`);
  };

  if (status === LookupStatus.Error) {
    return <span>Something went wrong!</span>;
  }

  return (
    <Box>
      <StyledHeaderSection direction="row" alignItems="center" justifyContent="flex-start" gap={2}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mr: "auto" }}>
          <StyledLink to="/">Home</StyledLink>
          <Typography>Lists</Typography>
        </Breadcrumbs>
        <Tooltip title="Create List" arrow>
          <StyledHeaderButton onClick={() => setCreateOpen(true)} startIcon={<Add />}>
            Create List
          </StyledHeaderButton>
        </Tooltip>
      </StyledHeaderSection>
      <StyledStack gap={2}>
        <Stack direction="row" alignContent="center">
          <Typography variant="h4">My Lists</Typography>
          <ToggleButtonGroup
            color="primary"
            value={ownedSort}
            onChange={(e, value) => setOwnedSort(value || "alpha")}
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
            <ToggleButton value="popularity">
              <Tooltip title="Popularity">
                <Numbers />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        {status === LookupStatus.Success && lists?.owned.length === 0 && (
          <Typography color="textSecondary">You have not created any lists yet.</Typography>
        )}
        <Grid container columnSpacing={2} rowSpacing={0}>
          {status === LookupStatus.Loading && <Repeater count={2} Component={OwnedListSkeleton} />}
          {ownedLists.map((list) => (
            <Grid key={list.uuid} sm={12} lg={6} item>
              <ListSearchCard list={list} omitOwner />
            </Grid>
          ))}
        </Grid>
        <Stack direction="row" alignContent="center">
          <Typography variant="h4">Following</Typography>
          <ToggleButtonGroup
            color="primary"
            value={followingSort}
            onChange={(e, value) => setFollowingSort(value || "alpha")}
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
            <ToggleButton value="popularity">
              <Tooltip title="Popularity">
                <Numbers />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        {status === LookupStatus.Success && lists?.following.length === 0 && (
          <Typography color="textSecondary">You are not following any lists.</Typography>
        )}
        <Grid container columnSpacing={2} rowSpacing={0}>
          {status === LookupStatus.Loading && <Repeater count={4} Component={ListSkeleton} />}
          {followingLists.map((list) => (
            <Grid key={list.uuid} sm={12} xl={6} item>
              <ListSearchCard list={list} />
            </Grid>
          ))}
        </Grid>
      </StyledStack>
      <ScrollToTop />
      {createOpen && (
        <CreateListDialog onClose={() => setCreateOpen(false)} onCreate={listCreated} />
      )}
    </Box>
  );
};

export default ListsView;
