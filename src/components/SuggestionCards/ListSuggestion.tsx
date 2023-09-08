import React, { FC } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card, CardContent, CardHeader,
  Chip,
  List, ListItem,
  ListItemText,
  Stack,
  Typography,
  styled,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import TransitionGroup from '../TransitionGroup';
import { prettySubstring } from '../../utils/text';

type Props = {
  suggestions: ProfileLists;
  limit: number;
};

const StyledCard = styled(Card)({
  borderRadius: "8px",
  backgroundColor: "transparent",
  maxWidth: "450px",
  marginBottom: "16px",
});

const StyledCardHeader = styled(CardHeader)({
  paddingTop: "8px",
  paddingBottom: "8px",
  backgroundColor: "#fff",
});

const StyledCardContent = styled(CardContent)({
  paddingTop: "8px",
  backgroundColor: "transparent",
  paddingBottom: "8px !important",
});

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

const SuggestionItem: FC<List> = (list: List) => {
  const { uuid, name, follower_count, vehicle_count, owner } = list;
  const { uuid: ownerUuid, username } = owner;

  return (
    <ListItem key={uuid} divider>
      <ListItemText
        primary={(
          <StyledLink to={`/list/${uuid}`}>
            <Typography variant="body1" fontWeight={600}>
              {prettySubstring(name, 30)}
            </Typography>
          </StyledLink>
        )}
        secondary={(
          <>
            <span>By </span>
            <Typography component="span" variant="body2" fontWeight={600}>
              <StyledLink to={`/profile/${ownerUuid}`}>{username}</StyledLink>
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
              <Chip label={`${vehicle_count} vehicles`} />
              <Chip label={`${follower_count} followers`} />
            </Stack>
          </>
        )}
      />
      <StyledLink to={`/list/${uuid}`}>
        View
      </StyledLink>
    </ListItem>
  );
};

const ListSuggestion: FC<Props> = ({ suggestions, limit }: Props) => {
  const { following, owned } = suggestions;

  if (!following?.length && !owned?.length) {
    return null;
  }

  return (
    <StyledCard raised>
      <StyledCardHeader
        title="List Suggestions"
        titleTypographyProps={{ variant: 'h6' }}
      />
      <StyledCardContent>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>
              My Lists
              <Typography component="span" variant="body2" fontWeight={600}>
                {" ("}
                {owned?.length || 0}
                {") "}
              </Typography>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {(owned?.length > 0) ? (
              <TransitionGroup
                items={owned.slice(0, limit).map((suggestion: List) => ({ suggestion, key: suggestion.uuid }))}
                render={({ suggestion }) => <SuggestionItem {...suggestion} />}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">
                You don&apos;t own any lists.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography>
              Following
              <Typography component="span" variant="body2" fontWeight={600}>
                {" ("}
                {following?.length || 0}
                {") "}
              </Typography>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {(following?.length > 0) ? (
              <TransitionGroup
                items={following.slice(0, limit).map((suggestion: List) => ({ suggestion, key: suggestion.uuid }))}
                render={({ suggestion }) => <SuggestionItem {...suggestion} />}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">
                You aren&apos;t following any lists.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      </StyledCardContent>
    </StyledCard>
  );
};

export default ListSuggestion;
