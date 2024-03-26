import React from "react";
import LinearProgress from "@material-ui/core/LinearProgress";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import { useStyles } from "./styles.js";

export default function BarProgressModal({ progress, open, onClose }) {
  const classes = useStyles();

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">Progresso</DialogTitle>
      <DialogContent dividers>
        <Typography className={classes.typography}>
          <LinearProgress
            variant="determinate"
            value={progress}
            color="secondary"
            className={classes.linearProgress}
          />
          <p>{progress}%</p>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={() => {
            onClose(false);
          }}
          color="secondary"
        >
          {i18n.t("confirmationModal.buttons.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
