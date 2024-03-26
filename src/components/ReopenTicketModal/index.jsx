import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core";

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
import { useHistory } from "react-router-dom";
import getOpenTicket from "../../helpers/getOpenTicket";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  selectConnections: {
    marginTop: 20,
  },
}));

const selectMenuProps = {
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "left",
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "left",
  },
  getContentAnchorEl: null,
};

const ReopenTicketModal = ({ modalOpen, onClose, ticket }) => {
  const history = useHistory();
  const classes = useStyles();
  const [selectedQueue, setSelectedQueue] = useState("");
  const [selectedWhats, setSelectedWhats] = useState("");
  const [selectedWhatsApi, setSelectedWhatsApi] = useState("");
  const [selectedMeta, setSelectedMeta] = useState("");

  const [existingTicketModalOpen, setExistingTicketModalOpen] = useState(false);
  const [existingTickedId, setExistingTickedId] = useState(0);

  const [isMeta, setIsMeta] = useState();
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!modalOpen) return;

    const isMeta =
      ticket.contact.channel === "facebook" ||
      ticket.contact.channel === "instagram";
    setIsMeta(isMeta);
  }, [modalOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleReopenTicket = async () => {
    setLoading(true);
    const ticketExists = await getOpenTicket(
      selectedMeta,
      ticket.contactId,
      selectedWhats,
      user.id,
      ticket.whatsApiId
    );

    if (ticketExists) {
      setExistingTickedId(ticketExists.id);
      setExistingTicketModalOpen(true);
      return;
    }

    try {
      const { data } = await api.post("/tickets", {
        contactId: ticket.contactId,
        queueId: selectedQueue,
        whatsId: selectedWhats,
        whatsApiId: selectedWhatsApi,
        metaId: selectedMeta,
        userId: user?.id,
        status: "open",
        reopened: true,
      });
      history.push(`/tickets/${data.id}`);
    } catch (err) {
      console.log(err);
      toastError(err);
    }
    setLoading(false);
  };

  const renderSelectedOption = (options, selected, noSelectionText) => {
    if (selected === "") {
      return noSelectionText;
    }

    return options?.find((opt) => opt.id === selected).name;
  };

  const filterMenuItemForMeta = () => {
    if (ticket.contact.channel === "instagram") {
      return user?.user?.metas.filter((opt) => opt.name.includes("IG"));
    }
    return user?.user?.metas.filter((opt) => !opt.name.includes("IG"));
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
        <DialogTitle id="form-dialog-title">Reabrir Ticket</DialogTitle>
        <DialogContent dividers>
          <Grid style={{ width: 300 }} container spacing={2}>
            <Grid xs={12} item>
              {`${ticket?.contact?.name} - ${ticket?.contact?.number}`}
            </Grid>
            <Grid xs={12} item>
              <Select
                fullWidth
                displayEmpty
                variant="outlined"
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                MenuProps={selectMenuProps}
                renderValue={() =>
                  renderSelectedOption(
                    user?.queues,
                    selectedQueue,
                    "Selecione um setor"
                  )
                }
              >
                {user &&
                  user?.queues.map((queue, key) => {
                    if (!queue.deleted)
                      return (
                        <MenuItem dense key={key} value={queue.id}>
                          <ListItemText primary={queue.name} />
                        </MenuItem>
                      );
                  })}
              </Select>

              {isMeta ? (
                <Select
                  fullWidth
                  className={classes.selectConnections}
                  displayEmpty
                  variant="outlined"
                  value={selectedMeta}
                  onChange={(e) => setSelectedMeta(e.target.value)}
                  MenuProps={selectMenuProps}
                  renderValue={() =>
                    renderSelectedOption(
                      user?.metas,
                      selectedMeta,
                      "Selecione uma Página"
                    )
                  }
                >
                  {user &&
                    filterMenuItemForMeta().map((whats, key) => (
                      <MenuItem dense key={key} value={whats.id}>
                        <ListItemText primary={whats.name} />
                      </MenuItem>
                    ))}
                </Select>
              ) : (
                <>
                  <Select
                    fullWidth
                    className={classes.selectConnections}
                    displayEmpty
                    variant="outlined"
                    value={selectedWhats}
                    onChange={(e) => {
                      setSelectedWhats(e.target.value);
                      setSelectedWhatsApi("");
                    }}
                    MenuProps={selectMenuProps}
                    renderValue={() =>
                      renderSelectedOption(
                        user?.whatsapps,
                        selectedWhats,
                        "Selecione um Whatsapp"
                      )
                    }
                  >
                    {user &&
                      user.whatsapps.map((whats, key) => (
                        <MenuItem dense key={key} value={whats.id}>
                          <ListItemText primary={whats.name} />
                        </MenuItem>
                      ))}
                  </Select>

                  <Select
                    fullWidth
                    className={classes.selectConnections}
                    displayEmpty
                    variant="outlined"
                    value={selectedWhatsApi}
                    onChange={(e) => {
                      setSelectedWhatsApi(e.target.value);
                      setSelectedWhats("");
                    }}
                    MenuProps={selectMenuProps}
                    renderValue={() =>
                      renderSelectedOption(
                        user?.whatsappApis,
                        selectedWhatsApi,
                        "Selecione um Whatsapp Oficial"
                      )
                    }
                  >
                    {user &&
                      user.whatsappApis.map((whatsApi, key) => (
                        <MenuItem dense key={key} value={whatsApi.id}>
                          <ListItemText primary={whatsApi.name} />
                        </MenuItem>
                      ))}
                  </Select>
                </>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" variant="outlined">
            {i18n.t("newTicketModal.buttons.cancel")}
          </Button>
          <ButtonWithSpinner
            variant="contained"
            type="button"
            disabled={
              loading ||
              selectedQueue === "" ||
              (selectedWhats === "" &&
                selectedMeta === "" &&
                selectedWhatsApi === "")
            }
            onClick={handleReopenTicket}
            color="primary"
          >
            {i18n.t("newTicketModal.buttons.ok")}
          </ButtonWithSpinner>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReopenTicketModal;
