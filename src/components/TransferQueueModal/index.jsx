import React, { useCallback, useContext, useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, makeStyles } from "@material-ui/core";

import toastError from "../../errors/toastError";
import getOpenTicket from "../../helpers/getOpenTicket";
import useQueues from "../../hooks/useQueues";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  maxWidth: {
    width: "100%",
  },
  form: {
    width: "400px",
    [theme.breakpoints.down("xs")]: {
      width: "auto"
    }
  }
}));

const TransferQueueModal = ({
  modalOpen,
  onClose,
  queueId,
}) => {
  const classes = useStyles();
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { findAll: findAllQueues } = useQueues();

  useEffect(() => {
    findAllQueues()
      .then((response) => {
        setQueues(response);
      })
      .catch((err) => {
        toastError(err);
      });

  }, []);

  const handleClose = () => {
    onClose();
  };

  const handleTransferQueue = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.delete(`/queue/transferQueue/${queueId}/${selectedQueue}`);
      toast.success("Tickets transferidos com sucesso!");      
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
      onClose();
    }
  };


  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
      <form onSubmit={handleTransferQueue} className={classes.form}>
        <DialogTitle id="form-dialog-title">
          Transferir Tickets
        </DialogTitle>
        <DialogContent
          dividers
          style={{ display: "flex", flexDirection: "column", gap: "1em" }}
        >
           <FormControl variant="outlined" className={classes.maxWidth}>
           <InputLabel>
              Transferir tickets para o setor...
            </InputLabel>
            <Select
              value={selectedQueue}
              onChange={(e) => setSelectedQueue(e.target.value)}
            >
              <MenuItem value={""}>&nbsp;</MenuItem>
              {queues.filter((queue) => queue.id !== queueId)
                .map((queue) => (
                <MenuItem key={queue.id} value={queue.id}>
                  {queue?.name}
                </MenuItem>
              ))}
            </Select>
           </FormControl>

           <DialogActions>
          <Button
            onClick={handleClose}
            color="secondary"
            disabled={loading}
            variant="outlined"
          >
            {i18n.t("transferTicketModal.buttons.cancel")}
          </Button>
          <ButtonWithSpinner
            variant="contained"
            type="submit"
            color="primary"
            loading={loading}
          >
            {i18n.t("transferTicketModal.buttons.ok")}
          </ButtonWithSpinner>
        </DialogActions>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default TransferQueueModal;