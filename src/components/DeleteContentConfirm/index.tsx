import React, { FC, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

type Props = {
  open: boolean;
  type: "post" | "comment" | "list" | "list_vehicles";
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
};

const getTitle = (type: Props["type"]): string => {
  switch (type) {
    case "list_vehicles":
      return "Delete Vehicles";
    default:
      return `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  }
};

const getContent = (type: Props["type"]): string => {
  switch (type) {
    case "list_vehicles":
      return "Are you sure you want to delete the selected vehicles from this list? This may take a few moments to complete";
    default:
      return `Are you sure you want to delete this ${type}? This action cannot be undone.`;
  }
};

/**
 * A generic dialog for deleting a some type of content
 *
 * @param {uuid}
 * @returns {JSX.Element}
 */
const DeleteContentDialog: FC<Props> = ({ type, open, onConfirm, onCancel }: Props) => {
  const [confirmPending, setConfirmPending] = useState<boolean>(false);

  const onConfirmWrapper = async () => {
    setConfirmPending(true);
    await onConfirm?.();
    setConfirmPending(false);
  };

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{getTitle(type)}</DialogTitle>
      <DialogContent>
        <DialogContentText>{getContent(type)}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <LoadingButton onClick={onConfirmWrapper} loading={confirmPending} color="error">
          Delete
        </LoadingButton>
        <Button onClick={onCancel} autoFocus>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteContentDialog;
