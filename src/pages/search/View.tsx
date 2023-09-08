import React, { FC, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card, Container, Divider, IconButton,
  Pagination, Stack, Tab, Tabs,
  TextField, Tooltip, Typography, styled,
} from "@mui/material";
import { TabContext, TabPanel } from "@mui/lab";
import { List, Badge, DirectionsCar, PersonSearch, Search } from "@mui/icons-material";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { useRecentVehicles } from "../../Providers/RecentVehicles";
import PlateDecoder from "../../components/PlateDecoder/Dialog";
import VehicleSuggestion from "../../components/SuggestionCards/VehicleSuggestion";
import { ENDPOINTS, STATUS_OK } from "../../config/Endpoints";
import ListSuggestion from "../../components/SuggestionCards/ListSuggestion";

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

const fetchLists = async (uuid: Profile["uuid"], token: string): Promise<ProfileLists | null> => {
  const response = await fetch(`${ENDPOINTS.lists}${uuid}/10`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { status, lists_following, lists_my, lists_other } = await response.json();
  if (status === STATUS_OK) {
    return {
      following: (lists_following)?.map((r: { list: List }) => r?.list),
      owned: (lists_my)?.map((r: { list: List }) => r?.list),
      other: (lists_other)?.map((r: { list: List }) => r?.list),
    };
  }

  return null;
};

const View : FC = () => {
  const { token, user } = useAuthProvider();
  const { vehicles } = useRecentVehicles();
  const navigate = useNavigate();

  // TODO: this is just a demo test
  const [lists, setLists] = useState<ProfileLists | null>(null);
  useEffect(() => {
    if (!user?.uuid || !token) return;

    fetchLists(user.uuid, token).then(setLists);
  }, []);

  const [searchType, setSearchType] = useState<"vehicle" | "list" | "person">("vehicle");
  const [plateDecoderOpen, setPlateDecoderOpen] = useState<boolean>(false);

  const placeholder: string = useMemo(() => {
    switch (searchType) {
      case "vehicle":
        return "VIN or Vehicle Description";
      case "list":
        return "list name";
      default:
        return "Username or Email";
    }
  }, [searchType]);

  const searchChange = (event: React.SyntheticEvent, newValue: "vehicle" | "list" | "person") => {
    setSearchType(newValue);
    // TODO: fetch data
  };

  const onDecoderSelect = (vehicle: Vehicle | null) => {
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
                    <StyledTab value="vehicle" label="Vehicles" icon={<DirectionsCar />} iconPosition="start" />
                    <StyledTab value="person" label="Profiles" icon={<PersonSearch />} iconPosition="start" />
                    <StyledTab value="list" label="Lists" icon={<List />} iconPosition="start" />
                  </Tabs>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField placeholder={`Search by ${placeholder}`} size="small" fullWidth />
                    {searchType === "vehicle" && (
                      <Tooltip title="Advanced Search" placement="right">
                        <IconButton onClick={() => setPlateDecoderOpen(true)}>
                          <Badge />
                        </IconButton>
                      </Tooltip>
                    )}
                    <IconButton>
                      <Search />
                    </IconButton>
                  </Stack>
                </Stack>
              </StyledCard>
            </Stack>

            <Divider sx={{ my: 3 }} textAlign="center">
              <Typography variant="h5">
                0
                {" "}
                Results
              </Typography>
            </Divider>

            <TabContext value={searchType}>
              <StyledPanel value="vehicle">
                {/* TODO: Show recents here but make sure it's collapsable */}
                <Stack direction="column" spacing={1}>
                  <StyledCard elevation={2}>
                    aaa
                  </StyledCard>
                </Stack>

                <Pagination count={1} variant="outlined" shape="rounded" />
              </StyledPanel>
              <StyledPanel value="list">
                {/* TODO: show my lists and following */}
                lists
                <Pagination count={1} variant="outlined" shape="rounded" />
              </StyledPanel>
              <StyledPanel value="person">
                {/* TODO: show profiles matching result */}
                users
                <Pagination count={1} variant="outlined" shape="rounded" />
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
        {vehicles && <VehicleSuggestion suggestions={vehicles} limit={4} />}
        {lists && <ListSuggestion suggestions={lists} limit={4} />}
      </StyledSidebarBox>
    </Stack>
  );
};

export default View;
