import React, { FC } from "react";
import reactStringReplace from "react-string-replace";
import { Typography } from "@mui/material";
import { EmailRegex, HyperlinkRegex, MentionRegex, OBDiiRegex, VehicleLinkRegex, VinRegex } from "../../config/RegEx";
import MentionChip from "../MentionChip";
import OBDiiChip from "../TroubleCodeChip";
import VehicleChip from "../VehicleChip";

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
  const text = content
    .replace(/\s/g, " ")
    .replaceAll(VehicleLinkRegex, (text, ...groups) => (groups[2] ? `#${groups[2]}` : text));

  let parsed = reactStringReplace(text, MentionRegex, (match, i) => <MentionChip key={i} handle={match} />);
  parsed = reactStringReplace(parsed, EmailRegex, (match) => <GenericLink href={`mailto:${match}`} />);
  parsed = reactStringReplace(parsed, HyperlinkRegex, (match) => <GenericLink href={match} />);
  parsed = reactStringReplace(parsed, VinRegex, (match) => <VehicleChip vin={match.replace("#", "")} />);
  parsed = reactStringReplace(parsed, OBDiiRegex, (match) => <OBDiiChip code={match} />);

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
