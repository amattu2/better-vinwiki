import React, { FC } from 'react';
import {
  Button,
  Card,
  Paper,
  Stack,
  Typography,
  styled,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { prettySubstring } from '../../utils/text';

type Props = {
  post: BlogPost;
};

const StyledCard = styled(Card)({
  borderRadius: "8px",
  backgroundColor: "transparent",
  marginBottom: "16px",
  maxWidth: "450px",
  cursor: "pointer",
  overflow: "visible",
});

const StyledImageBox = styled(Paper)({
  height: "175px",
  width: "175px",
  overflow: "hidden",
  borderRadius: "8px",
  position: "relative",
  background: "#ddd",
  flexShrink: 0,
  marginLeft: "-35px !important",
  "&:hover .expand-button": {
    opacity: 1,
  },
});

const StyledBackground = styled("div", {
  shouldForwardProp: (p) => p !== "bg" && p !== "blur"
})(({ bg, blur }: { bg?: string, blur?: boolean }) => ({
  backgroundImage: `url(${bg})`,
  filter: blur ? "blur(6px)" : "none",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
  transition: "filter 0.3s ease-out",
}));

const TopPost: FC<Props> = ({ post }: Props) => {
  return (
    <StyledCard raised>
      <Stack direction="row" spacing={2} sx={{ padding: "16px" }} alignItems="center">
        <StyledImageBox elevation={3}>
          <StyledBackground bg={post.image} blur />
        </StyledImageBox>
        <Stack direction="column" spacing={1} sx={{ py: 1.5}}>
          <Typography variant="caption" component="p" color="textSecondary">
            A blog post you might like
          </Typography>
          <Typography variant="subtitle1" component="h2" fontWeight={600}>
            {post.title}
          </Typography>
          <Typography variant="body2" component="p" fontSize={13}>
            {prettySubstring(post.body, 80)}
          </Typography>
          <Link to={post.link} target='_blank'>
            <Button>Read More</Button>
          </Link>
        </Stack>
      </Stack>
    </StyledCard>
  );
};

export default TopPost;
