import React, { FC, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Badge, DirectionsCar, List, PersonSearch, Search } from "@mui/icons-material";
import { TabContext, TabPanel } from "@mui/lab";
import {
  Box,
  Card, Container, Divider, IconButton,
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
  paddingTop: "8px",
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

const NoSearchResults: FC = () => (
  <Typography variant="caption" textAlign="center" color="textSecondary">No results found</Typography>
);

const VehicleSkeleton: FC = () => (
  <TableRow>
    <TableCell>
      <Skeleton variant="rectangular" width={75} height={75} animation="wave" />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" animation="wave" />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" animation="wave" />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" animation="wave" />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" animation="wave" />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" animation="wave" />
    </TableCell>
    <TableCell>
      <Skeleton variant="text" animation="wave" />
    </TableCell>
  </TableRow>
);

const View : FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuthProvider();
  const { followingVehicles: vehicles, profileLists: lists } = profile || {};
  const { register, handleSubmit } = useForm<{ query: string }>();

  const [searchType, setSearchType] = useState<SearchType>("Vehicle");
  const [plateDecoderOpen, setPlateDecoderOpen] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [status, results, setQuery] = useSearch(searchType, 100);

  const paginatedResults: SearchResult<SearchType> = useMemo(() => {
    if (results.length === 0) {
      return [];
    }

    return results.slice((page - 1) * 10, page * 10);
  }, [results, page]);

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

  const searchChange = (event: React.SyntheticEvent, newValue: SearchType) => {
    setSearchType(newValue);
    setPage(1);
  };

  const handleSearch = (data: { query: string }) => {
    setQuery(data.query);
    setPage(1);
  };

  const handlePageChange = (page: number) => {
    setPage(page);
    window.scrollTo(0, 0);
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
              <StyledCard elevation={3}>
                <Stack direction="column" spacing={2}>
                  <Tabs value={searchType} variant="fullWidth" onChange={searchChange} centered>
                    <StyledTab value="Vehicle" label="Vehicles" icon={<DirectionsCar />} iconPosition="start" />
                    <StyledTab value="Profile" label="Profiles" icon={<PersonSearch />} iconPosition="start" />
                    <StyledTab value="List" label="Lists" icon={<List />} iconPosition="start" />
                  </Tabs>

                  <form onSubmit={handleSubmit(handleSearch)}>
                    <Stack direction="row" spacing={1} alignItems="center">
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
                  </form>
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
                        {(status === LookupStatus.Loading) && (
                          <>
                            <VehicleSkeleton />
                            <VehicleSkeleton />
                            <VehicleSkeleton />
                            <VehicleSkeleton />
                            <VehicleSkeleton />
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </StyledCard>
                <StyledPagination
                  count={Math.ceil(resultCount / 10) || 1}
                  page={page}
                  onChange={(e, page) => handlePageChange(page)}
                  variant="outlined"
                  shape="rounded"
                />
              </StyledPanel>
              <StyledPanel value="Profile">
                {/* TODO: show profiles matching result */}
                {status}
                <StyledPagination
                  count={Math.ceil(resultCount / 10) || 1}
                  page={page}
                  onChange={(e, page) => handlePageChange(page)}
                  variant="outlined"
                  shape="rounded"
                />
              </StyledPanel>
              <StyledPanel value="List">
                {/* TODO: show my lists and following */}
                {/* https://dribbble.com/shots/11462972-Advanced-Search */}
                {status}
                <StyledPagination
                  count={Math.ceil(resultCount / 10) || 1}
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
      <ScrollToTop />
    </Stack>
  );
};

export default View;
