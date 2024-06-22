import React, { FC } from "react";
import { Tooltip, Typography, TypographyProps, styled } from "@mui/material";
import { formatDate, formatDateTime } from "../../../utils/date";
import { showEventDate } from "../../../utils/feed";

type Props = {
  post: FeedPost;
} & TypographyProps;

const StyledPostDate = styled("span")({
  borderBottom: "1px dashed",
  cursor: "help",
});

const PostTime: FC<{ showEventDate: boolean } & Pick<FeedPost, "post_date" | "event_date">> = ({
  showEventDate,
  post_date,
  event_date,
}) => {
  const postDate = formatDateTime(new Date(post_date));

  if (!showEventDate) {
    return <span data-testid="metadata-post-date">{postDate}</span>;
  }

  return (
    <Tooltip title={`Event date ${formatDate(new Date(event_date))}`} arrow>
      <StyledPostDate data-testid="metadata-post-date">{postDate}</StyledPostDate>
    </Tooltip>
  );
};

/**
 * A representation of a Feed Post Metadata
 *
 * @param {FeedPost} post
 * @returns {JSX.Element}
 */
const PostMeta: FC<Props> = ({ post, ...typographyProps }: Props) => {
  const { post_date, event_date, locale, client } = post;
  const showEvent = showEventDate(post);

  return (
    <Typography
      variant="body2"
      color="textSecondary"
      fontSize={12}
      fontWeight={600}
      {...typographyProps}
    >
      <PostTime post_date={post_date} event_date={event_date} showEventDate={showEvent} />
      {locale && (
        <>
          {" • "}
          <span data-testid="metadata-post-locale">{locale}</span>
        </>
      )}
      {client && !["web", "vinbot"].includes(client) && (
        <>
          {" • "}
          <span data-testid="metadata-post-client">{client}</span>
        </>
      )}
    </Typography>
  );
};

export default PostMeta;
