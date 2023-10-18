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
import ProfileAvatar from '../ProfileAvatar';
import { StyledLink } from '../StyledLink';

type ProfileSuggestion = {
  profile: Profile;
  postCount: number;
};

type Props = {
  cardTitle?: string;
  suggestions: ProfileSuggestion[];
  limit: number;
};

const StyledCard = styled(Card)({
  borderRadius: "8px",
  backgroundColor: "transparent",
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

const SuggestionItem: FC<ProfileSuggestion> = ({ profile, postCount }: ProfileSuggestion) => (
  <ListItem key={profile.uuid} divider>
    <ListItemAvatar>
      <ProfileAvatar username={profile.username} avatar={profile.avatar} />
    </ListItemAvatar>
    <ListItemText
      primary={(
        <StyledLink to={`/profile/${profile.uuid}`} target="_blank">
          <Typography variant="body1" fontWeight={600}>
            @
            {profile.username}
          </Typography>
        </StyledLink>
      )}
      secondary={`${postCount} ${postCount === 1 ? 'post' : 'posts'}`}
    />
    <StyledLink to={`/profile/${profile.uuid}`}>
      View
    </StyledLink>
  </ListItem>
);

const SuggestionCard: FC<Props> = ({ cardTitle = "In this feed", suggestions, limit }: Props) => (
  <StyledCard raised>
    <StyledCardHeader
      title={cardTitle}
      titleTypographyProps={{ variant: 'h6' }}
    />
    <StyledCardContent>
      <StyledList>
        <TransitionGroup
          items={suggestions.slice(0, limit).map((suggestion) => ({ suggestion, key: suggestion.profile.uuid }))}
          render={({ suggestion }) => <SuggestionItem {...suggestion} />}
        />
      </StyledList>
    </StyledCardContent>
  </StyledCard>
);

export default SuggestionCard;
