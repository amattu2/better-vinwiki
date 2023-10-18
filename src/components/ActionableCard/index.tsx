import React, { ElementType, FC, Ref, forwardRef } from "react";
import { Card, CardHeader, CardActionArea, styled, CardProps, Theme } from "@mui/material";
import { ArrowForwardIos } from "@mui/icons-material";

type Props = {
  title: string;
  subtitle: string;
  disabled?: boolean;
} & CardProps;

const StyledCard = styled(Card)(({ theme }) => ({
  padding: 0,
  margin: 0,
  borderRadius: 0,
  border: `1px solid ${theme.palette.divider}`,
  borderRight: "unset",
  borderTop: "unset",
  "&:last-child": {
    borderRadius: "0 0 8px 8px",
  },
}));

const StyledCardHeader = styled(CardHeader)<{ component: ElementType; disabled?: boolean; theme?: Theme }>(({ disabled, theme }) => ({
  [disabled ? "& .MuiCardHeader-content .MuiTypography-root, & .MuiCardHeader-action" : ""]: {
    color: `${theme.palette.text.disabled} !important`,
  },
  "& .MuiCardHeader-action": {
    alignSelf: "center",
  },
}));

const ActionableCard: FC<Props> = forwardRef(({ title, subtitle, disabled, ...cardProps }: Props, ref: Ref<HTMLDivElement>) => (
  <StyledCard
    elevation={0}
    ref={ref}
    {...cardProps}
    onClick={cardProps?.onClick && !disabled ? cardProps.onClick : undefined}
  >
    <StyledCardHeader
      component={CardActionArea}
      title={title}
      titleTypographyProps={{ fontSize: 16, variant: "h6" }}
      subheader={subtitle}
      subheaderTypographyProps={{ variant: "body2", fontSize: 12 }}
      action={(<ArrowForwardIos />)}
      disabled={disabled}
    />
  </StyledCard>
));

export default ActionableCard;
