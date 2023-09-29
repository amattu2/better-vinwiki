import React, { FC, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Edit, Facebook, Instagram, LinkOutlined,
  MyLocationOutlined, NavigateNext, Twitter,
} from "@mui/icons-material";
import {
  LoadingButton, TabContext, TabList, TabPanel,
  Timeline, TimelineConnector, TimelineContent,
  TimelineDot, TimelineItem, TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab";
import {
  Box, Breadcrumbs, Button, Chip,
  IconButton, Skeleton, Stack,
  Tab, Tooltip, Typography, styled,
} from "@mui/material";
import { useAuthProvider } from "../../Providers/AuthProvider";
import { ProviderStatus as FeedProviderStatus, useFeedProvider } from "../../Providers/FeedProvider";
import EditProfileDialog from "../../components/EditProfileDialog";
import FeedPost from "../../components/FeedPost";
import FollowersDialog from "../../components/FollowersDialog";
import FollowingDialog from "../../components/FollowingDialog";
import GenericText from "../../components/GenericText/GenericText";
import { ListSearchCard, ListSearchSkeleton } from "../../components/ListSearchCard";
import ListsDialog from "../../components/ListsDialog";
import Loader from "../../components/Loader";
import ProfileAvatar from "../../components/ProfileAvatar";
import { StatisticItem } from "../../components/ProfileStatistic";
import Repeater from "../../components/Repeater";
import { ScrollToTop } from "../../components/ScrollToTop";
import VehicleTableDialog from "../../components/VehicleTableDialog";
import useIsFollowingLookup, { LookupStatus } from "../../hooks/useIsFollowingLookup";
import useProfileListsLookup from "../../hooks/useProfileListsLookup";
import useProfileLookup, { LookupStatus as ProfileProviderStatus } from "../../hooks/useProfileLookup";
import { mapPostsToDate } from "../../utils/feed";

type Props = {
  uuid: string;
};

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

const StyledTab = styled(Tab)({
  textTransform: "none",
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

const StyledProfileAvatar = styled(ProfileAvatar)(({ theme }) => ({
  width: "64px",
  height: "64px",
  border: "4px solid #fff",
  boxShadow: theme.shadows[2],
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  padding: theme.spacing(0.5),
}));

const StyledProfileBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
}));

const StyledStatisticStack = styled(Stack)(({ theme }) => ({
  position: "relative",
  padding: theme.spacing(1),
  alignItems: "center",
}));

const StyledContainerTitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(2),
  marginLeft: 0,
}));

const StyledTopLists = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const StyledTabBox = styled(Box)(({ theme }) => ({
  borderBottom: "1px solid #ddd",
  marginLeft: "-20px",
  marginRight: "-20px",
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(-1),
}));

const StyledTimelineContent = styled(TimelineContent)({
  "&.MuiTimelineContent-root": {
    textAlign: "unset !important",
  },
});

/**
 * A List Search Card Skeleton Wrapper
 *
 * @returns {JSX.Element}
 */
const TopListSkeleton: FC = () => (
  <Box sx={{ flex: "calc(1/3)" }}>
    <ListSearchSkeleton omitOwner />
  </Box>
);

const View: FC<Props> = ({ uuid }: Props) => {
  const [{ status: profileStatus, profile }, editProfile] = useProfileLookup(uuid, true);
  const { profile: authProfile } = useAuthProvider();
  const { status: feedStatus, posts, hasNext, next } = useFeedProvider();
  const postPanelRef = useRef<HTMLDivElement>(null);

  const [{ status: isFollowingStatus, following }, toggleFollow] = useIsFollowingLookup(uuid);
  const [listLookupStatus, lists] = useProfileListsLookup(uuid, true);
  const [listsOpen, setListsOpen] = useState<boolean>(false);
  const [followersOpen, setFollowersOpen] = useState<boolean>(false);
  const [followingOpen, setFollowingOpen] = useState<boolean>(false);
  const [vehiclesOpen, setVehiclesOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(15);

  const listCount: number = useMemo(() => (lists?.owned?.length || 0) + (lists?.following?.length || 0), [lists]);
  const topLists: List[] = useMemo(() => lists?.owned?.sort((b, a) => (a.follower_count + a.vehicle_count) - (b.follower_count + b.vehicle_count)).slice(0, 3) || [], [lists]);

  const filteredPosts: FeedPost[] = useMemo(() => posts
    .filter((p) => !(p.client === "vinbot" && p.person.username !== "vinbot" && !p.post_text))
    .sort((a, b) => (new Date(b.post_date)).getTime() - (new Date(a.post_date)).getTime()), [posts]);
  const slicedPosts: FeedPost[] = useMemo(() => filteredPosts.slice(0, limit), [filteredPosts, limit]);
  const dateMappedPosts: { [date: string]: FeedPost[] } = useMemo(() => mapPostsToDate(slicedPosts), [slicedPosts]);

  const loadMore = () => {
    setLimit((prev) => prev + 15);

    if ((limit + 16) >= filteredPosts.length) {
      next?.(30);
    }
  };

  const viewPosts = () => {
    postPanelRef?.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (profileStatus === ProfileProviderStatus.Loading) {
    return <Loader />;
  }

  if (profileStatus === ProfileProviderStatus.Error || !profile) {
    return <span>Something went wrong!</span>;
  }

  return (
    <Box>
      <StyledHeaderSection direction="row" alignItems="center" justifyContent="flex-start" gap={2}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mr: "auto" }}>
          <StyledLink to="/">Home</StyledLink>
          <Typography>{`@${profile.username}`}</Typography>
        </Breadcrumbs>
        {profile.uuid === authProfile?.uuid && (
          <Tooltip title="Edit Profile" arrow>
            <StyledIconButton onClick={() => setEditOpen(true)}>
              <Edit />
            </StyledIconButton>
          </Tooltip>
        )}
      </StyledHeaderSection>

      <StyledProfileDetails direction="column" gap={2}>
        <Stack direction="row" alignItems="center" justifyContent="flex-start" gap={2}>
          <StyledProfileAvatar username={profile.username} avatar={profile.avatar} rounded />
          <Stack direction="column" alignItems="flex-start" justifyContent="center" gap={1}>
            <Typography variant="h3" fontSize={18} lineHeight={1} fontWeight="bold">{`@${profile.username}`}</Typography>
            {profile.bio ? <GenericText content={profile.bio} /> : null}
          </Stack>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="flex-start" gap={1}>
          {profile?.location && (
            <Tooltip title="Location" arrow>
              <StyledChip icon={<MyLocationOutlined />} label={profile.location} variant="filled" size="small" />
            </Tooltip>
          )}
          {profile?.website_url && (
            <Link to={profile.website_url} target="_blank" rel="noopener noreferrer">
              <StyledChip icon={<LinkOutlined />} label={profile.website_url} variant="filled" size="small" />
            </Link>
          )}
          {profile?.social_facebook && (
            <Tooltip title="Facebook" arrow>
              <StyledChip icon={<Facebook />} label={profile.social_facebook} variant="filled" size="small" />
            </Tooltip>
          )}
          {profile?.social_twitter && (
            <Tooltip title="Twitter" arrow>
              <StyledChip icon={<Twitter />} label={profile.social_twitter} variant="filled" size="small" />
            </Tooltip>
          )}
          {profile?.social_instagram && (
            <Tooltip title="Instagram" arrow>
              <StyledChip icon={<Instagram />} label={profile.social_instagram} variant="filled" size="small" />
            </Tooltip>
          )}
        </Stack>

        {profile?.uuid !== authProfile?.uuid && (
          isFollowingStatus === LookupStatus.Loading ? (
            <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: "8px" }} />
          ) : (
            <Button variant="outlined" color="primary" onClick={toggleFollow} sx={{ mr: "auto", textTransform: "none" }}>{following ? "Unfollow" : "Follow"}</Button>
          )
        )}
      </StyledProfileDetails>

      <StyledProfileBox>
        <StyledStatisticStack direction="row" spacing={3}>
          <StatisticItem
            name="Followers"
            value={profile?.follower_count}
            onClick={() => setFollowersOpen(true)}
          />
          <StatisticItem
            name="Following"
            value={profile?.following_count}
            onClick={() => setFollowingOpen(true)}
          />
          <StatisticItem
            name="Following Vehicles"
            value={profile?.following_vehicle_count}
            onClick={() => setVehiclesOpen(true)}
          />
          <StatisticItem
            name="Posts"
            value={profile.post_count}
            onClick={viewPosts}
          />
          <StatisticItem
            name="Lists"
            value={listCount}
            onClick={() => setListsOpen(true)}
          />
        </StyledStatisticStack>

        <StyledContainerTitle variant="h5">Top Lists</StyledContainerTitle>
        <StyledTopLists direction="row" alignItems="center" spacing={3}>
          {listLookupStatus === LookupStatus.Loading && (<Repeater count={3} Component={TopListSkeleton} />)}
          {listLookupStatus === LookupStatus.Success && topLists.map((list) => (
            <Box key={list.uuid} sx={{ flex: "calc(1/3)" }}>
              <ListSearchCard list={list} omitOwner />
            </Box>
          ))}
          {(listLookupStatus !== LookupStatus.Loading && topLists.length === 0) && (
            <Typography variant="body1" margin="auto">No lists found</Typography>
          )}
        </StyledTopLists>

        <TabContext value="posts">
          <StyledTabBox>
            <TabList>
              <StyledTab label="Posts" value="posts" />
            </TabList>
          </StyledTabBox>
          <TabPanel value="posts" ref={postPanelRef}>
            <Timeline position="alternate-reverse">
              {dateMappedPosts && Object.keys(dateMappedPosts).map((date) => (
                <TimelineItem key={date}>
                  <TimelineOppositeContent color="textSecondary">
                    {date}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <StyledTimelineContent>
                    {dateMappedPosts[date]?.map((post) => (<FeedPost key={post.uuid} {...post} />))}
                  </StyledTimelineContent>
                </TimelineItem>
              ))}
              {!hasNext && (
                <TimelineItem>
                  <TimelineOppositeContent color="textSecondary" fontWeight="bold">
                    End of Post History
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot />
                  </TimelineSeparator>
                  <StyledTimelineContent />
                </TimelineItem>
              )}
            </Timeline>
            {hasNext && (
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <LoadingButton
                  variant="outlined"
                  onClick={loadMore}
                  loading={feedStatus === FeedProviderStatus.RELOADING}
                >
                  Show More
                </LoadingButton>
              </Box>
            )}
          </TabPanel>
        </TabContext>
      </StyledProfileBox>

      <ScrollToTop topGap={false} />
      {(lists && listsOpen) && <ListsDialog lists={lists} onClose={() => setListsOpen(false)} />}
      {(profile.follower_count > 0 && followersOpen) && <FollowersDialog identifier={uuid} type="Profile" count={profile.follower_count} onClose={() => setFollowersOpen(false)} />}
      {(profile.following_count > 0 && followingOpen) && <FollowingDialog uuid={uuid} count={profile.following_count} onClose={() => setFollowingOpen(false)} />}
      {(profile.following_vehicle_count > 0 && vehiclesOpen) && <VehicleTableDialog uuid={uuid} onClose={() => setVehiclesOpen(false)} />}
      {(authProfile?.uuid === uuid && editOpen) && <EditProfileDialog profile={profile} onClose={() => setEditOpen(false)} onConfirm={editProfile} />}
    </Box>
  );
};

export default View;
