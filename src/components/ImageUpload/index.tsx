import React, { FC, useRef } from "react";
import { Box, Paper, Stack, styled } from "@mui/material";
import { Delete } from "@mui/icons-material";

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  InputProps: any;
  preview?: string;
  onPreviewClick?: () => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
};

const StyledDropzone = styled(Box)(({ theme }) => ({
  width: "100%",
  height: "150px",
  border: "2px dashed",
  borderRadius: "8px",
  position: "relative",
  transition: "color 0.2s ease-out",
  color: theme.palette.action.disabled,
  cursor: "pointer",
  "&:after": {
    content: "'Drop an image here or click to find one'",
    color: theme.palette.action.disabled,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "14px",
  },
  "&:hover": {
    color: theme.palette.action.hover,
  },
}));

const StyledInput = styled("input")({
  display: "none",
});

const StyledImageBox = styled(Paper)(({ theme }) => ({
  height: "175px",
  width: "100%",
  margin: "0 auto",
  marginTop: "12px",
  overflow: "hidden",
  borderRadius: "8px",
  position: "relative",
  background: theme.palette.divider,
  cursor: "pointer",
  "&:hover .image-delete": {
    opacity: 1,
  },
  "&:hover .image-preview": {
    filter: "blur(2px) brightness(0.6)",
  },
}));

const StyledBackground = styled("div", { shouldForwardProp: (p) => p !== "bg" && p !== "blur" })(({ bg, blur }: { bg?: string, blur?: boolean }) => ({
  backgroundImage: `url(${bg})`,
  filter: blur ? "blur(6px)" : "none",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "contain",
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
  transition: "filter 0.2s ease-out",
}));

const StyledDeleteIcon = styled(Delete)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 2,
  color: "#fff",
  opacity: 0,
});

/**
 * Image upload component with drag and drop support.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
export const ImageUpload: FC<Props> = ({ InputProps, preview, onDrop, onPreviewClick }: Props) => {
  const inputRef = useRef<HTMLInputElement>();

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer?.files?.length) { return; }

    e.preventDefault();
    e.stopPropagation();
    onDrop?.(e);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Stack direction="column">
      {preview ? (
        <StyledImageBox elevation={3} onClick={onPreviewClick}>
          <StyledBackground bg={preview} className="image-preview" />
          <StyledDeleteIcon className="image-delete" />
        </StyledImageBox>
      ) : (
        <StyledDropzone
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        />
      )}
      <StyledInput
        {...InputProps}
        accept="image/*"
        type="file"
        hidden
        ref={(node) => {
          if (!node) { return; }

          inputRef.current = node;
          InputProps?.ref?.(node);
        }}
      />
    </Stack>
  );
};

export default ImageUpload;
