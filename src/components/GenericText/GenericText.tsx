import React, { FC } from "react";
import reactStringReplace from "react-string-replace";
import { Typography } from "@mui/material";
import { EmailRegex, HyperlinkRegex, MentionRegex, OBDiiRegex, ProfileLinkRegex, VehicleLinkRegex, VinRegex } from "../../config/RegEx";
import MentionChip from "../MentionChip";
import OBDiiChip from "../TroubleCodeChip";
import VehicleChip from "../VehicleChip";
import UUIDChip from "../UUIDChip";

type Props = {
  content: string;
  padding?: string;
};

const GenericLink = ({ href }: { href: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" data-testid="generic-link">
    {href}
  </a>
);

/**
 * A generic text display for Feed Posts or Comments.
 *
 * Supports:
 * - Plain text (with newlines)
 * - Email address
 * - Hyperlink
 * - `@mention`
 * - `#VIN`
 *
 * @param {FeedPost} post
 * @returns {JSX.Element}
 */
const GenericText: FC<Props> = ({ content, padding }: Props) => {
  const text = content.replace(/\s/g, " ");

  // Parse List UUIDs and lookup the list's name for the list tag

  let parsed = reactStringReplace(text, MentionRegex, (match, i) => <MentionChip key={`mention-${match}-${i}`} handle={match} />);
  parsed = reactStringReplace(parsed, ProfileLinkRegex, (match, i) => <UUIDChip key={`profile-${match}-${i}`} uuid={match} />);
  parsed = reactStringReplace(parsed, VehicleLinkRegex, (match, i) => <VehicleChip key={`vehicle-${match}-${i}`} vin={match} />);
  parsed = reactStringReplace(parsed, EmailRegex, (match, i) => <GenericLink key={`email-${match}-${i}`} href={`mailto:${match}`} />);
  parsed = reactStringReplace(parsed, HyperlinkRegex, (match, i, o) => <GenericLink key={`hyperlink-${match}-${i}-${o}`} href={match} />);
  parsed = reactStringReplace(parsed, VinRegex, (match, i) => <VehicleChip key={`vin-${match}-${i}`} vin={match.replace("#", "")} />);
  parsed = reactStringReplace(parsed, OBDiiRegex, (match, i) => <OBDiiChip key={`obd-${match}-${i}`} code={match} />);

  return (
    <Typography
      component="div"
      variant="body2"
      color="textSecondary"
      sx={{ mb: 1, wordBreak: "break-word", padding }}
      data-testid="generic-text-body"
    >
      {parsed}
    </Typography>
  );
};

export default GenericText;
