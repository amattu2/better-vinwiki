import React, { FC } from "react";
import { Typography } from "@mui/material";
import reactStringReplace from "react-string-replace";
import MentionChip from "../../MentionChip";

type Props = {
  content: string;
  padding?: string;
};

/**
 * A generic text/body display for Feed Post or Comment
 * parsing for @mentions
 *
 * @param {FeedPost} post
 * @returns {JSX.Element}
 */
const GenericText: FC<Props> = ({ content, padding }: Props) => {
  const parsedContent = reactStringReplace(content, new RegExp(/@([\w]+)/g), (match, i) => <MentionChip key={i} handle={match} />);

  return (
    <Typography component={"div"} variant="body2" color="textSecondary" sx={{ mb: 1, padding }}>
      {parsedContent}
    </Typography>
  )
};

export default GenericText;
