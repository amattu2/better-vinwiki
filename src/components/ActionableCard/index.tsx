import React, { ElementType, FC, Ref, forwardRef } from "react";
import { Card, CardHeader, CardActionArea, styled, CardProps } from "@mui/material";
import { ArrowForwardIos } from "@mui/icons-material";

type Props = {
  title: string;
  subtitle: string;
  disabled?: boolean;
} & CardProps;

const StyledCard = styled(Card)({
  padding: 0,
  margin: 0,
  borderRadius: 0,
  border: "1px solid #ddd",
  borderTop: "unset",
  "&:last-child": {
    borderRadius: "0 0 8px 8px",
  },
});

const StyledCardHeader = styled(CardHeader)<{ component: ElementType, disabled?: boolean }>(({ disabled }) => ({
  [disabled ? "& .MuiCardHeader-content .MuiTypography-root, & .MuiCardHeader-action" : ""]: {
    color: "#ddd !important",
  },
  "& .MuiCardHeader-action": {
    alignSelf: "center",
  },
}));

const ActionableCard: FC<Props> = forwardRef(({ title, subtitle, disabled, ...cardProps }: Props, ref: Ref<HTMLDivElement>) => (
  <StyledCard elevation={0} ref={ref} {...cardProps}>
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
