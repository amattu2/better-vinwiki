import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import {
  Paper, Skeleton, Table, TableBody,
  TableCell, TableContainer, TableHead,
  TablePagination, TableRow, TableSortLabel,
  Box, Toolbar, styled, alpha, Typography, Checkbox,
  Theme, Tooltip, IconButton, Stack,
} from "@mui/material";
import { Delete, SaveOutlined } from "@mui/icons-material";
import numeral from "numeral";
import Repeater from "../Repeater";
import { ExpandableImage } from "../ExpandableImage";
import { StyledLink } from "../StyledLink";

type Props = {
  status: "loading" | "loading_more" | "success" | "error";
  vehicles: Vehicle[];
  /**
   * The total number of vehicles in the list
   * Required for server pagination.
   *
   * @default vehicles.length
   */
  totalCount?: number;
  /**
   * A component to render when there are no vehicles in the list
   */
  EmptyComponent?: React.FC;
  /**
   * The options for the rows per page dropdown
   */
  rowPerPageOptions?: number[];
  /**
   * The number of vehicles to show per page
   * Must be in `rowPerPageOptions`
   *
   * @default 20
   */
  rowsPerPage?: number;
  /**
   * A callback to be called when the page changes
   *
   * @param {number} page The new page number
   * @param {number} remainingCount The number of vehicles remaining based on `vehicles.length`
   * @returns {void}
   */
  onPageChange?: (page: number, remainingCount: number) => void;
  /**
   * Callback function to be called when the delete button is clicked
   * If not provided, the delete button will not be shown
   *
   * @description This will enable the checkbox column
   * @param {Vehicle[]} vehicles The vehicles selected
   */
  onDelete?: (vehicles: Vehicle[]) => void;
  /**
   * Callback function to be called when the export button is clicked
   * If not provided, the export button will not be shown
   *
   * @description This will enable the checkbox column
   * @param {Vehicle[]} vehicles The vehicles selected
   */
  onExport?: (vehicles: Vehicle[]) => void;
};

type T = Vehicle;

type Column = {
  label: string;
  value: (a: T) => string | boolean | number | React.ReactNode;
  default?: true;
  comparator?: (a: T, b: T) => number;
};

const StyledImageBox = styled(Box)({
  borderRadius: "8px",
  width: "75px",
  height: "75px",
  overflow: "hidden",
});

const StyledToolbar = styled(Toolbar, { shouldForwardProp: (p) => p !== "showCheckboxes" && p !== "hasSelected" })(({ theme, showCheckboxes, hasSelected }: { theme?: Theme, showCheckboxes: boolean, hasSelected: boolean }) => ({
  display: !showCheckboxes ? "none" : "flex",
  paddingRight: 1,
  backgroundColor: hasSelected && theme ? alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity) : "",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const ToolbarTitle: FC<{ numSelected: number }> = ({ numSelected }) => (
  numSelected > 0 ? (
    <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
      {`${numeral(numSelected).format("0,0")} selected`}
    </Typography>
  ) : (
    <Typography sx={{ flex: '1 1 100%' }} variant="h6" component="div">
      Vehicles
    </Typography>
  )
);

const TableCellSkeleton: FC = () => (
  <StyledTableCell>
    <Skeleton variant="text" animation="wave" />
  </StyledTableCell>
);

const ResultSkeleton: FC<{ hasCheckbox?: boolean }> = ({ hasCheckbox }: { hasCheckbox?: boolean }) => (
  <TableRow>
    {hasCheckbox && (
      <StyledTableCell padding="checkbox">
        <Skeleton variant="rectangular" width={18} height={18} animation="wave" sx={{ borderRadius: "2px", margin: "0 auto" }} />
      </StyledTableCell>
    )}
    <StyledTableCell>
      <Skeleton variant="rectangular" width={75} height={75} animation="wave" sx={{ borderRadius: "8px" }} />
    </StyledTableCell>
    <Repeater count={6} Component={TableCellSkeleton} />
  </TableRow>
);

const columns: Column[] = [
  {
    label: "Preview",
    value: ({ vin, icon_photo }) => (
      <StyledImageBox>
        <ExpandableImage lowRes={icon_photo} alt={vin} />
      </StyledImageBox>
    ),
  },
  {
    label: "Year",
    value: (v) => v.year || "-",
    comparator: (a: T, b: T) => parseInt(a?.year || "", 10) - parseInt(b?.year || "", 10),
  },
  {
    label: "Make",
    value: (v) => v.make || "-",
    comparator: (a: T, b: T) => (a?.make || "").localeCompare(b?.make || ""),
  },
  {
    label: "Model",
    value: (v) => v.model || "-",
    comparator: (a: T, b: T) => (a?.model || "").localeCompare(b?.model || ""),
  },
  {
    label: "Trim",
    value: (v) => v.trim || "-",
    comparator: (a: T, b: T) => (a?.trim || "").localeCompare(b?.trim || ""),
  },
  {
    label: "VIN",
    value: (v) => v.vin,
    comparator: (a: T, b: T) => a.vin.localeCompare(b.vin),
  },
];

/**
 * A table of vehicles with basic support for sorting and pagination
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
export const VehicleTable: FC<Props> = ({
  status, vehicles, totalCount, EmptyComponent, rowPerPageOptions = [5, 10, 20, 50, 100], rowsPerPage = 20,
  onPageChange, onDelete, onExport,
}: Props) => {
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<Column>(columns[1]);
  const [page, setPage] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(rowsPerPage);
  const [selected, setSelected] = useState<readonly T["vin"][]>([]);
  const lastPageRef = useRef<number>(0);

  const showCheckboxes = !!onDelete || !!onExport;

  const dataset: T[] = useMemo(() => {
    if (!vehicles?.length || status === "loading") {
      return [];
    }

    const sorted = vehicles.sort((a, b) => orderBy?.comparator?.(a, b) || 0);
    if (order === "desc") {
      sorted.reverse();
    }

    return sorted.slice(page * perPage, (page * perPage) + perPage);
  }, [vehicles, perPage, page, orderBy, order]);

  const count: number = useMemo(() => {
    if (totalCount) {
      return totalCount;
    }

    return vehicles?.length;
  }, [vehicles, totalCount]);

  const repeaterCount: number = useMemo(() => {
    if (status === "loading_more") {
      const availableCount = perPage - dataset.length;
      return availableCount <= 5 ? 5 : availableCount;
    }

    return 5;
  }, [status, perPage, dataset.length]);

  const handleRequestSort = (column: Column) => {
    setOrder(orderBy === column && order === "asc" ? "desc" : "asc");
    setOrderBy(column);
    setPage(0);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectClick = (vin: T["vin"]) => {
    if (selected.includes(vin)) {
      setSelected(selected.filter((v) => v !== vin));
    } else {
      setSelected([...selected, vin]);
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = dataset.map((n) => n.vin);
      setSelected(newSelecteds);
      return;
    }

    setSelected([]);
  };

  const onDeleteWrapper = () => {
    setSelected([]);
    const selectedVehicles: T[] = dataset.filter((v: T) => selected.includes(v.vin));
    onDelete?.(selectedVehicles);
  };

  const onExportWrapper = () => {
    setSelected([]);
    const selectedVehicles: T[] = dataset.filter((v: T) => selected.includes(v.vin));
    onExport?.(selectedVehicles);
  };

  useEffect(() => {
    if (lastPageRef.current !== page) {
      setSelected([]);
      onPageChange?.(page, vehicles.length - ((page + 1) * perPage));
      lastPageRef.current = page;
    }
  }, [page]);

  return (
    <Paper elevation={0}>
      <StyledToolbar hasSelected={selected.length > 0} showCheckboxes={showCheckboxes}>
        <ToolbarTitle numSelected={selected.length} />
        <Stack direction="row" alignItems="center" sx={{ visibility: selected.length <= 0 ? "hidden" : "visible" }}>
          <Tooltip title="Export to CSV" sx={{ display: !onExport ? "none" : "initial" }} arrow>
            <IconButton onClick={onExportWrapper}>
              <SaveOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove from list" sx={{ display: !onDelete ? "none" : "initial" }} arrow>
            <IconButton onClick={onDeleteWrapper}>
              <Delete />
            </IconButton>
          </Tooltip>
        </Stack>
      </StyledToolbar>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {showCheckboxes && (
                <StyledTableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < dataset.length}
                    checked={dataset.length > 0 && selected.length === dataset.length}
                    onChange={handleSelectAll}
                  />
                </StyledTableCell>
              )}
              {columns.map((col: Column) => (
                <StyledTableCell key={col.label}>
                  {col.comparator ? (
                    <TableSortLabel
                      active={orderBy === col}
                      direction={orderBy === col ? order : "asc"}
                      onClick={() => handleRequestSort(col)}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </StyledTableCell>
              ))}
              <StyledTableCell>Options</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(status !== "loading" && vehicles.length === 0) && (
              <TableRow>
                <StyledTableCell colSpan={columns.length + 2 + (showCheckboxes ? 1 : 0)} sx={{ textAlign: "center" }}>
                  {EmptyComponent ? <EmptyComponent /> : "No results found"}
                </StyledTableCell>
              </TableRow>
            )}
            {(status !== "loading" && vehicles.length > 0) && dataset.map((d: T) => (
              <TableRow key={`${d["vin"]}`} selected={selected.includes(d.vin)} tabIndex={-1} hover>
                {showCheckboxes && (
                  <StyledTableCell padding="checkbox">
                    <Checkbox color="primary" checked={selected.includes(d.vin)} onClick={() => handleSelectClick(d.vin)} />
                  </StyledTableCell>
                )}
                {columns.map((col: Column) => (
                  <StyledTableCell key={`${d["vin"]}_${col.label}`}>
                    {col.value(d)}
                  </StyledTableCell>
                ))}
                <StyledTableCell>
                  <StyledLink to={`/vehicle/${d["vin"]}`}>
                    View
                  </StyledLink>
                </StyledTableCell>
              </TableRow>
            ))}
            {(status === "loading" || (status === "loading_more" && dataset.length < perPage)) && (
              // eslint-disable-next-line react/no-unstable-nested-components
              <Repeater count={repeaterCount} Component={() => <ResultSkeleton hasCheckbox={showCheckboxes} />} />
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={rowPerPageOptions}
        component="div"
        count={count}
        rowsPerPage={perPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={handleChangeRowsPerPage}
        nextIconButtonProps={{
          disabled: !dataset
            || count === 0
            || (count !== -1 && count <= (page + 1) * perPage)
            || (dataset.length < perPage && status === "loading_more")
            || status === "loading",
        }}
        backIconButtonProps={{ disabled: page === 0 || status === "loading" }}
      />
    </Paper>
  );
};

export default VehicleTable;
