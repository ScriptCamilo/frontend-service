import React, { useEffect, useRef } from "react";

import {
  Dialog,
  DialogTitle,
  makeStyles,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";

import { i18n } from "../../translate/i18n";
import ScheduleInput from '../ScheduleInput';

const useStyles = makeStyles((theme) => ({
  root: {
    flexWrap: "wrap",
  },

  textField: {
    marginRight: theme.spacing(1),
    width: "100%",
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },

  textScheduleContainer: {
    width: "100%",
  },
}));

const ScheduleModal = ({
  open,
  onClose,
  scheduleInfo,
  isCopy,
  ticket
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const translatedMessage = () => {
    switch(true) {
      case Boolean(isCopy):
        return "copy";
      case Boolean(scheduleInfo):
        return "edit";
      default:
        return "add";
    }
  }

  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {i18n.t(`scheduleModal.title.${translatedMessage()}`)}
        </DialogTitle>
        <ScheduleInput
          handleCloseModal={handleClose}
          scheduleInfo={scheduleInfo}
          isCopy={isCopy}
          ticket={ticket}
        />
      </Dialog>
    </div>
  );
};

export default ScheduleModal;
