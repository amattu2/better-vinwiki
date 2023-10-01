import React, { FC } from "react";
import {
  Button, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle,
} from "@mui/material";

type Props = {
  open: boolean;
  type: "post" | "comment" | "list";
  onConfirm?: () => void;
  onCancel?: () => void;
};

/**
 * A generic dialog for deleting a List, Post, or Comment
 *
 * @param {uuid}
 * @returns {JSX.Element}
 */
const DeleteContentDialog: FC<Props> = ({ type, open, onConfirm, onCancel }: Props) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>
      {`Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`}
    </DialogTitle>
    <DialogContent>
      <DialogContentText>
        {`Are you sure you want to delete this ${type}? This action cannot be undone.`}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onConfirm} color="error">Delete</Button>
      <Button onClick={onCancel} autoFocus>Cancel</Button>
    </DialogActions>
  </Dialog>
);

export default DeleteContentDialog;
