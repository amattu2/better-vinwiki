import React, { ElementType, FC } from "react";
import reactStringReplace from "react-string-replace";
import { Typography, styled } from "@mui/material";
import {
  EmailRegex,
  HyperlinkRegex,
  ListLinkRegex,
  MentionRegex,
  OBDiiRegex,
  ProfileLinkRegex,
  VehicleLinkRegex,
  VinRegex,
} from "../../config/RegEx";
import MentionChip from "../MentionChip";
import OBDiiChip from "../TroubleCodeChip";
import VehicleChip from "../VehicleChip";
import ProfileLinkChip from "../ProfileLinkChip";
import ListLinkChip from "../ListLinkChip";

type Props = {
  content: string;
  padding?: string;
};

const GenericLink = ({ href }: { href: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" data-testid="generic-link">
    {href}
  </a>
);

const StyledTypography = styled(Typography)<{ component: ElementType }>({
  "& .MuiChip-root": {
    marginLeft: "2px !important",
  },
});

/**
 * A generic text display for Feed Posts or Comments.
 *
 * Supports:
 * - Plain text (with newlines)
 * - Email address
 * - Hyperlink
 * - `@mention`
 * - `#VIN`
 * - List, Vehicle, Profile links
 * - OBD-ii Trouble Codes
 *
 * @param {FeedPost} post
 * @returns {JSX.Element}
 */
const GenericText: FC<Props> = ({ content, padding }: Props) => {
  const text = content.replace(/\s/g, " ");

  let parsed = reactStringReplace(text, MentionRegex, (match, i) => (
    <MentionChip key={`mention-${match}-${i}`} handle={match} />
  ));
  parsed = reactStringReplace(parsed, ProfileLinkRegex, (match, i) => (
    <ProfileLinkChip key={`profile-${match}-${i}`} uuid={match} />
  ));
  parsed = reactStringReplace(parsed, VehicleLinkRegex, (match, i) => (
    <VehicleChip key={`vehicle-${match}-${i}`} vin={match} />
  ));
  parsed = reactStringReplace(parsed, ListLinkRegex, (match, i) => (
    <ListLinkChip key={`list-${match}-${i}`} uuid={match} />
  ));
  parsed = reactStringReplace(parsed, EmailRegex, (match, i) => (
    <GenericLink key={`email-${match}-${i}`} href={`mailto:${match}`} />
  ));
  parsed = reactStringReplace(parsed, HyperlinkRegex, (match, i, o) => (
    <GenericLink key={`hyperlink-${match}-${i}-${o}`} href={match} />
  ));
  parsed = reactStringReplace(parsed, VinRegex, (match, i) => (
    <VehicleChip key={`vin-${match}-${i}`} vin={match.replace("#", "")} />
  ));
  parsed = reactStringReplace(parsed, OBDiiRegex, (match, i) => (
    <OBDiiChip key={`obd-${match}-${i}`} code={match} />
  ));

  return (
    <StyledTypography
      component="div"
      variant="body2"
      color="textSecondary"
      sx={{ mb: 1, wordBreak: "break-word", padding }}
      data-testid="generic-text-body"
    >
      {parsed}
    </StyledTypography>
  );
};

export default GenericText;
