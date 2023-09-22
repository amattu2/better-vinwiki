import React, { FC } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import GenericText from "../GenericText/GenericText";
import ProfileAvatar from "../ProfileAvatar";

type Props = {
  list: List;
  omitOwner?: boolean;
};

const StyledCard = styled(Card)({
  padding: "16px 24px",
  borderRadius: "8px",
  margin: "8px 0",
  border: "1px solid #e5e5e5",
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

/**
 * A reusable skeleton for the list search card
 *
 * @returns {JSX.Element}
 */
export const ListSearchSkeleton: FC = () => (
  <StyledListCard elevation={0}>
    <Grid component={CardContent} container>
      <Grid item xs={8}>
        <Box sx={{ mr: 2 }}>
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

/**
 * A card for displaying a list in search results
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
export const ListSearchCard: FC<Props> = ({ list, omitOwner } : Props) => {
  const { uuid, name, description, owner, follower_count, vehicle_count, created_date } = list;
  const { uuid: ownerUUID, username, avatar } = owner || {};

  if (!uuid || !owner) {
    return null;
  }

  return (
    <StyledListCard elevation={0}>
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
            {!omitOwner && (
              <StyledListOwner direction="row" gap={1} sx={{ height: "55px" }} filled>
                <ProfileAvatar username={username} avatar={avatar} />
                <Stack direction="column" justifyContent="center">
                  <Typography variant="body1" fontWeight={600} component="div">
                    <StyledLink to={`/profile/${ownerUUID}`}>
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
            )}
          </Grid>
        </Grid>
      </CardActionArea>
    </StyledListCard>
  );
};

export default ListSearchCard;
