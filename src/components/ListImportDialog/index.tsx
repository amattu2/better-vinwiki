import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import {
  Box, Button, Checkbox, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControlLabel, FormHelperText, MenuItem,
  Stack, Step, StepLabel, Stepper, TextField,
  styled,
} from '@mui/material';
import { isValidVin } from '@shaggytools/nhtsa-api-wrapper';
import { cloneDeep } from 'lodash';
import { parse } from 'papaparse';
import GenericSpreadsheet, { ValueBase } from '../GenericSpreadsheet';
import { StatisticItem } from '../StatisticItem';

type Props = {
  onConfirm: (selection: Vehicle["vin"][]) => void;
  onClose: () => void;
};

type FormInput = {
  file: FileList;
  fileHeader: boolean;
  vinColumn: string;
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

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

const StyledFormHelperText = styled(FormHelperText)({
  textAlign: "right",
  marginLeft: "auto !important",
  marginRight: "0 !important",
});

const StyledTextField = styled(TextField)({
  "& .MuiInputBase-root": {
    backgroundColor: "#fff",
  },
  "& .MuiFormHelperText-root": {
    textAlign: "right !important",
    marginLeft: "auto !important",
    marginRight: "0 !important",
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
  const { register, watch, setValue, reset, control } = useForm<FormInput>();
  const [saving, setSaving] = useState<boolean>(false);
  const [data, setData] = useState<ValueBase[]>([]);
  const [fields, setFields] = useState<string[]>([]);
  const [fieldType, setFieldType] = useState<"index" | "key">("index");
  const [step, setStep] = useState<number>(0);

  const { ref, ...fileRest } = register("file", { required: true });
  const inputRef = useRef<HTMLInputElement>();
  const fileUpload = watch("file");
  const fileHeader = watch("fileHeader");
  const vinColumn = watch("vinColumn");

  const validVins: string[] = useMemo(() => {
    if (!data || !data?.length) {
      return [];
    }
    if (!vinColumn || !fields.includes(vinColumn)) {
      return [];
    }

    const dataValues = cloneDeep<ValueBase[]>(data).map(Object.values);
    const vinColumnIndex = fields.indexOf(vinColumn) + (fieldType === "index" ? 1 : 0);

    return dataValues.map((row) => row?.[vinColumnIndex]).filter(isValidVin) || [];
  }, [data, vinColumn]);

  const nextUnlocked: boolean = useMemo(() => {
    if (step === 0) {
      return !!data.length;
    }
    if (step === 2) {
      return !!vinColumn && fields.includes(vinColumn);
    }
    if (step === 3) {
      return validVins.length > 0;
    }

    return true;
  }, [step, data, vinColumn]);

  const prevUnlocked: boolean = useMemo(() => step > 0, [step, data]);

  const onConfirmWrapper = async () => {
    setSaving(true);
    await onConfirm(validVins);
    setSaving(false);
    onClose();
  };

  const onCloseWrapper = () => {
    if (saving) {
      return;
    }

    onClose();
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

  const goBack = () => {
    if (step - 1 === 0) {
      setData([]);
      setFields([]);
      reset();
    }

    setStep(step - 1);
  };

  const goForward = () => {
    if (step + 1 === 4) {
      onConfirmWrapper();
      return;
    }

    setStep(step + 1);
  };

  useEffect(() => {
    if (!fileUpload?.[0]) {
      return;
    }

    parse(fileUpload[0], {
      header: !!fileHeader,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: ({ data, meta }) => {
        if (!data?.length || meta.aborted) {
          return;
        }

        if (!meta.fields || !fileHeader) {
          setFieldType("index");
          setFields(Array.from({ length: (data as Array<string>)?.[0].length || 0 }, (_, i) => `Column ${i + 1}`));
        } else {
          setFieldType("key");
          setFields(meta.fields as string[]);
        }

        setData(data as ValueBase[]);
        setStep(1);
      },
    });
  }, [fileUpload, fileHeader]);

  return (
    <StyledDialog maxWidth="sm" onClose={onCloseWrapper} fullWidth open>
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
            <StepLabel>Column Selection</StepLabel>
          </Step>
          <Step>
            <StepLabel>Import</StepLabel>
          </Step>
        </Stepper>
        <Box component="form" sx={{ mt: 4 }}>
          <Box sx={{ display: step !== 0 ? "none" : undefined }}>
            <StyledDropzone
              onClick={handleClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            />
            <Controller
              name="fileHeader"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <StyledFormControlLabel
                  label="Header Row"
                  control={<Checkbox checked={!!field.value} onChange={field.onChange} />}
                />
              )}
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
          </Box>
          <Stack direction="column" gap={1} sx={{ display: step !== 1 ? "none" : undefined }}>
            <Box sx={{ maxWidth: "100%", overflow: "auto", maxHeight: "calc(33px * 8 + 16px)" }}>
              <GenericSpreadsheet data={data || []} readOnly />
            </Box>
            <StyledFormHelperText>
              Any changes made here will not be saved.
            </StyledFormHelperText>
          </Stack>
          <Box sx={{ display: step !== 2 ? "none" : undefined, px: 2 }}>
            <Controller
              name="vinColumn"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <StyledTextField
                  {...field}
                  size="small"
                  variant="outlined"
                  label="VIN Column"
                  helperText="Pick the column that contains the VINs."
                  SelectProps={{ MenuProps: { disablePortal: true } }}
                  fullWidth
                  select
                >
                  {fields.map((field) => (<MenuItem key={field} value={field}>{field}</MenuItem>))}
                </StyledTextField>
              )}
            />
          </Box>
          <Box sx={{ display: step !== 3 ? "none" : undefined, px: 2 }}>
            <StatisticItem
              name="Valid VINs"
              value={validVins.length}
              precise
            />
            <StyledFormHelperText>
              Please do not navigate away while the import is in progress.
            </StyledFormHelperText>
          </Box>
        </Box>
      </StyledDialogContent>
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={goBack} disabled={!prevUnlocked || saving}>Back</Button>
        <LoadingButton onClick={goForward} disabled={!nextUnlocked} loading={saving}>{step === 3 ? "Import" : "Next"}</LoadingButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default ListImportDialog;
