import React, { useEffect, useState } from "react";

import { Divider, Grid, Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { toast } from "react-toastify";

import { useUsersContext } from '../../context/UsersContext';
import toastError from "../../errors/toastError";
import useQueues from "../../hooks/useQueues";
import useWhatsApps from "../../hooks/useWhatsApps";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { useStyles } from "./styles";

const STATUS = ["Todos", "Abertos", "Pendentes", "Fechados"];

const keyStatus = {
  Todos: null,
  Abertos: "open",
  Pendentes: "pending",
  Fechados: "closed",
};

function TransferAllTicketModal(props) {
  const {
    modalOpen,
    onClose,
    ticketWhatsappId,
    deletingUser,
    queueId,
  } = props;
  const classes = useStyles();
  const { findAll: findAllQueues } = useQueues();
  const { whatsApps } = useWhatsApps();
  const { users, pageNumber, setUsersPageNumber } = useUsersContext();

  useEffect(() => {
		if (deletingUser) {
			setOldUser(deletingUser.id);
			setSelectedStatus('Todos')
			setSelectedToQueue('Todos')
		}
	}, [deletingUser]);

  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserCaracterizado, setSelectedUserCaracterizado] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [selectedToQueue, setSelectedToQueue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedWhatsapp, setSelectedWhatsapp] = useState(ticketWhatsappId);
  const [selectedWhatsappFrom, setSelectedWhatsappFrom] = useState(ticketWhatsappId);
  const [oldUser, setOldUser] = useState(null);

  const handleClose = () => {
    toast.dark("Operação cancelada", {
      position: "top-right",
      hideProgressBar: false,
      pauseOnHover: false,
      closeOnClick: true,
      draggable: true,
    });
    onClose(true);
    setSelectedUser(null);
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();

    // if (!ticketid) return;
    setLoading(true);
    toast.dark("Transferindo tickets, por favor aguarde", {
      position: "top-right",
      hideProgressBar: false,
      pauseOnHover: false,
      closeOnClick: true,
      draggable: true,
    });
    try {
      let data = {};
      data.userId = null;
      data.status = keyStatus[selectedStatus];
      data.allTickets = true;
      data.fromUserId = deletingUser?.id;
      data.queueIdFrom = selectedQueue;
      data.queueIdTo = selectedToQueue;
      data.whatsappId = selectedWhatsapp;
      data.whatsappIdFrom = selectedWhatsappFrom;
      if (oldUser) {
        data.fromUserId = oldUser;
        data.userId = selectedUser;
        data.userIdCaracterizado = selectedUserCaracterizado;
      }

      await api.put(`/all-tickets/`, data).then(async () => {
        if (queueId) await api.delete(`/queue/${queueId}`);
        setLoading(false);
        onClose();
        window.location.reload(true);
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  useEffect(() => {
    if (!pageNumber) setUsersPageNumber(1);
  }, [pageNumber, setUsersPageNumber]);

  useEffect(() => {
    const loadQueues = async () => {
      const list = await findAllQueues();
      setQueues(list);
    };
    loadQueues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog open={modalOpen} onClose={handleClose} scroll="paper">
      <form onSubmit={handleSaveTicket}>
        <DialogTitle id="form-dialog-title" style={{ width: "378px" }}>
          Transferir Todos Tickets
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="p" gutterBottom>
            Atendente
          </Typography>
          <FormControl
            variant="outlined"
            className={classes.maxWidth}
            style={{ marginBottom: 20, marginTop: 10 }}
          >
            <InputLabel>Transferir do atendente</InputLabel>
            <Select
              value={oldUser}
              onChange={(e) => setOldUser(e.target.value)}
              label={i18n.t("transferTicketModal.fieldQueuePlaceholder")}
              disabled={deletingUser?.id}
            >
              <MenuItem value={0}>Manter usuários</MenuItem>
              {users?.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user?.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            variant="outlined"
            className={classes.maxWidth}
            style={{ marginBottom: 20 }}
          >
            <InputLabel disabled={!oldUser}>
              Transferir para o atendente
            </InputLabel>
            <Select
              value={selectedUser}
              disabled={!oldUser}
              data-disabled={!oldUser}
              className={classes.select}
              onChange={(e) => setSelectedUser(e.target.value)}
              label={i18n.t("transferTicketModal.fieldQueuePlaceholder")}
            >
              <MenuItem value={""}>&nbsp;</MenuItem>
              {users?.filter((user) => user.id !== oldUser).map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user?.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            variant="outlined"
            className={classes.maxWidth}
            style={{ marginBottom: 20 }}
          >
            <InputLabel disabled={!oldUser}>
              Transferir os carterizados para o atendente
            </InputLabel>
            <Select
              value={selectedUserCaracterizado}
              disabled={!oldUser}
              data-disabled={!oldUser}
              className={classes.select}
              onChange={(e) => setSelectedUserCaracterizado(e.target.value)}
              label={i18n.t("transferTicketModal.fieldQueuePlaceholder")}
            >
              <MenuItem value={""}>&nbsp;</MenuItem>
              {users?.filter((user) => user.id !== oldUser).map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user?.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider />
          <Typography variant="p" gutterBottom>
            Setor
          </Typography>
          <Grid
            container
            spacing={1}
            style={{ marginTop: 10, marginBottom: 20 }}
          >
            <Grid item xs={6}>
              <FormControl variant="outlined" className={classes.maxWidth}>
                <InputLabel>Do setor:*</InputLabel>
                <Select
                  required
                  value={selectedQueue}
                  onChange={(e) => setSelectedQueue(e.target.value)}
                  label="Transferir de"
                >
                  {!deletingUser?.id && <MenuItem value={"unqueued"}>Sem fila</MenuItem>}
                  <MenuItem value={"manter"}>Manter filas</MenuItem>
                  <MenuItem value={'Todos'}>Todos</MenuItem>
                  {!deletingUser?.id &&  queues.map((queue) => (
                    <MenuItem key={queue.id} value={queue.id}>
                      {queue?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl variant="outlined" className={classes.maxWidth}>
                <InputLabel disabled={selectedQueue === "manter"}>
                  Para o setor:*
                </InputLabel>
                <Select
                  disabled={selectedQueue === "manter"}
                  data-disabled={selectedQueue === "manter"}
                  required={selectedQueue !== "manter"}
                  value={selectedToQueue}
                  className={classes.select}
                  onChange={(e) => setSelectedToQueue(e.target.value)}
                  label="Transferir para"
                >
                  {/* <MenuItem value={'unqueued'}>Sem fila</MenuItem> */}
                  <MenuItem value={""}>&nbsp;</MenuItem>
                  {queues.map((queue) => (
                    <MenuItem key={queue.id} value={queue.id}>
                      {queue?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider />
          <Typography variant="p" gutterBottom>
            Conexão
          </Typography>
          <Grid container spacing={1} style={{ marginTop: 10 }}>
            <Grid item xs={6}>
              <FormControl variant="outlined" className={classes.maxWidth}>
                <InputLabel>Da conexão:*</InputLabel>
                <Select
                  required
                  value={selectedWhatsappFrom}
                  onChange={(e) => setSelectedWhatsappFrom(e.target.value)}
                  label={i18n.t("transferTicketModal.fieldConnectionPlaceholder")}
                >
                  <MenuItem value={"manter"}>Manter conexões</MenuItem>
                  <MenuItem value={"Todas"}>Todas</MenuItem>
                  {!deletingUser?.id && whatsApps.filter((whatsapp) => whatsapp.status !== "INATIVE").map((whasapp) => (
                    <MenuItem key={whasapp.id} value={whasapp.id}>
                      {whasapp?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl variant="outlined" className={classes.maxWidth}>
                <InputLabel disabled={selectedWhatsappFrom === "manter"}>
                  Para a conexão:*
                </InputLabel>
                <Select
                  disabled={selectedWhatsappFrom === "manter"}
                  data-disabled={selectedWhatsappFrom === "manter"}
                  required={selectedWhatsappFrom !== "manter"}
                  className={classes.select}
                  value={selectedWhatsapp}
                  onChange={(e) => setSelectedWhatsapp(e.target.value)}
                  label={i18n.t(
                    "transferTicketModal.fieldConnectionPlaceholder"
                  )}
                >
                  {whatsApps.filter((whatsapp) => whatsapp.status !== "INATIVE").map((whasapp) => (
                    <MenuItem key={whasapp.id} value={whasapp.id}>
                      {whasapp?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl variant="outlined" className={classes.maxWidth}>
                <InputLabel>Com o status:*</InputLabel>
                <Select
                  required
                  value={selectedStatus}
                  disabled={deletingUser?.id}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  label="Com Status"
                >
                  <MenuItem value={""}>&nbsp;</MenuItem>
                  {STATUS.map((status, index) => (
                    <MenuItem key={index} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
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
      </form>
    </Dialog>
  );
};

export default TransferAllTicketModal;
