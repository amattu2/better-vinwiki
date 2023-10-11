import React, { FC, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Badge, DirectionsCar, PersonSearch, Search } from "@mui/icons-material";
import { TabContext, TabPanel } from "@mui/lab";
import {
  Box, Card, Container, Divider, IconButton,
  List, ListItem, ListItemAvatar, ListItemText,
  Pagination, Skeleton, Stack, Tab, Tabs,
  TextField, Tooltip, Typography, styled,
} from "@mui/material";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { ListSearchCard, ListSearchSkeleton } from "../../components/ListSearchCard";
import PlateDecoder from "../../components/PlateDecoder/Dialog";
import ProfileAvatar from "../../components/ProfileAvatar";
import Repeater from "../../components/Repeater";
import { ScrollToTop } from "../../components/ScrollToTop/ScrollButton";
import ListSuggestion from "../../components/SuggestionCards/ListSuggestion";
import VehicleSuggestion from "../../components/SuggestionCards/VehicleSuggestion";
import { LookupStatus, SearchResult, SearchType, useSearch } from "../../hooks/useSearch";
import useFollowingVehiclesLookup from "../../hooks/useFollowingVehiclesLookup";
import useProfileListsLookup from "../../hooks/useProfileListsLookup";
import { sortVehicles } from "../../utils/vehicle";
import { VehicleTable } from "../../components/VehicleTable";

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingLeft: "0 !important",
  [theme.breakpoints.down("lg")]: {
    paddingRight: 0,
  },
}));

const StyledBox = styled(Box)({
  padding: "16px",
});

const StyledSearchBox = styled(StyledBox)(({ theme }) => ({
  backgroundColor: "#fff",
  flexGrow: 1,
  minHeight: "100vh",
  borderRight: "1px solid #ddd",
  [theme.breakpoints.down("lg")]: {
    borderRight: "none",
  },
}));

const StyledSidebarBox = styled(StyledBox)(({ theme }) => ({
  minWidth: "400px",
  flexGrow: 1,
  [theme.breakpoints.down("lg")]: {
    display: "none",
  },
}));

const StyledCard = styled(Card)({
  padding: "16px 24px",
  borderRadius: "8px",
  margin: "8px 0",
  border: "1px solid #e5e5e5",
});

const StyledTab = styled(Tab)({
  minHeight: "48px",
  textTransform: "none",
});

const StyledPanel = styled(TabPanel)({
  padding: 0,
});

const StyledPagination = styled(Pagination)({
  width: "100%",
  marginTop: "16px",
  "& .MuiPagination-ul": {
    justifyContent: "center",
  },
});

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

const NoSearchResults: FC = () => (
  <Typography
    variant="caption"
    textAlign="center"
    color="textSecondary"
    sx={{ mx: "auto" }}
    component="div"
  >
    No results found
  </Typography>
);

const ProfileSkeleton: FC = () => (
  <ListItem divider>
    <ListItemAvatar>
      <Skeleton variant="rounded" width={40} height={40} animation="wave" />
    </ListItemAvatar>
    <ListItemText
      primary={<Skeleton variant="text" animation="wave" width={200} />}
      secondary={<Skeleton variant="text" animation="wave" width={150} />}
    />
  </ListItem>
);

const View : FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams({ query: "", type: "Vehicle" });

  const { profile } = useAuthProvider();
  const [, { vehicles }] = useFollowingVehiclesLookup(profile?.uuid || "");
  const [, lists] = useProfileListsLookup(profile?.uuid || "");
  const { register, handleSubmit, watch } = useForm<{ query: string }>({ defaultValues: { query: searchParams.get("query") || "" } });

  const [searchType, setSearchType] = useState<SearchType>(["Vehicle", "List", "Profile"].includes(searchParams.get("type") || "")
    ? (searchParams.get("type") as SearchType)
    : "Vehicle");
  const [plateDecoderOpen, setPlateDecoderOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [perPage] = useState<number>(30);
  const [status, results, setQuery, getNext] = useSearch(searchType, 100);

  const paginatedResults: SearchResult<SearchType> = useMemo(() => {
    if (results?.type !== searchType || !results.data?.length) {
      return [];
    }

    return results.data.slice((page - 1) * perPage, page * perPage);
  }, [searchType, results, page, perPage]);

  const resultCount: number = useMemo(() => {
    if (!results?.data?.length || results.type !== searchType) {
      return 0;
    }

    return results.data.length;
  }, [status, results, searchType]);

  const placeholder: string = useMemo(() => {
    switch (searchType) {
      case "Vehicle":
        return "VIN or Vehicle Description";
      case "List":
        return "list name";
      default:
        return "Username or Email";
    }
  }, [searchType]);

  const searchChange = (event: React.SyntheticEvent, type: SearchType) => {
    setSearchType(type);
    setPage(1);
  };

  const handleSearch = (data: { query: string }) => {
    setQuery(data.query);
    setPage(1);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
    handlePaginationChange(page, resultCount - ((page - 1) * perPage));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePaginationChange = (page: number, remaining: number) => {
    if (remaining > 50) {
      return;
    }
    if (!results?.hasMore) {
      return;
    }

    getNext?.(100);
  };

  const onDecoderSelect = (vehicle: PlateDecodeResponse | null) => {
    if (!vehicle) {
      return;
    }

    setPlateDecoderOpen(false);
    navigate(`/vehicle/${vehicle.vin}`);
  };

  useEffect(() => {
    setSearchParams({ query: watch("query"), type: searchType });
  }, [searchType, watch("query")]);

  useEffect(() => {
    if (searchType && watch("query")) {
      setQuery(watch("query"));
    }
  }, []);

  return (
    <Stack direction="row">
      <StyledContainer maxWidth="xl">
        <StyledSearchBox>
          <Container maxWidth="md">
            <Stack direction="column" gap={2}>
              <Typography variant="h4">Search</Typography>
              <StyledCard elevation={3} sx={{ pt: 1 }}>
                <Stack direction="column" spacing={2}>
                  <Tabs value={searchType} variant="fullWidth" onChange={searchChange} centered>
                    <StyledTab value="Vehicle" label="Vehicles" icon={<DirectionsCar />} iconPosition="start" />
                    <StyledTab value="Profile" label="Profiles" icon={<PersonSearch />} iconPosition="start" />
                    <StyledTab value="List" label="Lists" icon={<List />} iconPosition="start" />
                  </Tabs>
                  <Stack component="form" direction="row" spacing={1} alignItems="center" onSubmit={handleSubmit(handleSearch)}>
                    <TextField {...register("query")} placeholder={`Search by ${placeholder}`} size="small" fullWidth />
                    {searchType === "Vehicle" && (
                      <Tooltip title="Advanced Search" placement="right" arrow>
                        <IconButton onClick={() => setPlateDecoderOpen(true)}>
                          <Badge />
                        </IconButton>
                      </Tooltip>
                    )}
                    <IconButton type="submit">
                      <Search />
                    </IconButton>
                  </Stack>
                </Stack>
              </StyledCard>
            </Stack>

            <Divider sx={{ my: 3 }} textAlign="center">
              <Typography variant="h5">
                {Math.ceil(resultCount / 100) * 100}
                {(resultCount > 0 && results?.hasMore) && "+"}
                {" "}
                Results
              </Typography>
            </Divider>

            <TabContext value={searchType}>
              <StyledPanel value="Vehicle">
                <VehicleTable
                  status={status !== LookupStatus.Loading ? "success" : "loading"}
                  vehicles={status !== LookupStatus.Loading && results?.type === "Vehicle" && results?.data ? results.data as Vehicle[] : []}
                  totalCount={results?.hasMore ? -1 : resultCount}
                  rowPerPageOptions={[5, 10, 25]}
                  rowsPerPage={25}
                  onPageChange={handlePaginationChange}
                  EmptyComponent={NoSearchResults}
                />
              </StyledPanel>
              <StyledPanel value="Profile">
                <List>
                  {(status === LookupStatus.Loading) && (<Repeater count={8} Component={ProfileSkeleton} />)}
                  {(status === LookupStatus.Success && paginatedResults.length === 0) && (
                    <NoSearchResults />
                  )}
                  {(status === LookupStatus.Success && paginatedResults.length > 0 && results?.type === "Profile") && (
                    paginatedResults.map((result) => {
                      const { uuid, username, avatar, display_name } = result as ProfileSearchResult;

                      return (
                        <ListItem key={uuid} component={StyledLink} to={`/profile/${uuid}`} divider>
                          <ListItemAvatar>
                            <ProfileAvatar username={username} avatar={avatar} />
                          </ListItemAvatar>
                          <ListItemText
                            primary={display_name && <Typography variant="body1" fontWeight={600}>{display_name}</Typography>}
                            secondary={`@${username}`}
                          />
                        </ListItem>
                      );
                    })
                  )}
                </List>
                <StyledPagination
                  count={Math.ceil(resultCount / perPage) || 1}
                  page={page}
                  onChange={(e, page) => handlePageChange(page)}
                  variant="outlined"
                  shape="rounded"
                />
              </StyledPanel>
              <StyledPanel value="List">
                {(status === LookupStatus.Loading) && (<Repeater count={5} Component={ListSearchSkeleton} />)}
                {(status === LookupStatus.Success && paginatedResults.length === 0) && (
                  <NoSearchResults />
                )}
                {(status === LookupStatus.Success && paginatedResults.length > 0 && results?.type === "List") && (
                  paginatedResults.map((result) => (<ListSearchCard key={(result as List).uuid} list={result as List} />))
                )}
                <StyledPagination
                  count={Math.ceil(resultCount / perPage) || 1}
                  page={page}
                  onChange={(e, page) => handlePageChange(page)}
                  variant="outlined"
                  shape="rounded"
                />
              </StyledPanel>
            </TabContext>

            <PlateDecoder
              open={plateDecoderOpen}
              onConfirm={onDecoderSelect}
              onCancel={() => setPlateDecoderOpen(false)}
            />
          </Container>
        </StyledSearchBox>
      </StyledContainer>
      <StyledSidebarBox>
        {vehicles && <VehicleSuggestion suggestions={sortVehicles(vehicles)} limit={4} />}
        {lists && <ListSuggestion suggestions={lists} limit={4} />}
      </StyledSidebarBox>
      <ScrollToTop topGap={false} />
    </Stack>
  );
};

export default View;
