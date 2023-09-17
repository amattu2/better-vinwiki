import React, { FC } from "react";
import { Chip, Tooltip, styled } from "@mui/material";
import { Warning } from "@mui/icons-material";
import useTroubleCodeLookup, { LookupStatus } from "../../hooks/useTroubleCodeLookup";

type Props = {
  code: string;
};

const StyledWarning = styled(Warning)({
  fontSize: "16px !important",
});

const StyledContent = styled("span")({
  cursor: "help",
  borderBottom: "1px dashed",
});

/**
 * A OBD-ii Code chip that performs an OBD-ii code description lookup.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const TroubleCodeChip: FC<Props> = ({ code }: Props) => {
  const [status, { description }] = useTroubleCodeLookup(code);

  if (status !== LookupStatus.Success || !description) {
    return <span>{code}</span>;
  }

  return (
    <Tooltip title={description} arrow>
      <Chip
        icon={<StyledWarning />}
        label={<StyledContent>{code}</StyledContent>}
        size="small"
        color="warning"
        data-testid="trouble-code-chip"
      />
    </Tooltip>
  );
};

export default TroubleCodeChip;
