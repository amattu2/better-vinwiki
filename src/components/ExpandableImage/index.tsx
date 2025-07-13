import React, { FC, useState } from "react";
import { Box, Modal, styled } from "@mui/material";
import { AspectRatio } from "@mui/icons-material";
import useProgressiveQuality from "../../hooks/useProgressiveQuality";

type Props = {
  lowRes: string;
  highRes?: string;
  alt: string;
};

const StyledImageBox = styled(Box)(({ theme }) => ({
  height: "100%",
  width: "100%",
  overflow: "hidden",
  position: "relative",
  background: theme.palette.divider,
  cursor: "pointer",
  "&:hover .expand-button": {
    opacity: 1,
  },
}));

const StyledImage = styled("img", {
  shouldForwardProp: (p) => p !== "blur",
})(({ blur }: { blur?: boolean }) => ({
  filter: blur ? "blur(6px)" : "none",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "filter 0.3s ease-out",
  "&:hover": {
    filter: "brightness(0.8)",
  },
}));

const StyledButton = styled("div")({
  position: "absolute",
  right: "8px",
  top: "8px",
  color: "#fff",
  opacity: 0,
  transition: "opacity 0.3s ease-out",
  zIndex: 2,
});

const StyledExpandedBox = styled(Box)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
});

const StyledExpandedImage = styled("img")({
  maxHeight: "80vh",
  maxWidth: "80vw",
  borderRadius: "8px",
});

/**
 * A general use image component with progressive quality loading and an expandable modal.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
export const ExpandableImage: FC<Props> = ({ lowRes, highRes, alt }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [src, { blur }] = useProgressiveQuality(lowRes, highRes || lowRes);

  return (
    <>
      <StyledImageBox className="image-box" onClick={() => setExpanded(true)}>
        <StyledImage src={src} alt={alt} blur={blur} />
        <StyledButton className="expand-button">
          <AspectRatio />
        </StyledButton>
      </StyledImageBox>
      <Modal open={expanded} onClose={() => setExpanded(false)}>
        <StyledExpandedBox>
          <StyledExpandedImage src={src} alt={alt} />
        </StyledExpandedBox>
      </Modal>
    </>
  );
};

export default ExpandableImage;
