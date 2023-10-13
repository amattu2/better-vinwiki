import React, { useMemo } from 'react';
import Spreadsheet, { CellBase, EntireColumnsSelection, EntireRowsSelection, Matrix, Selection } from "react-spreadsheet";
import { cloneDeep } from 'lodash';

export type ValueBase = {
  [key: string]: string | number | boolean | null | undefined;
};

export type Props<T extends ValueBase> = {
  /**
   * The data to display
   */
  data: T[];
  /**
   * The element keys to access the objects in `T`
   *
   * @default The keys of `data[0]`
   */
  columnKeys?: string[];
  /**
   * The column labels to show
   *
   * @default `columnKeys`
   */
  columnLabels?: string[];
  /**
   * The row labels to show
   *
   * @default The index of `data[i]`
   */
  rowLabels?: string[];
  /**
   * Disables editing for all cells
   *
   * @default false
   */
  readOnly?: boolean;
  /**
   * A callback wrapper which returns useful information
   * about the selection
   *
   * @param values the dataset values selected without the headers
   * @param selection the raw selection object
   * @returns {void}
   */
  onSelect?: (values: unknown[], selection: Selection) => void;
};

/**
 * A generic `<Spreadsheet>` wrapper with helper utils
 *
 * @param {Props}
 * @returns {JSX.Element}
 */
const GenericSpreadsheet = <T extends ValueBase>({
  data, columnKeys, columnLabels, rowLabels, readOnly,
  onSelect,
}: Props<T>) => {
  const colKeys: string[] = useMemo(() => {
    if (columnKeys) {
      return columnKeys;
    }

    return Object.keys(data[0]);
  }, [data, columnKeys]);

  const colLabs: string[] = useMemo(() => {
    if (columnLabels && columnLabels.length === colKeys.length) {
      return columnLabels;
    }

    return colKeys;
  }, [columnLabels, colKeys]);

  const rowLabs: string[] = useMemo(() => {
    if (rowLabels && rowLabels.length === data.length) {
      return rowLabels;
    }

    return Array.from({ length: data.length }, (_, idx) => idx.toString());
  }, [rowLabels, data.length]);

  const dataset: Matrix<CellBase> = useMemo(() => {
    if (!data) {
      return [];
    }

    return cloneDeep<T[]>(data)
      .map((dataObject: ValueBase) => colKeys.map((k) => dataObject[k]))
      .map((objectValues) => objectValues.map((value) => ({ readOnly, value })));
  }, [data, colKeys]);

  const onSelectWrapper = (selection: Selection) => {
    if (selection instanceof EntireColumnsSelection && selection.start === selection.end) {
      return onSelect?.(dataset.map((v) => Object.values(v)[selection.start]?.value).filter((v) => !!v), selection);
    }
    if (selection instanceof EntireRowsSelection && selection.start === selection.end) {
      return onSelect?.(dataset[selection.start].map((v) => v?.value).filter((v) => !!v), selection);
    }

    // No selection or Empty Selection
    return onSelect?.([], selection);
  };

  return (
    <Spreadsheet
      data={dataset}
      rowLabels={rowLabs}
      columnLabels={colLabs}
      onSelect={onSelectWrapper}
    />
  );
};

export default GenericSpreadsheet;
