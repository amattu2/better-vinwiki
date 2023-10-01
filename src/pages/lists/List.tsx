import React, { FC, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Add, Edit, NavigateNext } from "@mui/icons-material";
import {
  Box, Breadcrumbs, Button,
  Card,
  IconButton, Stack, Tooltip, Typography, styled,
} from "@mui/material";
import { useAuthProvider } from "../../Providers/AuthProvider";
import FollowersDialog from "../../components/FollowersDialog";
import GenericText from "../../components/GenericText/GenericText";
import Loader from "../../components/Loader";
import { StatisticItem } from "../../components/ProfileStatistic";
import { ScrollToTop } from "../../components/ScrollToTop";
import { useListVehiclesProvider, ProviderStatus as ListProviderStatus } from "../../Providers/ListVehiclesProvider";
import useListLookup, { LookupStatus as ListLookupStatus } from "../../hooks/useListLookup";
import { VehicleTable } from "../../components/VehicleTable";
import { DEFAULT_DATE } from "../../config/Endpoints";
import { formatDate, formatDateMMYY } from "../../utils/date";
import ProfileAvatar from "../../components/ProfileAvatar";
import EditListDialog from "../../components/EditListDialog";

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

const StyledProfileBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
}));

const StyledStatisticStack = styled(Stack)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(1),
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
  const { profile } = useAuthProvider();
  const { status: listVehiclesStatus, vehicles, hasNext, next } = useListVehiclesProvider();
  const tableCardRef = useRef<HTMLDivElement>(null);

  const [followersOpen, setFollowersOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);

  const tablePageChange = (page: number, remaining: number) => {
    tableCardRef.current?.scrollIntoView({ behavior: "smooth" });

    if (remaining > 50) {
      return;
    }
    if (!hasNext) {
      return;
    }

    next?.(250);
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
            {/* TODO: Mass import dialog w/ CSV support? */}
            <Tooltip title="Add Vehicles" arrow>
              <StyledIconButton>
                <Add />
              </StyledIconButton>
            </Tooltip>

            {/* TODO: Add edit list dialog with DELETE list button */}
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

            {/* TODO: follow/unfollow and loading skeleton */}
            <Button variant="outlined" color="primary" sx={{ mr: "auto", textTransform: "none" }}>{false ? "Unfollow" : "Follow"}</Button>
          </Stack>
        </Stack>
      </StyledProfileDetails>

      <StyledProfileBox>
        <StyledStatisticStack direction="row" spacing={3}>
          <StatisticItem
            name="Followers"
            value={list.follower_count}
            onClick={() => setFollowersOpen(true)}
          />
          <StatisticItem
            name="Vehicles"
            value={list.vehicle_count}
            precise
          />
          <StatisticItem
            name="Created"
            value={list.created_date !== DEFAULT_DATE ? formatDateMMYY(new Date(list.created_date)) : "N/A"}
          />
        </StyledStatisticStack>
      </StyledProfileBox>

      <Card sx={{ mx: 2, mb: 2 }} elevation={2} ref={tableCardRef}>
        {/* TODO: Checkboxes for mass export or removal */}
        <VehicleTable
          status={list.vehicle_count === 0 || listVehiclesStatus !== ListProviderStatus.LOADING ? "success" : "loading"}
          vehicles={vehicles || []}
          totalCount={list.vehicle_count}
          onPageChange={tablePageChange}
        />
      </Card>

      <ScrollToTop topGap={false} />
      {(list.follower_count > 0 && followersOpen) && <FollowersDialog identifier={uuid} type="List" count={list.follower_count} onClose={() => setFollowersOpen(false)} />}
      {editOpen && <EditListDialog list={list} onClose={() => setEditOpen(false)} onDelete={onDeleteWrapper} onConfirm={editList} />}
    </Box>
  );
};

export default ListView;