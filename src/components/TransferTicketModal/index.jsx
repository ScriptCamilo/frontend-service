import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

import { makeStyles, Tooltip } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import { AuthContext } from "../../context/Auth/AuthContext";
import { useUsersContext } from "../../context/UsersContext";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import getOpenTicket from "../../helpers/getOpenTicket";
import useQueues from "../../hooks/useQueues";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { Can } from "../Can";
import ExistingTicketModal from "../ExistingTicketModal";
// import useMixpanel from "../../hooks/useMixpanel";

const useStyles = makeStyles((theme) => ({
  maxWidth: {
    width: "100%",
  },
  form: {
    width: "400px",
    [theme.breakpoints.down("xs")]: {
      width: "auto",
    },
  },
}));

const TransferTicketModal = ({
  modalOpen,
  onClose,
  ticketid,
  status,
  ticket,
}) => {
  const history = useHistory();
  const classes = useStyles();
  const { findAll: findAllQueues } = useQueues();
  const { users, pageNumber, setUsersPageNumber, fetchUsers } =
    useUsersContext();
  const {
    whatsApps,
    loading: loadingWhatsapps,
    allMetas: metas,
    whatsAppApis,
  } = useContext(WhatsAppsContext);
  const { user: loggedInUser, track } = useContext(AuthContext);

  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedQueue, setSelectedQueue] = useState("");
  const [selectedWhatsapp, setSelectedWhatsapp] = useState(ticket?.whatsappId);
  const [selectedMeta, setSelectedMeta] = useState(ticket?.metaId);
  const [selectedWhatsappApi, setSelectedWhatsappApi] = useState(
    ticket?.whatsappApiId
  );
  const [existingTicketModalOpen, setExistingTicketModalOpen] = useState(false);
  const [existingTickedId, setExistingTickedId] = useState(0);

  // const mixpanel = useMixpanel();

  const filteredUsers = users.filter(({ queues }) => {
    return queues.some(({ id }) => id === selectedQueue);
  });

  const changeSetorUsers = (e) => {
    setSelectedQueue(e);
  };

  const handleClose = () => {
    onClose();
    setSelectedUser(null);
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    if (!ticketid) return;
    setLoading(true);
    try {
      let data = {};
      data.userId = null;

      data.status = "pending";

      if (selectedUser) {
        data.userId = selectedUser;
      }

      if (selectedQueue) {
        data.queueId = selectedQueue;

        if (!selectedUser) {
          data.status = "pending";
          data.userId = null;
        }
      }

      if (selectedWhatsapp) {
        data.whatsappId = selectedWhatsapp;
        data.metaId = null;
        data.whatsappApiId = null;
      }

      if (selectedWhatsappApi) {
        data.whatsappApiId = selectedWhatsappApi;
        data.metaId = null;
        data.whatsappId = null;
      }

      if (selectedMeta) {
        data.metaId = selectedMeta;
        data.whatsappId = null;
        data.whatsappApiId = null;
      }

      if (status === "groups") {
        data.status = "groups";
      }
      await api.put(`/tickets/${ticketid}`, {
        ...data,
        actionNameUser: loggedInUser.name,
      });
      track("Ticket Change", {
        Action: "Transfer Ticket",
      });
      setLoading(false);
      history.push(`/tickets`);
    } catch (err) {
      console.log(err);
      // TODO: procurar onde o back-end quebra para tratar específicamente o caso de tickets duplicados
      const ticketExists = await getOpenTicket(
        selectedMeta,
        ticket.contactId,
        selectedWhatsapp,
        selectedUser,
        selectedWhatsappApi
      );
      if (ticketExists) {
        setExistingTickedId(ticketExists.id);
        setExistingTicketModalOpen(true);
        setLoading(false);
        return;
      }

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
    (async () => {
      if (modalOpen) {
        fetchUsers();
      }
    })();
  }, [modalOpen, fetchUsers]);

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
      <ExistingTicketModal
        modalOpen={existingTicketModalOpen}
        onClose={() => {
          setExistingTicketModalOpen(false);
          handleClose();
        }}
        ticketId={existingTickedId}
      />

      <form onSubmit={handleSaveTicket} className={classes.form}>
        <DialogTitle id="form-dialog-title">
          {i18n.t("transferTicketModal.title")}
        </DialogTitle>
        <DialogContent
          dividers
          style={{ display: "flex", flexDirection: "column", gap: "1em" }}
        >
          <FormControl variant="outlined" className={classes.maxWidth}>
            <InputLabel>
              {i18n.t("transferTicketModal.fieldQueueLabel")}
            </InputLabel>
            <Select
              value={selectedQueue}
              onChange={(e) => changeSetorUsers(e.target.value)}
              label={i18n.t("transferTicketModal.fieldQueuePlaceholder")}
            >
              <MenuItem value={""}>&nbsp;</MenuItem>
              {queues.map((queue) => (
                <MenuItem key={queue.id} value={queue.id}>
                  {queue?.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {status !== "groups" && (
            <FormControl variant="outlined" className={classes.maxWidth}>
              <InputLabel>Transferir para usuário</InputLabel>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                label={i18n.t("transferTicketModal.fieldQueuePlaceholder")}
              >
                <MenuItem value={""}>&nbsp;</MenuItem>
                {filteredUsers?.map((user) => (
                  <MenuItem
                    key={user.id}
                    value={user.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginRight: "10px",
                    }}
                  >
                    <span style={{ color: user.isOnline ? "green" : "red" }}>
                      ●
                    </span>
                    {user?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {ticket.contact.channel === "facebook" ||
          ticket.contact.channel === "instagram" ? (
            <Can
              role={loggedInUser.profile}
              perform="ticket-options:transferWhatsapp"
              yes={() =>
                !loadingWhatsapps && (
                  <FormControl
                    variant="outlined"
                    className={classes.maxWidth}
                    style={{ marginTop: 20 }}
                  >
                    <InputLabel>
                      {i18n.t("transferTicketModal.fieldConnectionLabel")}
                    </InputLabel>
                    <Select
                      value={selectedMeta}
                      onChange={(e) => setSelectedMeta(e.target.value)}
                      label={i18n.t(
                        "transferTicketModal.fieldConnectionPlaceholder"
                      )}
                    >
                      {metas
                        .filter((meta) => meta.status !== "INATIVE")
                        .map((meta) => (
                          <Tooltip
                            key={meta.id}
                            value={meta.id}
                            title="Garanta que esta conversa já exista nesta conexão"
                          >
                            <MenuItem>{meta?.name}</MenuItem>
                          </Tooltip>
                        ))}
                    </Select>
                  </FormControl>
                )
              }
            />
          ) : (
            <Can
              role={loggedInUser.profile}
              perform="ticket-options:transferWhatsapp"
              yes={() =>
                !loadingWhatsapps && (
                  <>
                    <FormControl
                      variant="outlined"
                      className={classes.maxWidth}
                      style={{ marginTop: 20 }}
                    >
                      <InputLabel>
                        {i18n.t("transferTicketModal.fieldConnectionLabel")}
                      </InputLabel>
                      <Select
                        value={selectedWhatsapp}
                        onChange={(e) => {
                          setSelectedWhatsapp(e.target.value);
                          setSelectedWhatsappApi(null);
                        }}
                        label={i18n.t(
                          "transferTicketModal.fieldConnectionPlaceholder"
                        )}
                      >
                        {whatsApps
                          .filter((whatsapp) => whatsapp.status !== "INATIVE")
                          .map((whatsapp) => (
                            <MenuItem key={whatsapp.id} value={whatsapp.id}>
                              {whatsapp?.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>

                    <FormControl
                      variant="outlined"
                      className={classes.maxWidth}
                      style={{ marginTop: 20 }}
                    >
                      <InputLabel>
                        {"Transferir para conexão oficial"}
                      </InputLabel>
                      <Select
                        value={selectedWhatsappApi}
                        onChange={(e) => {
                          setSelectedWhatsappApi(e.target.value);
                          setSelectedWhatsapp(null);
                        }}
                        label={"Selecione uma conexão oficial"}
                      >
                        {whatsAppApis
                          .filter(
                            (whatsappApi) => whatsappApi.status !== "INATIVE"
                          )
                          .map((whatsappApi) => (
                            <MenuItem
                              key={whatsappApi.id}
                              value={whatsappApi.id}
                            >
                              {whatsappApi?.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </>
                )
              }
            />
          )}
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

export default TransferTicketModal;
