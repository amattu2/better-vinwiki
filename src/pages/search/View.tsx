import React, { FC, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Badge, DirectionsCar, PersonSearch, Search } from "@mui/icons-material";
import { TabContext, TabPanel } from "@mui/lab";
import {
  Box,
  Card, CardActionArea, CardContent, Chip, Container, Divider, Grid, IconButton,
  List, ListItem, ListItemAvatar, ListItemText,
  Pagination, Skeleton, Stack, Tab,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Tabs,
  TextField, Tooltip, Typography, styled,
} from "@mui/material";
import { useAuthProvider } from "../../Providers/AuthProvider";
import PlateDecoder from "../../components/PlateDecoder/Dialog";
import { ScrollToTop } from "../../components/ScrollToTop";
import ListSuggestion from "../../components/SuggestionCards/ListSuggestion";
import VehicleSuggestion from "../../components/SuggestionCards/VehicleSuggestion";
import { LookupStatus, SearchResult, SearchType, useSearch } from "../../hooks/useSearch";
import { formatVehicleName, sortVehicles } from "../../utils/vehicle";
import ProfileAvatar from "../../components/ProfileAvatar";
import Repeater from "../../components/Repeater";
import GenericText from "../../components/FeedPost/Components/GenericText";

const StyledBox = styled(Box)({
  padding: "16px",
});

const StyledSearchBox = styled(StyledBox)({
  backgroundColor: "#fff",
  flexGrow: 1,
});

const StyledSidebarBox = styled(StyledBox)({
  minWidth: "400px",
  flexGrow: 1,
});

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

const StyledVehicleImg = styled("img")({
  borderRadius: "8px",
  width: "75px",
  height: "75px",
});

const StyledListOwner = styled(Stack, { shouldForwardProp: (p) => p !== "filled" })(({ filled }: { filled: boolean }) => ({
  borderRadius: "8px",
  padding: "8px",
  backgroundColor: !filled ? "transparent" : "rgb(244, 247, 250)",
  marginLeft: "auto",
}));

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

const StyledListCard = styled(StyledCard)({
  padding: 0,
  "& .MuiCardActionArea-root": {
    padding: "16px",
    paddingTop: "8px",
  },
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

const TableCellSkeleton: FC = () => (
  <TableCell>
    <Skeleton variant="text" animation="wave" />
  </TableCell>
);

const VehicleSkeleton: FC = () => (
  <TableRow>
    <TableCell>
      <Skeleton variant="rectangular" width={75} height={75} animation="wave" />
    </TableCell>
    <Repeater count={6} Component={TableCellSkeleton} />
  </TableRow>
);

const ListSkeleton: FC = () => (
  <StyledListCard elevation={0}>
    <Grid component={CardContent} container>
      <Grid item xs={8}>
        <Box flexGrow={1}>
          <Skeleton variant="text" animation="wave" sx={{ fontSize: "1.5rem" }} />
          <Skeleton variant="text" animation="wave" sx={{ fontSize: "0.8rem" }} />
          <Skeleton variant="text" animation="wave" sx={{ fontSize: "0.8rem" }} />
        </Box>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip label={<Skeleton variant="text" animation="wave" width={45} />} />
          <Chip label={<Skeleton variant="text" animation="wave" width={45} />} />
        </Stack>
      </Grid>
      <Grid item xs={4}>
        <StyledListOwner direction="row" gap={1} sx={{ height: "55px" }} filled>
          <Skeleton variant="rounded" width={40} height={40} animation="wave" />
          <Stack direction="column" justifyContent="center" flexGrow={1}>
            <Skeleton variant="text" animation="wave" />
            <Skeleton variant="text" animation="wave" />
          </Stack>
        </StyledListOwner>
      </Grid>
    </Grid>
  </StyledListCard>
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
  const { profile } = useAuthProvider();
  const { followingVehicles: vehicles, profileLists: lists } = profile || {};
  const { register, handleSubmit } = useForm<{ query: string }>();

  const [searchType, setSearchType] = useState<SearchType>("Vehicle");
  const [plateDecoderOpen, setPlateDecoderOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(15);
  const [status, results, setQuery] = useSearch(searchType, 100);

  const paginatedResults: SearchResult<SearchType> = useMemo(() => {
    if (results.length === 0) {
      return [];
    }

    return results.slice((page - 1) * perPage, page * perPage);
  }, [searchType, results, page, perPage]);

  const resultCount: number = useMemo(() => (status === LookupStatus.Success ? results.length : 0), [status, results]);

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
    setPerPage(type === "Vehicle" ? 15 : 30);
  };

  const handleSearch = (data: { query: string }) => {
    setQuery(data.query);
    setPage(1);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDecoderSelect = (vehicle: PlateDecodeResponse | null) => {
    if (!vehicle) {
      return;
    }

    setPlateDecoderOpen(false);
    navigate(`/vehicle/${vehicle.vin}`);
  };

  return (
    <Stack direction="row">
      <Container maxWidth="xl">
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
                      <Tooltip title="Advanced Search" placement="right">
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
                {resultCount}
                {" "}
                Results
              </Typography>
            </Divider>

            <TabContext value={searchType}>
              <StyledPanel value="Vehicle">
                <StyledCard elevation={3} sx={{ padding: 0 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ textAlign: "center" }}>Preview</TableCell>
                          <TableCell>Year</TableCell>
                          <TableCell>Make</TableCell>
                          <TableCell>Model</TableCell>
                          <TableCell>Trim</TableCell>
                          <TableCell>VIN</TableCell>
                          <TableCell>Options</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(status === LookupStatus.Success && paginatedResults.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ textAlign: "center" }}>
                              <NoSearchResults />
                            </TableCell>
                          </TableRow>
                        )}
                        {(status === LookupStatus.Success && paginatedResults.length > 0) && (
                          paginatedResults.map((result) => {
                            const { year, make, model, trim, vin, icon_photo } = result as Vehicle;

                            if (!vin) {
                              return null;
                            }

                            return (
                              <TableRow key={vin}>
                                <TableCell>
                                  <StyledVehicleImg src={icon_photo} alt={formatVehicleName(result as Vehicle)} />
                                </TableCell>
                                <TableCell>{year}</TableCell>
                                <TableCell>{make}</TableCell>
                                <TableCell>{model}</TableCell>
                                <TableCell>{trim || "-"}</TableCell>
                                <TableCell>{vin}</TableCell>
                                <TableCell>
                                  <Link to={`/vehicle/${vin}`}>
                                    View
                                  </Link>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                        {(status === LookupStatus.Loading) && (<Repeater count={5} Component={VehicleSkeleton} />)}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </StyledCard>
                <StyledPagination
                  count={Math.ceil(resultCount / perPage) || 1}
                  page={page}
                  onChange={(e, page) => handlePageChange(page)}
                  variant="outlined"
                  shape="rounded"
                />
              </StyledPanel>
              <StyledPanel value="Profile">
                <List>
                  {(status === LookupStatus.Loading) && (<Repeater count={8} Component={ProfileSkeleton} />)}
                  {(status === LookupStatus.Success && paginatedResults.length === 0) && (
                    <NoSearchResults />
                  )}
                  {(status === LookupStatus.Success && paginatedResults.length > 0) && (
                    paginatedResults.map((result) => {
                      const { uuid, username, avatar, display_name } = result as ProfileSearchResult;

                      if (!uuid || !username) {
                        return null;
                      }

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
                {(status === LookupStatus.Loading) && (<Repeater count={5} Component={ListSkeleton} />)}
                {(status === LookupStatus.Success && paginatedResults.length === 0) && (
                  <NoSearchResults />
                )}
                {(status === LookupStatus.Success && paginatedResults.length > 0) && (
                  paginatedResults.map((result) => {
                    const { uuid, name, description, owner, follower_count, vehicle_count, created_date } = result as List;
                    const { username, avatar } = owner || {};

                    if (!uuid || !owner) {
                      return null;
                    }

                    return (
                      <StyledListCard key={uuid} elevation={0}>
                        <CardActionArea component={Link} to={`/list/${uuid}`}>
                          <Grid component={CardContent} container>
                            <Grid item xs={8}>
                              <Box flexGrow={1}>
                                <Typography variant="h5">{name}</Typography>
                                <GenericText content={description} />
                              </Box>
                              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                <Chip label={`${vehicle_count} vehicles`} />
                                <Chip label={`${follower_count} followers`} />
                              </Stack>
                            </Grid>
                            <Grid item xs={4}>
                              <StyledListOwner direction="row" gap={1} sx={{ height: "55px" }} filled>
                                <ProfileAvatar username={username} avatar={avatar} />
                                <Stack direction="column" justifyContent="center">
                                  <Typography variant="body1" fontWeight={600} component="div">
                                    <StyledLink to={`/profile/${uuid}`}>
                                      {`@${username}`}
                                    </StyledLink>
                                  </Typography>
                                  <Typography variant="body2" component="div">
                                    Created on
                                    {" "}
                                    {new Date(created_date).toLocaleDateString()}
                                  </Typography>
                                </Stack>
                              </StyledListOwner>
                            </Grid>
                          </Grid>
                        </CardActionArea>
                      </StyledListCard>
                    );
                  })
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
      </Container>
      <StyledSidebarBox>
        {vehicles && <VehicleSuggestion suggestions={sortVehicles(vehicles)} limit={4} />}
        {lists && <ListSuggestion suggestions={lists} limit={4} />}
      </StyledSidebarBox>
      <ScrollToTop topGap={false} />
    </Stack>
  );
};

export default View;
