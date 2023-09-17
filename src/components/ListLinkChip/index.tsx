import React, { FC } from "react";
import { Link } from "react-router-dom";
import { ListAlt } from "@mui/icons-material";
import { Chip } from "@mui/material";
import useListLookup, { LookupStatus } from "../../hooks/useListLookup";

type Props = {
  uuid: string;
};

/**
 * A List Link chip that embeds a List Chip if it exists.
 * Otherwise, it just returns a localized link to the list page
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const ListLinkChip: FC<Props> = ({ uuid }: Props) => {
  const [status, { name }] = useListLookup(uuid);

  if (status !== LookupStatus.Success || !name) {
    return (
      <Link to={`/list/${uuid}`}>
        {`${window.origin}/list/${uuid}`}
      </Link>
    );
  }

  return (
    <Chip
      component={Link}
      icon={<ListAlt />}
      label={name}
      to={`/list/${uuid}`}
      size="small"
      data-testid="list-chip"
    />
  );
};

export default ListLinkChip;
