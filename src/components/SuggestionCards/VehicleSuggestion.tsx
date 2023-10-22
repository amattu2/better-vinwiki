import React, { FC } from 'react';
import {
  Card, CardContent, CardHeader,
  List, ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  styled,
} from '@mui/material';
import TransitionGroup from '../TransitionGroup';
import { formatVehicleName } from '../../utils/vehicle';
import ProfileAvatar from '../ProfileAvatar';
import { StyledLink } from '../StyledLink';

type Props = {
  suggestions: Vehicle[];
  limit: number;
};

const StyledCard = styled(Card)({
  borderRadius: "8px",
  backgroundColor: "transparent",
  marginBottom: "16px",
});

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  paddingTop: "8px",
  paddingBottom: "8px",
  backgroundColor: theme.palette.background.default,
}));

const StyledList = styled(List)({
  "& .MuiCollapse-root:last-child li": {
    borderBottom: "none",
  },
});

const StyledCardContent = styled(CardContent)({
  paddingTop: "0px",
  backgroundColor: "transparent",
  paddingBottom: "8px !important",
});

const SuggestionItem: FC<Vehicle> = (vehicle: Vehicle) => {
  const { vin, long_name, icon_photo } = vehicle;

  if (!long_name) {
    return null;
  }

  return (
    <ListItem key={vin} divider>
      <ListItemAvatar>
        <ProfileAvatar username={long_name} avatar={icon_photo} />
      </ListItemAvatar>
      <ListItemText
        primary={(
          <StyledLink to={`/vehicle/${vin}`}>
            <Typography variant="body1" fontWeight={600}>
              {formatVehicleName(vehicle)}
            </Typography>
          </StyledLink>
        )}
        secondary={vin}
      />
      <StyledLink to={`/vehicle/${vin}`}>
        View
      </StyledLink>
    </ListItem>
  );
};

const VehicleSuggestion: FC<Props> = ({ suggestions, limit }: Props) => (
  <StyledCard raised>
    <StyledCardHeader
      title="Vehicle Suggestions"
      titleTypographyProps={{ variant: 'h6' }}
    />
    <StyledCardContent>
      <StyledList>
        <TransitionGroup
          items={suggestions.slice(0, limit).map((suggestion: Vehicle) => ({ suggestion, key: suggestion.vin }))}
          render={({ suggestion }) => <SuggestionItem {...suggestion} />}
        />
      </StyledList>
    </StyledCardContent>
  </StyledCard>
);

export default VehicleSuggestion;
