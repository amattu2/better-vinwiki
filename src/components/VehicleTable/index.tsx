import React, { FC, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Paper, Skeleton, Table, TableBody,
  TableCell, TableContainer, TableHead,
  TablePagination, TableRow, TableSortLabel,
  styled,
} from "@mui/material";
import Repeater from "../Repeater";

type Props = {
  status: "loading" | "success" | "error";
  vehicles: Vehicle[];
  EmptyComponent?: React.FC;
};

type T = Vehicle;

type Column = {
  label: string;
  value: (a: T) => string | boolean | number | React.ReactNode;
  default?: true;
  comparator?: (a: T, b: T) => number;
};

const StyledVehicleImg = styled("img")({
  borderRadius: "8px",
  width: "75px",
  height: "75px",
});

const TableCellSkeleton: FC = () => (
  <TableCell>
    <Skeleton variant="text" animation="wave" />
  </TableCell>
);

const ResultSkeleton: FC<{ colCount?: number }> = ({ colCount = 6 }: { colCount?: number }) => (
  <TableRow>
    <TableCell>
      <Skeleton variant="rectangular" width={75} height={75} animation="wave" />
    </TableCell>
    <Repeater count={colCount} Component={TableCellSkeleton} />
  </TableRow>
);

const columns: Column[] = [
  {
    label: "Preview",
    value: ({ icon_photo, long_name }) => (
      <StyledVehicleImg src={icon_photo} alt={`${long_name} preview`} />
    ),
  },
  {
    label: "Year",
    value: (v) => v.year,
    comparator: (a: T, b: T) => parseInt(a.year, 10) - parseInt(b.year, 10),
  },
  {
    label: "Make",
    value: (v) => v.make,
    comparator: (a: T, b: T) => a.make.localeCompare(b.make),
  },
  {
    label: "Model",
    value: (v) => v.model,
    comparator: (a: T, b: T) => a.model.localeCompare(b.model),
  },
  {
    label: "Trim",
    value: (v) => v.trim || "-",
    comparator: (a: T, b: T) => a.trim?.localeCompare(b?.trim),
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
export const VehicleTable: FC<Props> = ({ status, vehicles, EmptyComponent }: Props) => {
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<Column>(columns[1]);
  const [page, setPage] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(20);
  const [count, setCount] = useState<number>(0);

  const handleRequestSort = (column: Column) => {
    setOrder(orderBy === column && order === "asc" ? "desc" : "asc");
    setOrderBy(column);
    setPage(0);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const dataset: T[] = useMemo(() => {
    if (!vehicles?.length || status !== "success") {
      setCount(0);
      return [];
    }

    const sorted = vehicles.sort((a, b) => orderBy?.comparator?.(a, b) || 0);

    if (order === "desc") {
      sorted.reverse();
    }

    setCount(sorted.length);
    return sorted.slice(page * perPage, (page * perPage) + perPage);
  }, [vehicles, perPage, page, orderBy, order]);

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col: Column) => (
                <TableCell key={col.label}>
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
                </TableCell>
              ))}
              <TableCell>Options</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(status === "success" && vehicles.length === 0) && (
              <TableRow>
                <TableCell colSpan={columns.length + 2} sx={{ textAlign: "center" }}>
                  {EmptyComponent ? <EmptyComponent /> : "No results found"}
                </TableCell>
              </TableRow>
            )}
            {dataset.map((d: T) => (
              <TableRow tabIndex={-1} hover key={`${d["vin"]}`}>
                {columns.map((col: Column) => (
                  <TableCell key={`${d["vin"]}_${col.label}`}>
                    {col.value(d)}
                  </TableCell>
                ))}
                <TableCell>
                  <Link to={`/vehicle/${d["vin"]}`}>
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {/* TODO: Use dynamic colCount */}
            {(status === "loading") && (<Repeater count={5} Component={ResultSkeleton} />)}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 20, 50]}
        component="div"
        count={count}
        rowsPerPage={perPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={handleChangeRowsPerPage}
        nextIconButtonProps={{
          disabled:
            perPage === -1
            || !dataset
            || dataset.length === 0
            || count <= (page + 1) * perPage
            || status === "loading",
        }}
        backIconButtonProps={{ disabled: page === 0 || status === "loading" }}
      />
    </Paper>
  );
};

export default VehicleTable;
