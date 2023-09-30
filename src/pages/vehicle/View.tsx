import React, { FC, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Edit, NavigateNext, PlaylistAdd } from "@mui/icons-material";
import {
  Alert, Avatar, Box, Breadcrumbs, Button,
  Grid, IconButton, Skeleton, Stack,
  Tooltip, Typography, styled,
} from "@mui/material";
import { ProviderStatus as FeedProviderStatus, useFeedProvider } from "../../Providers/FeedProvider";
import { ProviderStatus as VehicleProviderStatus, useVehicleProvider } from "../../Providers/VehicleProvider";
import CreatePost from "../../components/CreatePost";
import EditVehicleDialog from "../../components/EditVehicleDialog";
import { ExpandableImage } from "../../components/ExpandableImage";
import FeedPost from "../../components/FeedPost";
import FollowersDialog from "../../components/FollowersDialog";
import ListAssignmentDialog from "../../components/ListAssignmentDialog";
import Loader from "../../components/Loader";
import { StatisticItem } from "../../components/ProfileStatistic";
import { ScrollToTop } from "../../components/ScrollToTop";
import useIsFollowingVehicleLookup, { LookupStatus as IsFollowingStatus } from "../../hooks/useIsFollowingVehicleLookup";
import { formatDateMMYY } from "../../utils/date";
import { formatVehicleName } from "../../utils/vehicle";
import ActionableCard from "../../components/ActionableCard";
import VinDecodeDialog from "../../components/VinDecodeDialog";
import RecallLookupDialog from "../../components/RecallLookupDialog";

type Props = {
  vin: Vehicle["vin"];
};

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

const StyledHeaderSection = styled(Stack)(({ theme }) => ({
  padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
  background: "#fff",
  borderBottom: `1px solid #ddd`,
  position: "sticky",
  top: 0,
  zIndex: 8,
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(-1),
}));

const StyledVehicleDetails = styled(Stack)(({ theme }) => ({
  borderRight: "1px solid #ddd",
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
  background: "#fff",
  paddingLeft: "24px !important",
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: "192px",
  height: "192px",
  border: "4px solid #fff",
  boxShadow: theme.shadows[2],
  borderRadius: "8px",
}));

const StyledContainerTitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  marginLeft: 0,
}));

const View: FC<Props> = ({ vin }: Props) => {
  const { status, vehicle, editVehicle } = useVehicleProvider();
  const { status: postStatus, posts, hasNext, next } = useFeedProvider();
  const [{ status: isFollowingStatus, following }, toggleFollow] = useIsFollowingVehicleLookup(vin);
  const [limit, setLimit] = useState<number>(15);
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [listDialogOpen, setListDialogOpen] = useState<boolean>(false);
  const [followersOpen, setFollowersOpen] = useState<boolean>(false);
  const [decodeOpen, setDecodeOpen] = useState<boolean>(false);
  const [recallsOpen, setRecallsOpen] = useState<boolean>(false);
  const postsContainer = useRef<HTMLDivElement>(null);

  const filteredPosts: FeedPost[] = useMemo(() => posts
    .filter((p) => !(p.client === "vinbot" && p.person.username !== "vinbot" && !p.post_text))
    .sort((a, b) => (new Date(b.post_date)).getTime() - (new Date(a.post_date)).getTime()), [posts]);
  const slicedPosts: FeedPost[] = useMemo(() => filteredPosts.slice(0, limit), [filteredPosts, limit]);

  const loadMore = () => {
    setLimit((prev) => prev + 15);

    if ((limit + 16) >= filteredPosts.length) {
      next?.(30);
    }
  };

  const viewPosts = () => {
    postsContainer?.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (status === VehicleProviderStatus.LOADING) {
    return <Loader />;
  }

  if (status === VehicleProviderStatus.ERROR || !vehicle || !editVehicle) {
    return <span>Something went wrong!</span>;
  }

  return (
    <Box>
      <StyledHeaderSection direction="row" alignItems="center" justifyContent="flex-start" gap={2}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mr: "auto" }}>
          <StyledLink to="/">Home</StyledLink>
          <Typography>{`#${vin}`}</Typography>
        </Breadcrumbs>
        <Tooltip title="Add to List" arrow>
          <StyledIconButton onClick={() => setListDialogOpen(true)}>
            <PlaylistAdd />
          </StyledIconButton>
        </Tooltip>
        <Tooltip title="Edit Vehicle" arrow>
          <StyledIconButton onClick={() => setEditDialogOpen(true)}>
            <Edit />
          </StyledIconButton>
        </Tooltip>
      </StyledHeaderSection>
      <Grid container columnSpacing={2} sx={{ borderBottom: "1px solid #ddd" }}>
        <Grid item xs={12} md={8}>
          <StyledVehicleDetails direction="row" alignItems="center" justifyContent="flex-start" gap={2} sx={{ p: 2 }}>
            <Box>
              <StyledAvatar>
                <ExpandableImage lowRes={vehicle.icon_photo} highRes={vehicle.poster_photo} alt={vehicle.vin} />
              </StyledAvatar>
              <Typography variant="caption" textAlign="center">{`#${vehicle.vin}`}</Typography>
            </Box>
            <Stack direction="column" sx={{ p: 2, pt: 0 }}>
              <Typography variant="h5" sx={{ mb: 1 }}>{formatVehicleName(vehicle)}</Typography>
              <Typography>
                <strong>VIN:</strong>
                {' '}
                {vehicle.vin}
              </Typography>
              <Typography>
                <strong>Make:</strong>
                {' '}
                {vehicle.make}
              </Typography>
              <Typography>
                <strong>Model:</strong>
                {' '}
                {vehicle.model}
              </Typography>
              <Typography>
                <strong>Trim:</strong>
                {' '}
                {vehicle.trim || "N/A"}
              </Typography>

              {isFollowingStatus === IsFollowingStatus.Loading ? (
                <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: "8px" }} />
              ) : (
                <Button variant="outlined" color="primary" onClick={toggleFollow} sx={{ mt: 1, mr: "auto", textTransform: "none" }}>{following ? "Unfollow" : "Follow"}</Button>
              )}
            </Stack>
          </StyledVehicleDetails>
        </Grid>
        <Grid container item xs={0} md={4} gap={2} sx={{ p: 2, background: "#fff", alignItems: "center" }}>
          <Grid
            component={StatisticItem}
            name="Followers"
            value={vehicle.follower_count}
            onClick={() => setFollowersOpen(true)}
            xs={6}
            md={3}
            item
            sx={{ flex: "calc(1/2)" }}
          />
          <Grid
            component={StatisticItem}
            name="Posts"
            value={vehicle.post_count}
            onClick={viewPosts}
            xs={6}
            md={3}
            item
            sx={{ flex: "calc(1/2)" }}
          />
          <Grid
            component={StatisticItem}
            name="Updated"
            value={formatDateMMYY(new Date(vehicle.updated))}
            xs={6}
            md={3}
            item
            sx={{ flex: "calc(1/2)" }}
          />
        </Grid>
      </Grid>
      <Box>
        <Grid container columnSpacing={2} alignItems="flex-start">
          <Grid item md={12} lg={8} ref={postsContainer}>
            <Box sx={{ p: 2, pt: 0 }}>
              <StyledContainerTitle variant="h5">Posts</StyledContainerTitle>
              <CreatePost vehicle={vehicle} />
              {/* TODO: loading skeleton using alternating post types automatically */}
              {slicedPosts?.map((post) => (<FeedPost key={post.uuid} {...post} />))}
              {(postStatus === FeedProviderStatus.LOADED && slicedPosts.length === 0) && (
                <Alert severity="info" sx={{ mb: 1 }}>Uh oh. We have no posts to show.</Alert>
              )}
              {hasNext && <Button onClick={loadMore}>Load More</Button>}
            </Box>
          </Grid>
          <Grid item md={12} lg={4} sx={{ pl: "0 !important", position: "sticky", top: "57px" }}>
            <ActionableCard
              title="CARFAX Service History"
              subtitle="Derived from CARFAX partner automotive service centers"
              disabled
              // TODO: CARFAX integration
            />
            <ActionableCard
              title="Diagnostic Scan History"
              subtitle="View OBD-ii diagnostic scan events reported by compatible MATCO tools"
              onClick={() => {}}
              // TODO: Golo365 scans
            />
            <ActionableCard
              title="Recalls"
              subtitle="Search for manufacturer recalls by year, make, and model"
              onClick={() => setRecallsOpen(true)}
            />
            <ActionableCard
              title="VIN Decode"
              subtitle="Perform full VIN decode of manufacturer options and features"
              onClick={() => setDecodeOpen(true)}
            />
          </Grid>
        </Grid>
      </Box>

      <ScrollToTop topGap={false} />
      {editDialogOpen && (<EditVehicleDialog vehicle={vehicle} onClose={() => setEditDialogOpen(false)} onConfirm={editVehicle} />)}
      {listDialogOpen && (<ListAssignmentDialog vehicle={vehicle} onClose={() => setListDialogOpen(false)} />)}
      {decodeOpen && (<VinDecodeDialog vin={vin} year={vehicle.year} onClose={() => setDecodeOpen(false)} />)}
      {recallsOpen && (<RecallLookupDialog year={vehicle.year} make={vehicle.make} model={vehicle.model} onClose={() => setRecallsOpen(false)} />)}
      {(vehicle.follower_count > 0 && followersOpen) && <FollowersDialog identifier={vin} type="Vehicle" count={vehicle.follower_count} onClose={() => setFollowersOpen(false)} />}
    </Box>
  );
};

export default View;
