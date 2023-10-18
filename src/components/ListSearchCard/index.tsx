import React, { FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Theme,
  Typography,
  styled,
} from "@mui/material";
import GenericText from "../GenericText/GenericText";
import ProfileAvatar from "../ProfileAvatar";

type Props = {
  list: List;
  omitOwner?: boolean;
};

const StyledCard = styled(Card)(({ theme }) => ({
  padding: "16px 24px",
  borderRadius: "8px",
  margin: "8px 0",
  border: `1px solid ${theme.palette.divider}`,
}));

const StyledListOwner = styled(Stack, { shouldForwardProp: (p) => p !== "filled" })(({ filled, theme }: { filled: boolean, theme?: Theme }) => ({
  borderRadius: "8px",
  padding: "8px",
  backgroundColor: !filled || !theme ? "transparent" : theme.palette.action.selected,
  marginLeft: "auto",
}));

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
export const ListSearchSkeleton: FC<Pick<Props, "omitOwner">> = ({ omitOwner }: Pick<Props, "omitOwner">) => (
  <StyledListCard elevation={0}>
    <Grid component={CardContent} container>
      <Grid item xs={!omitOwner ? 8 : 12}>
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
      {!omitOwner && (
        <Grid item xs={4}>
          <StyledListOwner direction="row" gap={1} sx={{ height: "55px" }} filled>
            <Skeleton variant="rounded" width={40} height={40} animation="wave" />
            <Stack direction="column" justifyContent="center" flexGrow={1}>
              <Skeleton variant="text" animation="wave" />
              <Skeleton variant="text" animation="wave" />
            </Stack>
          </StyledListOwner>
        </Grid>
      )}
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
  const navigate = useNavigate();
  const { uuid, name, description, owner, follower_count, vehicle_count, created_date } = list;
  const { uuid: ownerUUID, username, avatar } = owner || {};

  const navigateToProfile = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/profile/${ownerUUID}`);
  };

  if (!uuid || !owner) {
    return null;
  }

  return (
    <StyledListCard elevation={0}>
      <CardActionArea component={Link} to={`/list/${uuid}`}>
        <Grid component={CardContent} container>
          <Grid item xs={!omitOwner ? 8 : 12}>
            <Box flexGrow={1}>
              <Typography variant="h5">{name}</Typography>
              <GenericText content={description} />
            </Box>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip label={`${vehicle_count} vehicle${vehicle_count !== 1 ? "s" : ""}`} />
              <Chip label={`${follower_count} follower${follower_count !== 1 ? "s" : ""}`} />
            </Stack>
          </Grid>
          {!omitOwner && (
            <Grid item xs={4}>
              <StyledListOwner direction="row" gap={1} sx={{ height: "55px" }} filled>
                <ProfileAvatar username={username} avatar={avatar} />
                <Stack direction="column" justifyContent="center">
                  <Typography variant="body1" fontWeight={600} component="div" onClick={navigateToProfile}>
                    {`@${username}`}
                  </Typography>
                  <Typography variant="body2" component="div">
                    Created on
                    {" "}
                    {new Date(created_date).toLocaleDateString()}
                  </Typography>
                </Stack>
              </StyledListOwner>
            </Grid>
          )}
        </Grid>
      </CardActionArea>
    </StyledListCard>
  );
};

export default ListSearchCard;
