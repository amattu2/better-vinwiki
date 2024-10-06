import { FC, memo, useState } from "react";
import { Box, CircularProgress, Theme, Typography, styled } from "@mui/material";
import { isEqual } from "lodash";
import { useTimeout } from "usehooks-ts";

const StyledWrapperBox = styled(Box, {
  shouldForwardProp: (p) => p !== "fullscreen",
})(({ fullscreen, theme }: { fullscreen: boolean; theme?: Theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: !fullscreen ? "absolute" : "fixed",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  background: theme?.palette.background.default || "#fff",
}));

const StyledInnerContainer = styled(Box)({
  textAlign: "center",
});

const StyledIcon = styled(CircularProgress)(({ theme }: { theme?: Theme }) => ({
  color: theme?.palette.text.primary,
}));

const StyledDelayText = styled(Typography, { shouldForwardProp: (p) => p !== "visible" })(
  ({ theme, visible }: { visible: boolean; theme?: Theme }) => ({
    color: theme?.palette.text.primary,
    visibility: visible ? "visible" : "hidden",
    fontSize: "14px",
    height: "21px",
    marginBottom: "-21px",
  })
);

export type LoaderProps = {
  /**
   * Optional specification for whether to render as fullscreen (fixed)
   * or within the container (absolute).
   *
   * @default true
   */
  fullscreen?: boolean;
  /**
   * Optional adornment text to show when the loader is visible for
   * longer than expected.
   *
   * @default false
   */
  showDelayText?: boolean;
  /**
   * Optional specification for how long to wait before showing the
   * loader adornment (in milliseconds)
   *
   * @default 2000
   */
  delayTextTimeout?: number;
};

const Loader: FC<LoaderProps> = ({
  fullscreen = true,
  showDelayText = false,
  delayTextTimeout = 2000,
}: LoaderProps) => {
  const [delayVisible, setDelayVisible] = useState<boolean>(false);

  const setVisible = () => showDelayText && setDelayVisible(true);

  useTimeout(setVisible, delayTextTimeout);

  return (
    <StyledWrapperBox fullscreen={fullscreen} data-testid="loader-wrapper">
      <StyledInnerContainer>
        <StyledIcon data-testid="loader-icon" />
        <StyledDelayText variant="body1" data-testid="loader-delay-text" visible={delayVisible}>
          This is taking longer than expected...
        </StyledDelayText>
      </StyledInnerContainer>
    </StyledWrapperBox>
  );
};

export default memo<LoaderProps>(Loader, isEqual);
