import React, { FC, useEffect, useRef, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent,
  DialogTitle, Stack, Step, StepLabel, Stepper, styled,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { parse } from 'papaparse';
import { LoadingButton } from '@mui/lab';
import GenericSpreadsheet, { ValueBase } from '../GenericSpreadsheet';

type Props = {
  onConfirm: (selection: Vehicle["vin"][]) => void;
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
  const { register, watch, setValue } = useForm<{ file: FileList }>();
  const [saving, setSaving] = useState<boolean>(false);
  const [data, setData] = useState<ValueBase[]>([]);
  const [step, setStep] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>();

  const { ref, ...fileRest } = register("file", { required: false });
  const fileUpload = watch("file");

  const onConfirmWrapper = async () => {
    setSaving(true);
    await onConfirm([]);
    setSaving(false);
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
      parse(fileUpload[0], {
        header: true, // TODO: configurable by user
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results) => setData(results.data as ValueBase[]),
      });
      setStep(1);
    }
  }, [fileUpload]);

  return (
    <StyledDialog maxWidth="sm" onClose={onClose} fullWidth open>
      <DialogTitle component={Stack} direction="row" alignItems="center">
        Import CSV
      </DialogTitle>
      <StyledDialogContent dividers>
        <Stepper activeStep={step} alternativeLabel>
          <Step>
            <StepLabel>File Upload</StepLabel>
          </Step>
          <Step>
            <StepLabel>Preview</StepLabel>
          </Step>
          <Step>
            <StepLabel>VIN Selection</StepLabel>
          </Step>
          <Step>
            <StepLabel>Import</StepLabel>
          </Step>
        </Stepper>
        <Box sx={{ mt: 4 }}>
          <Box component="form" sx={{ display: step !== 0 ? "none" : undefined }}>
            <StyledDropzone
              onClick={handleClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            />
            {/* TODO: header first row checkbox */}
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
          </Box>
          <Box sx={{ display: step !== 1 ? "none" : undefined, maxWidth: "100%", overflow: "auto", borderRadius: "8px" }}>
            <GenericSpreadsheet data={data || []} />
          </Box>
        </Box>
      </StyledDialogContent>
      <DialogActions>
        <Button onClick={onClose} color="error">Cancel</Button>
        <LoadingButton type="submit" onClick={onConfirmWrapper} loading={saving} disabled>Import</LoadingButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default ListImportDialog;
