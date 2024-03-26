import React, { useState, useEffect, useContext } from "react";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ExistingTicketModal from "../ExistingTicketModal";
import toastError from "../../errors/toastError";
import { Grid, ListItemText, MenuItem, Select } from "@material-ui/core";
import { toast } from "react-toastify";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import { useHistory } from "react-router-dom";
import getOpenTicket from "../../helpers/getOpenTicket";
import { AuthContext } from "../../context/Auth/AuthContext";

const NewTicketModalForSelectedContact = ({
  modalOpen,
  onClose,
  initialContact,
}) => {
  const history = useHistory();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [selectedWhats, setSelectedWhats] = useState("");
  const [selectedMeta, setSelectedMeta] = useState("");

  const [existingTicketModalOpen, setExistingTicketModalOpen] = useState(false);
  const [existingTickedId, setExistingTickedId] = useState(0);

  const { whatsApps, allMetas: metas } = useContext(WhatsAppsContext);
  const { user, track } = useContext(AuthContext);

  useEffect(() => {
    if (!modalOpen) {
      return;
    }
    setOptions([initialContact]);
    setSelectedContact(initialContact);
    setSelectedMeta("");
    setSelectedQueue("");
    setSelectedWhats("");
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen || searchParam.length < 3) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, modalOpen]);

  const fetchContacts = async () => {
    try {
      const { data } = await api.get("/contacts", {
        params: { searchParam },
      });
      setOptions(data.contacts);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  const handleClose = () => {
    onClose();
    setSearchParam("");
    setSelectedContact(null);
  };

  const handleSaveTicket = async (contactId) => {
    if (!contactId) return;
    if (selectedQueue === "" && user?.profile !== "admin") {
      toast.error("Selecione um setor");
      return;
    }

    track("Conversation Start");

    const ticketExists = await getOpenTicket(
      selectedMeta,
      selectedContact.id,
      selectedWhats,
      user?.id,
      null
    );
    if (ticketExists) {
      setExistingTickedId(ticketExists.id);
      setExistingTicketModalOpen(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const queueId = selectedQueue !== "" ? selectedQueue : null;
      const whatsId = selectedWhats !== "" ? selectedWhats : null;
      const metaId = selectedMeta !== "" ? selectedMeta : null;

      const { data: ticket } = await api.post("/tickets", {
        contactId: contactId,
        queueId,
        whatsId,
        metaId,
        userId: user?.id,
        status: "open",
      });
      onClose(ticket);
      history.push(`/tickets/${ticket.id}`);
    } catch (err) {
      toastError(err);
      onClose();
    }
    setLoading(false);
  };

  return (
    <>
      <ExistingTicketModal
        modalOpen={existingTicketModalOpen}
        onClose={() => {
          setExistingTicketModalOpen(false);
          handleClose();
        }}
        ticketId={existingTickedId}
        newTicketModalProps={{
          newTicketModalStatus: modalOpen,
          newTicketModalClose: onClose,
        }}
      />

      <Dialog open={modalOpen} onClose={handleClose}>
        <DialogTitle id="form-dialog-title">
          {i18n.t("newTicketModal.title")}
        </DialogTitle>
        <DialogContent dividers>
          {selectedContact && (
            <p>
              <strong>Contato:</strong>
              {` ${selectedContact.name} - ${selectedContact.number}`}
            </p>
          )}
        </DialogContent>
        <DialogContent dividers>
          <Grid
            style={{
              width: 300,
              margin: "0 auto",
            }}
            container
            spacing={2}
          >
            <Grid xs={12} item>
              <Select
                fullWidth
                displayEmpty
                variant="outlined"
                value={selectedQueue}
                onChange={(e) => {
                  setSelectedQueue(e.target.value);
                }}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null,
                }}
                renderValue={() => {
                  if (selectedQueue === "") {
                    return "Selecione um setor";
                  }
                  const queue = user?.queues.find(
                    (q) => q.id === selectedQueue
                  );
                  return queue.name;
                }}
              >
                {user &&
                  user?.queues.map((queue, key) => (
                    <MenuItem dense key={key} value={queue.id}>
                      <ListItemText primary={queue.name} />
                    </MenuItem>
                  ))}
              </Select>
              <Select
                disabled={
                  initialContact?.channel === "facebook" ||
                  initialContact?.channel === "instagram"
                }
                fullWidth
                displayEmpty
                variant="outlined"
                value={selectedWhats}
                onChange={(e) => {
                  setSelectedWhats(e.target.value);
                }}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null,
                }}
                renderValue={() => {
                  if (selectedWhats === "") {
                    return "Selecione um Whatsapp";
                  }
                  const whats = whatsApps.find((w) => w.id === selectedWhats);
                  return whats.name;
                }}
              >
                <MenuItem dense value={""}>
                  <ListItemText primary={"Sem Whatsapp"} />
                </MenuItem>
                {user &&
                  user?.whatsapps.map((whats, key) => (
                    <MenuItem dense key={key} value={whats.id}>
                      <ListItemText primary={whats.name} />
                    </MenuItem>
                  ))}
                {user && user?.whatsapps.length === 0 && (
                  <p>Nenhum whatsapp atribuido ao atendente</p>
                )}
              </Select>
              <Select
                disabled={
                  initialContact?.channel !== "facebook" &&
                  initialContact?.channel !== "instagram"
                }
                fullWidth
                displayEmpty
                variant="outlined"
                value={selectedMeta}
                onChange={(e) => {
                  setSelectedMeta(e.target.value);
                }}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null,
                }}
                renderValue={() => {
                  if (selectedMeta === "") {
                    return "Selecione uma Página";
                  }
                  const meta = metas.find((w) => w.id === selectedMeta);
                  return meta.name;
                }}
              >
                <MenuItem dense value={""}>
                  <ListItemText primary={"Sem Página"} />
                </MenuItem>
                {user &&
                  user?.metas.map((meta, key) => (
                    <MenuItem dense key={key} value={meta.id}>
                      <ListItemText primary={meta.name} />
                    </MenuItem>
                  ))}
              </Select>
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
            {i18n.t("newTicketModal.buttons.cancel")}
          </Button>
          <ButtonWithSpinner
            variant="contained"
            type="button"
            disabled={
              !selectedContact ||
              selectedQueue === "" ||
              (selectedWhats === "" && selectedMeta === "")
            }
            onClick={() => handleSaveTicket(selectedContact.id)}
            color="primary"
            loading={loading}
          >
            {i18n.t("newTicketModal.buttons.ok")}
          </ButtonWithSpinner>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewTicketModalForSelectedContact;
