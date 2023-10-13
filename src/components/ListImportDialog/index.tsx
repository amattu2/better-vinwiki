import React, { FC, useEffect, useId, useRef, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, Stack, Tooltip, styled,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import { Restore } from '@mui/icons-material';
import { csvToObject } from '../../utils/objectToCSV';
import GenericSpreadsheet, { ValueBase } from '../GenericSpreadsheet';

type Props = {
  onConfirm: (selection: Vehicle["vin"]) => void;
  onClose: () => void;
};

const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    overflowX: "hidden",
  },
});

const StyledDialogContent = styled(DialogContent)({
  backgroundColor: "#f4f7fa",
});

const StyledDropzone = styled(Box)({
  width: "100%",
  height: "150px",
  border: "2px dashed",
  borderRadius: "8px",
  position: "relative",
  transition: "color 0.2s ease-out",
  color: "rgba(0, 0, 0, 0.38)",
  cursor: "pointer",
  "&:after": {
    content: "'Drop a CSV here or click to find one'",
    color: "rgba(0, 0, 0, 0.38)",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "14px",
  },
  "&:hover": {
    color: "#3b3b3b",
  },
});

const StyledInput = styled("input")({
  display: "none",
});

/**
 * A List CSV Import Dialog
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const ListImportDialog: FC<Props> = ({ onConfirm, onClose }: Props) => {
  const id = useId();
  const { register, handleSubmit, watch, resetField, setValue } = useForm<{ file: FileList }>();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ValueBase[]>([]);
  const inputRef = useRef<HTMLInputElement>();

  const { ref, ...fileRest } = register("file", { required: false });
  const fileUpload = watch("file");

  const clearData = () => {
    resetField("file");
    setData([]);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer?.files?.length) { return; }

    e.preventDefault();
    e.stopPropagation();
    setValue("file", e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (fileUpload?.[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        console.log(csvToObject(reader.result as string, true));
        setData(csvToObject(reader.result as string, true) as ValueBase[]);
      };
      reader.readAsText(fileUpload[0]);
    }
  }, [fileUpload]);

  return (
    <StyledDialog maxWidth={!data?.length ? "sm" : "md"} open onClose={onClose} fullWidth>
      <DialogTitle component={Stack} direction="row" alignItems="center">
        Import Vehicles
      </DialogTitle>
      <StyledDialogContent sx={{ p: data?.length ? "0 !important" : undefined }} dividers={!data?.length}>
        {!data.length ? (
          <form id={id}>
            <StyledDropzone
              onClick={handleClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            />
            <StyledInput
              {...fileRest}
              accept="text/csv"
              type="file"
              hidden
              ref={(node) => {
                if (!node) { return; }

                inputRef.current = node;
                ref(node);
              }}
            />
          </form>
        ) : (
          <GenericSpreadsheet data={data} />
        )}
      </StyledDialogContent>
      <DialogActions>
        <Tooltip title="Clear upload" arrow>
          <IconButton onClick={clearData} sx={{ mr: "auto" }} disabled={!data.length}>
            <Restore />
          </IconButton>
        </Tooltip>
        <Button onClick={onClose} color="error">Cancel</Button>
        <LoadingButton type="submit" form={id} loading={saving}>Import</LoadingButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default ListImportDialog;
