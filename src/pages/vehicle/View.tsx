import React, { FC, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Edit, NavigateNext } from "@mui/icons-material";
import {
  Box, Breadcrumbs, Button,
  IconButton, Stack,
  Tooltip, Typography, styled,
} from "@mui/material";
import { useFeedProvider } from "../../Providers/FeedProvider";
import FeedPost from "../../components/FeedPost";
import { ProviderStatus, useVehicleProvider } from "../../Providers/VehicleProvider";
import Loader from "../../components/Loader";
import CreatePost from "../../components/CreatePost";

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
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(-1),
}));

const View: FC<Props> = ({ vin }: Props) => {
  const { status, vehicle, following } = useVehicleProvider();
  const { posts, hasNext, next } = useFeedProvider();
  const [limit, setLimit] = useState<number>(15);

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

  if (status === ProviderStatus.LOADING) {
    return <Loader />;
  }

  if (status === ProviderStatus.ERROR || !vehicle) {
    return <span>Something went wrong!</span>;
  }

  return (
    <Box>
      <StyledHeaderSection direction="row" alignItems="center" justifyContent="flex-start" gap={2}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mr: "auto" }}>
          <StyledLink to="/">Home</StyledLink>
          <Typography>{`#${vin}`}</Typography>
        </Breadcrumbs>
        <Tooltip title="Edit Vehicle" arrow>
          <StyledIconButton>
            <Edit />
          </StyledIconButton>
        </Tooltip>
      </StyledHeaderSection>
      <Box sx={{ px: 2, pt: 2 }}>
        <strong>VIN:</strong>
        {' '}
        {vehicle.vin}
        <br />
        <strong>Make:</strong>
        {' '}
        {vehicle.make}
        <br />
        <strong>Model:</strong>
        {' '}
        {vehicle.model}
        <br />
        <strong>You are following:</strong>
        {' '}
        {following ? "Yes" : "No"}
      </Box>
      <Box sx={{ px: 2 }}>
        <h3>Posts</h3>
        <CreatePost vehicle={vehicle} />
        {slicedPosts?.map((post) => (<FeedPost key={post.uuid} {...post} />))}
        {hasNext && <Button onClick={loadMore}>Load More</Button>}
      </Box>
    </Box>
  );
};

export default View;
