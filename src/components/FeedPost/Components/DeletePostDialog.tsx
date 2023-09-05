import React, { FC } from "react";
import {
  Button, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle,
} from "@mui/material";

type Props = {
  open: boolean;
  type: "post" | "comment";
  onConfirm?: () => void;
  onCancel?: () => void;
};

/**
 * A generic dialog for deleting posts and comments
 *
 * @param {uuid}
 * @returns {JSX.Element}
 */
const DeletePostDialog: FC<Props> = ({ type, open, onConfirm, onCancel }: Props) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>
      {type === "post" ? "Delete Post" : "Delete Comment"}
    </DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete this
        {type === "post" ? " post" : " comment"}?
        This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onConfirm} color="error">Delete</Button>
      <Button onClick={onCancel} autoFocus>Cancel</Button>
    </DialogActions>
  </Dialog>
);

export default DeletePostDialog;
