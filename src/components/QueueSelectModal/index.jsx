import React, { useContext, useEffect, useState } from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  makeStyles,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  maxWidth: {
    width: "100%",
  },
  gridWidth: {
    minWidth: "120px",
  },
}));

const QueueSelectModal = ({
  modalOpen,
  onClose,
  ticket,
  unreadsList,
  updateUnreadsList,
  deleteTicketFromList = () => {},
	functionsDeleteTicketObject
}) => {
  const classes = useStyles();
  const history = useHistory();

  const { user } = useContext(AuthContext);
  const [disableConfirm, setDisableConfirm] = useState(true);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [availableQueues, setAvailableQueues] = useState([]);

  const handleAcepptTicket = async (id) => {
    deleteTicketFromList(id);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
        queueId: selectedQueue,
      });
			functionsDeleteTicketObject[ticket.status](ticket.id);
    } catch (err) {
      toastError(err);
    }

    if (Boolean(unreadsList)) {
      const newList = unreadsList.filter((item) => item.id !== id);
      updateUnreadsList(newList);
    }
    history.push(`/tickets/${id}`);
    onClose();
  };

  useEffect(() => {
    if (modalOpen) {
      setAvailableQueues(user.queues);
    }
  }, [modalOpen, user]);

  const handleQueueSelect = ({ target }) => {
    setSelectedQueue(target.value);
    setDisableConfirm(false);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
      <DialogTitle id="form-dialog-title">
        Selecione um setor para o Ticket
      </DialogTitle>

      <DialogContent dividers>
        <Grid className={classes.gridWidth}>
          <FormControl variant="outlined" className={classes.maxWidth}>
            <InputLabel>Setor</InputLabel>
            <Select
              required
              value={selectedQueue}
              onChange={(e) => handleQueueSelect(e)}
              label="Setor"
            >
              {availableQueues.map((queue) => (
                <MenuItem key={queue.id} value={queue.id}>
                  {queue?.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="secondary" variant="outlined">
          Cancelar
        </Button>

        <Button
          variant="contained"
          type="button"
          color="primary"
          disabled={disableConfirm}
          onClick={() => handleAcepptTicket(ticket.id)}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QueueSelectModal;
