import React, { FC, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Add, Edit, NavigateNext, UploadFile } from "@mui/icons-material";
import {
  Box, Breadcrumbs, Button, Card,
  IconButton, Skeleton, Stack, Tooltip,
  Typography, styled,
} from "@mui/material";
import { unparse } from "papaparse";
import { useAuthProvider } from "../../Providers/AuthProvider";
import FollowersDialog from "../../components/FollowersDialog";
import GenericText from "../../components/GenericText/GenericText";
import Loader from "../../components/Loader";
import { StatisticItem } from "../../components/StatisticItem";
import { ScrollToTop } from "../../components/ScrollToTop/ScrollButton";
import { useListVehiclesProvider, ProviderStatus as ListProviderStatus } from "../../Providers/ListVehiclesProvider";
import useListLookup, { LookupStatus as ListLookupStatus } from "../../hooks/useListLookup";
import { VehicleTable } from "../../components/VehicleTable";
import { DEFAULT_DATE } from "../../config/Endpoints";
import { formatDate, formatDateMMYY } from "../../utils/date";
import ProfileAvatar from "../../components/ProfileAvatar";
import EditListDialog from "../../components/EditListDialog";
import useIsFollowingListLookup, { LookupStatus as IsFollowingLookupStatus } from "../../hooks/useIsFollowingListLookup";
import { downloadBlob } from "../../utils/files";
import VehicleSelectionDialog from "../../components/VehicleSelectionDialog";
import DeleteContentDialog from "../../components/DeleteContentConfirm";
import ListImportDialog from "../../components/ListImportDialog";

type Props = {
  uuid: string;
};

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

const StyledHeaderSection = styled(Stack)(({ theme }) => ({
  padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
  borderBottom: "1px solid #ddd",
  background: "#fff",
  position: "sticky",
  top: 0,
  zIndex: 8,
}));

const StyledProfileDetails = styled(Stack)(({ theme }) => ({
  borderBottom: "1px solid #ddd",
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  background: "#fff",
  paddingLeft: "24px !important",
}));

const StyledStatisticStack = styled(Stack)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(2),
  alignItems: "center",
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(-1),
}));

const StyledListOwner = styled(Stack, { shouldForwardProp: (p) => p !== "filled" })(({ filled }: { filled?: boolean }) => ({
  borderRadius: "8px",
  padding: "8px",
  paddingLeft: !filled ? "0" : "8px",
  backgroundColor: !filled ? "transparent" : "rgb(244, 247, 250)",
  marginRight: "auto",
}));

/**
 * A page for viewing a single Vehicle List.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const ListView: FC<Props> = ({ uuid }: Props) => {
  const navigate = useNavigate();
  const [{ status, list }, editList, deleteList] = useListLookup(uuid, true);
  const [{ status: isFollowingStatus, following }, toggleFollow] = useIsFollowingListLookup(uuid);
  const { profile } = useAuthProvider();
  const {
    status: listVehiclesStatus, count, vehicles, hasNext,
    next, addVehicles, removeVehicles, addVins,
  } = useListVehiclesProvider();
  const tableCardRef = useRef<HTMLDivElement>(null);
  const deleteVehiclesRef = useRef<Vehicle[]>([]);

  const [followersOpen, setFollowersOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [addVehiclesOpen, setAddVehiclesOpen] = useState<boolean>(false);
  const [deleteVehiclesOpen, setDeleteVehiclesOpen] = useState<boolean>(false);
  const [uploadOpen, setUploadOpen] = useState<boolean>(false);

  const tableStatus = useMemo(() => {
    if (list && list.vehicle_count === 0) {
      return "success";
    }
    if (listVehiclesStatus === ListProviderStatus.LOADING) {
      return "loading";
    }
    if (listVehiclesStatus === ListProviderStatus.LOADING_MORE) {
      return "loading_more";
    }

    return "success";
  }, [listVehiclesStatus]);

  const tablePageChange = (page: number, remaining: number) => {
    if (remaining > 50) {
      return;
    }
    if (!hasNext) {
      return;
    }

    next?.(250);
  };

  const onConfirmDelete = async () => {
    await removeVehicles?.(deleteVehiclesRef.current.map((v) => v.vin));
    deleteVehiclesRef.current = [];
    setDeleteVehiclesOpen(false);
  };

  const deleteSelectionPrompt = async (vehicles: Vehicle[]) => {
    deleteVehiclesRef.current = vehicles;
    setDeleteVehiclesOpen(true);
  };

  const cancelDeleteVehicles = () => {
    setDeleteVehiclesOpen(false);
    deleteVehiclesRef.current = [];
  };

  const addVehiclesWrapper = async (vehicles: Vehicle[]) => {
    addVehicles?.(vehicles);
  };

  const importVehicles = async (vins: Vehicle["vin"][]) => {
    await addVins?.(vins);
  };

  const exportSelection = (vehicles: Vehicle[]) => {
    const d = unparse(vehicles);
    downloadBlob(d, 'export.csv', 'text/csv');
  };

  const onDeleteWrapper = async () => {
    await deleteList();
    navigate("/lists");
  };

  if (status === ListLookupStatus.Loading) {
    return <Loader />;
  }

  if (status === ListLookupStatus.Error || !list) {
    return <span>Something went wrong!</span>;
  }

  return (
    <Box>
      <StyledHeaderSection direction="row" alignItems="center" justifyContent="flex-start" gap={2}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mr: "auto" }}>
          <StyledLink to="/">Home</StyledLink>
          <StyledLink to="/lists">Lists</StyledLink>
          <Typography>{list.name}</Typography>
        </Breadcrumbs>
        {list.owner.uuid === profile?.uuid && (
          <>
            <Tooltip title="Import Vehicles" arrow>
              <StyledIconButton onClick={() => setUploadOpen(true)}>
                <UploadFile />
              </StyledIconButton>
            </Tooltip>
            <Tooltip title="Add Vehicles" arrow>
              <StyledIconButton onClick={() => setAddVehiclesOpen(true)}>
                <Add />
              </StyledIconButton>
            </Tooltip>
            <Tooltip title="Edit List" arrow>
              <StyledIconButton onClick={() => setEditOpen(true)}>
                <Edit />
              </StyledIconButton>
            </Tooltip>
          </>
        )}
      </StyledHeaderSection>

      <StyledProfileDetails direction="column" gap={2}>
        <Stack direction="row" alignItems="center" justifyContent="flex-start" gap={2}>
          <Stack direction="column" alignItems="flex-start" justifyContent="center" gap={1}>
            <Typography variant="caption" sx={{ mb: "-10px", color: "#3b3b3b" }}>
              {`Created ${formatDate(new Date(list.created_date))}`}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>{list.name}</Typography>
            {list.description ? <GenericText content={list.description} /> : null}

            <StyledListOwner direction="row" gap={1} sx={{ height: "55px" }}>
              <ProfileAvatar username={list.owner.username} avatar={list.owner.avatar} />
              <Stack direction="column" justifyContent="center">
                <Typography variant="caption" sx={{ mb: "-5px" }}>
                  List Curator
                </Typography>
                <Typography component={StyledLink} to={`/profile/${list.owner.uuid}`} variant="body1" fontWeight={600}>
                  {`@${list.owner.username}`}
                </Typography>
              </Stack>
            </StyledListOwner>
            {profile?.uuid !== list?.owner?.uuid && (
              isFollowingStatus === IsFollowingLookupStatus.Loading ? (
                <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: "8px" }} />
              ) : (
                <Button variant="outlined" color="primary" onClick={toggleFollow} sx={{ mr: "auto", textTransform: "none" }}>{following ? "Unfollow" : "Follow"}</Button>
              )
            )}
          </Stack>
        </Stack>
      </StyledProfileDetails>

      <StyledStatisticStack direction="row" spacing={3}>
        <StatisticItem
          name="Followers"
          value={list.follower_count}
          onClick={() => setFollowersOpen(true)}
        />
        <StatisticItem
          name="Vehicles"
          value={listVehiclesStatus !== ListProviderStatus.LOADING ? count : list.vehicle_count}
          precise
        />
        <StatisticItem
          name="Created"
          value={list.created_date !== DEFAULT_DATE ? formatDateMMYY(new Date(list.created_date)) : "N/A"}
        />
      </StyledStatisticStack>

      <Card sx={{ mx: 2, mb: 2 }} elevation={2} ref={tableCardRef}>
        <VehicleTable
          status={tableStatus}
          vehicles={vehicles || []}
          totalCount={listVehiclesStatus !== ListProviderStatus.LOADING ? count : list.vehicle_count}
          onPageChange={tablePageChange}
          onExport={exportSelection}
          onDelete={list.owner.uuid === profile?.uuid ? deleteSelectionPrompt : undefined}
        />
      </Card>

      <ScrollToTop topGap={false} />
      <DeleteContentDialog
        open={deleteVehiclesOpen}
        type="list_vehicles"
        onConfirm={onConfirmDelete}
        onCancel={cancelDeleteVehicles}
      />
      {(list.follower_count > 0 && followersOpen) && <FollowersDialog identifier={uuid} type="List" count={list.follower_count} onClose={() => setFollowersOpen(false)} />}
      {editOpen && <EditListDialog list={list} onClose={() => setEditOpen(false)} onDelete={onDeleteWrapper} onConfirm={editList} />}
      {addVehiclesOpen && <VehicleSelectionDialog onSelect={addVehiclesWrapper} onClose={() => setAddVehiclesOpen(false)} />}
      {uploadOpen && (<ListImportDialog onConfirm={importVehicles} onClose={() => setUploadOpen(false)} />)}
    </Box>
  );
};

export default ListView;
