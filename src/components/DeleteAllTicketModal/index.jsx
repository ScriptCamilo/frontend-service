import React, { useEffect, useState } from "react";

import { Grid, TextField, makeStyles } from "@material-ui/core";
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

import { useUsersContext } from "../../context/UsersContext";
import { useWhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import useQueues from "../../hooks/useQueues";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { useAuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  maxWidth: {
    width: "100%",
  },
  gridWidth: {
    minWidth: "120px",
  },
}));

const status = ["Todos", "Abertos", "Pendentes"];

const keyStatus = {
  Todos: "Todos",
  Abertos: "open",
  Pendentes: "pending",
};

const DeleteAllTicketModal = ({ modalOpen, onClose, onClick }) => {
  const classes = useStyles();
  const { findAll: findAllQueues } = useQueues();
  const { whatsApps } = useWhatsAppsContext();
  const { users, pageNumber, setUsersPageNumber } = useUsersContext();
	const { track } = useAuthContext()

  const [metas, setMetas] = useState([]);
	const [allConnections, setAllConnections] = useState([]);
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedConnection, setSelectedConnection] = useState("");
  const [createdAtStart, setCreatedAtStart] = useState("");
  const [createdAtEnd, setCreatedAtEnd] = useState("");

  const handleClose = () => {
    onClose();
    setSelectedQueue("");
    setSelectedStatus("");
    setSelectedUser("");
    setSelectedConnection("");
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dark("Deletando tickets, por favor aguarde", {
      position: "top-right",
      hideProgressBar: false,
      pauseOnHover: false,
      closeOnClick: true,
      draggable: true,
    });
    try {
      let data = {};
      data.status = keyStatus[selectedStatus];
      if (selectedQueue) {
        data.queueId = selectedQueue;
        if (selectedQueue === "Sem") data.queueId = null;
      }

      if (selectedUser) {
        data.userId = selectedUser;
        if (selectedUser === "Sem") data.userId = null;
      }

      if ((selectedConnection || selectedConnection === 0) && selectedConnection !== null) {
        const findConnection = allConnections[selectedConnection];
				data[findConnection.pageId ? 'metaId' : 'whatsappId'] = findConnection.id;
      }

      if (createdAtStart) {
        data.createdAtStart = createdAtStart;
      }

      if (createdAtEnd) {
        data.createdAtEnd = createdAtEnd;
      }

      await api.post(`/delete-tickets/`, data).then(() => {
        setLoading(false);
        handleClose();
        onClick();
      });
			track('Ticket Change', {
				Action: "Delete All",
				Origin: "end-tickets"
			})
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

  useEffect(() => {
		async function init() {
			const listAllQueue = await findAllQueues();
			const listAllMeta = await api.get("/meta");
			setMetas(listAllMeta.data);
			setQueues(listAllQueue);
		}
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

	useEffect(() => {
		setAllConnections([...whatsApps, ...metas])
	}, [metas, whatsApps])

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
      <form onSubmit={handleSaveTicket}>
        <DialogTitle id="form-dialog-title">
          Finalizar Todos Tickets
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={1}>
            <Grid item xs={6} className={classes.gridWidth}>
              <FormControl variant="outlined" className={classes.maxWidth}>
                <InputLabel>Setor</InputLabel>
                <Select
                  required
                  value={selectedQueue[1]}
                  onChange={(e) => setSelectedQueue(e.target.value)}
                  label="Setor"
                >
                  <MenuItem value={""}>&nbsp;</MenuItem>
                  <MenuItem value={"Sem"}>Sem fila</MenuItem>
                  <MenuItem value={"Todos"}>Todos</MenuItem>
                  {queues.map((queue) => (
                    <MenuItem key={queue.id} value={queue.id}>
                      {queue?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} className={classes.gridWidth}>
              <FormControl variant="outlined" className={classes.maxWidth}>
                <InputLabel>Conexão</InputLabel>
                <Select
                  required
                  value={selectedConnection}
                  onChange={(e) => setSelectedConnection(e.target.value)}
                  label={i18n.t(
                    "transferTicketModal.fieldConnectionPlaceholder"
                  )}
                >
                  {allConnections.map((connection, index) => (
                    <MenuItem key={connection.id} value={index}>
                      {connection?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} className={classes.gridWidth}>
              <FormControl variant="outlined" className={classes.maxWidth}>
                <InputLabel>Com Status</InputLabel>
                <Select
                  required
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  label="Com Status"
                >
                  <MenuItem value={""}>&nbsp;</MenuItem>
                  {status.map((status, index) => (
                    <MenuItem key={index} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} className={classes.gridWidth}>
              <FormControl variant="outlined" className={classes.maxWidth}>
                <InputLabel>Usuário</InputLabel>
                <Select
                  required
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  label="Usuários"
                >
                  <MenuItem value={""}>&nbsp;</MenuItem>
                  <MenuItem value={"Sem"}>Sem usuário</MenuItem>
                  <MenuItem value={"Todos"}>Todos</MenuItem>
                  {users.map((user, index) => (
                    <MenuItem key={index} value={user.id}>
                      {user?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} className={classes.gridWidth}>
              <FormControl variant="outlined" className={classes.maxWidth}>
                <TextField
                  label="Data de criação inicial"
                  variant="outlined"
                  className={classes.textInput}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => setCreatedAtStart(e.target.value)}
                />
              </FormControl>
            </Grid>
            <Grid item xs={6} className={classes.gridWidth}>
              <FormControl variant="outlined" className={classes.maxWidth}>
                <TextField
                  label="Data de criação final"
                  variant="outlined"
                  className={classes.textInput}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => setCreatedAtEnd(e.target.value)}
                />
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
            disabled={loading || createdAtEnd === "" || createdAtStart === ""}
          >
            Finalizar Todos
          </ButtonWithSpinner>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DeleteAllTicketModal;
