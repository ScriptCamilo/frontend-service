import React, { useState, useEffect, useContext } from "react";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";

import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Autocomplete, {
  createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ContactModal from "../ContactModal";
import ExistingTicketModal from "../ExistingTicketModal";
import toastError from "../../errors/toastError";
import { Grid, ListItemText, MenuItem, Select } from "@material-ui/core";
import { toast } from "react-toastify";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import { useHistory } from "react-router-dom";
import getOpenTicket from "../../helpers/getOpenTicket";

import ContactModalForGroup from "../ContactModalForGroup/index";
import GroupModal from "../GroupModal/index.jsx";

import AddIcon from "@material-ui/icons/Add";
import { useAuthContext } from "../../context/Auth/AuthContext.jsx";

const filter = createFilterOptions({
  trim: true,
});

const NewTicketModal = ({ modalOpen, onClose, initialContact = {} }) => {
  const history = useHistory();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [selectedWhats, setSelectedWhats] = useState("");
  const [selectedWhatsApi, setSelectedWhatsApi] = useState("");
  const [selectedMeta, setSelectedMeta] = useState("");
  const [newContact, setNewContact] = useState({});
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactModalForGroupOpen, setContactModalForGroupOpen] =
    useState(false);
  const [newContactForGroup, setNewContactForGroup] = useState({});
  const [listSelectd, setListSelectd] = useState([]);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [choiceInput, setChoiceInput] = useState("ticket");
  const [openTextBox, setOpenTextBox] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { track, user } = useAuthContext();

  const [existingTicketModalOpen, setExistingTicketModalOpen] = useState(false);
  const [existingTickedId, setExistingTickedId] = useState(0);

  const {
    allMetas: metas,
    whatsApps,
    whatsAppApis,
  } = useContext(WhatsAppsContext);
  const [isMeta, setIsMeta] = useState();

  useEffect(() => {
    if (initialContact.id !== undefined) {
      setOptions([initialContact]);
      setSelectedContact(initialContact);
    }
  }, [initialContact]);

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
        params: {
          searchParam,
          ignoreOffset: "true",
          includeGroup: choiceInput === "ticket" ? "true" : "false",
          channel: choiceInput === "ticket" ? "" : "whatsapp",
        },
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
    setOptions([]);
    setLoading(false);
    setSelectedQueue("");
    setSelectedWhats("");
    setSelectedWhatsApi("");
    setSelectedMeta("");
    setNewContact({});
    setContactModalOpen(false);
    setExistingTicketModalOpen(false);
    setExistingTickedId(0);
    setIsMeta();
    setListSelectd([]);
    setOpenTextBox(false);
  };

  const handleListSelectd = (e, newValue) => {
    if (
      newValue?.number &&
      !listSelectd.some((e) => e.number === newValue.number)
    ) {
      const find = listSelectd.find((e) => e.includes(newValue.number));
      if (find) {
        toast.error("Este contato já está na lista para ser adicionado");
        setSearchParam("");
      } else {
        setListSelectd([...listSelectd, `${newValue.number}@c.us`]);
        setSearchParam("");
        if (newValue.notification === undefined)
          toast.success("Contato adicionado a lista do grupo com sucesso!");
      }
    } else if (newValue?.name) {
      setNewContactForGroup({ name: newValue.name });
      setSearchParam("");
      setContactModalForGroupOpen(true);
    }
  };

  const handleSaveTicket = async (contactId, group = false) => {
    if (!contactId) return;
    if (selectedQueue === "" && user?.profile !== "admin") {
      toast.error("Selecione um setor");
      return;
    }

    if (
      selectedWhats === "" &&
      selectedMeta === "" &&
      selectedWhatsApi === ""
    ) {
      toast.error("Selecione uma conexão");
      return;
    }

    let ticketExists;

    if (!group) {
      ticketExists = await getOpenTicket(
        selectedMeta,
        selectedContact.id,
        selectedWhats,
        user?.id,
        selectedWhatsApi
      );
    }

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
      const whatsApiId = selectedWhatsApi !== "" ? selectedWhatsApi : null;

      const { data: ticket } = await api.post("/tickets", {
        contactId: contactId,
        queueId,
        whatsId,
        whatsApiId,
        metaId,
        userId: user?.id,
        status: "open",
      });
      onClose(ticket);
      track(`Ticket Change`, {
        isGroup: group ? true : false,
        Action: `Create`,
      });
      history.push(`/tickets/${ticket.id}`);
    } catch (err) {
      console.log(err);
      const ticket = await getOpenTicket(
        null,
        selectedContact.id,
        selectedWhats || whatsApps[0].id,
        user?.id,
        selectedWhatsApi !== "" ? selectedWhatsApi : null
      );
      setExistingTickedId(ticket.id);
      setExistingTicketModalOpen(true);
      toastError(err);
      onClose();
    }
    setLoading(false);
  };

  const handleCloseContactForGroupModal = () => {
    setContactModalForGroupOpen(false);
  };

  const handleCloseGroupModal = () => {
    setGroupModalOpen(false);
    handleClose();
  };

  const handleSelectOption = (e, newValue) => {
    if (newValue?.number) {
      setSelectedContact(newValue);
    } else if (newValue?.name) {
      setNewContact({ name: newValue.name });
      setContactModalOpen(true);
    }
  };

  const handleCloseContactModal = () => {
    setContactModalOpen(false);
  };

  const handleAddNewContactTicket = (contact) => {
    setOptions(contact);
    renderOption(contact);
    renderOptionLabel(contact);
    setSearchParam(`${contact.name} - ${contact.number}`);
    setSelectedContact(contact);
  };

  const createAddContactOption = (filterOptions, params) => {
    const filtered = filter(filterOptions, params);

    if (params.inputValue !== "" && !loading && searchParam.length >= 3) {
      filtered.push({
        name: `${params.inputValue}`,
      });
    }

    return filtered;
  };

  const renderOption = (option) => {
    const isMeta =
      option.channel === "facebook" || option.channel === "instagram";
    if (option.number) {
      return `${option.name} - ${isMeta ? option.channel : option.number}`;
    } else {
      return `${i18n.t("newTicketModal.add")} ${option.name}`;
    }
  };

  const renderOptionLabel = (option) => {
    if (option.number) {
      const isMeta =
        option.channel === "facebook" || option.channel === "instagram";
      setIsMeta(isMeta);
      return `${option.name} - ${isMeta ? option.channel : option.number}`;
    } else {
      return `${option.name}`;
    }
  };

  const renderContactAutocomplete = () => {
    if (initialContact === undefined || initialContact.id === undefined) {
      return (
        <Grid xs={12} item>
          <Autocomplete
            fullWidth
            options={options}
            loading={loading}
            clearOnBlur
            autoHighlight
            freeSolo
            clearOnEscape
            getOptionLabel={renderOptionLabel}
            renderOption={renderOption}
            filterOptions={createAddContactOption}
            onChange={(e, newValue) => handleSelectOption(e, newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={i18n.t("newTicketModal.fieldLabel")}
                variant="outlined"
                autoFocus
                onChange={(e) => setSearchParam(e.target.value)}
                onKeyPress={(e) => {
                  if (loading || !selectedContact) return;
                  else if (e.key === "Enter") {
                    handleSaveTicket(selectedContact.id);
                  }
                }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
        </Grid>
      );
    }
    return null;
  };

  return (
    <>
      <GroupModal
        open={groupModalOpen}
        initialValues={listSelectd}
        onClose={handleCloseGroupModal}
        onSave={handleSaveTicket}
        whatsappId={selectedWhats}
      />
      <ContactModalForGroup
        open={contactModalForGroupOpen}
        initialValues={newContactForGroup}
        onClose={handleCloseContactForGroupModal}
        onSave={handleListSelectd}
        newTicketModalProps={{
          newTicketModalStatus: modalOpen,
          newTicketModalClose: onClose,
        }}
      />
      <ContactModal
        open={contactModalOpen}
        initialValues={newContact}
        onClose={() => {
          setExistingTicketModalOpen(false);
          handleCloseContactModal();
          // handleClose();
        }}
        onSave={handleAddNewContactTicket}
        newTicketModalProps={{
          newTicketModalStatus: modalOpen,
          newTicketModalClose: onClose,
        }}
      ></ContactModal>

      <ExistingTicketModal
        modalOpen={existingTicketModalOpen}
        onClose={() => {
          setExistingTicketModalOpen(false);
          handleCloseContactModal();
          handleClose();
        }}
        ticketId={existingTickedId}
        newTicketModalProps={{
          newTicketModalStatus: modalOpen,
          newTicketModalClose: onClose,
        }}
      />

      <Dialog open={modalOpen} onClose={handleClose}>
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-around",
          }}
        >
          <DialogTitle
            onClick={() => {
              setOptions([]);
              setListSelectd([]);
              setChoiceInput("ticket");
            }}
            style={{
              cursor: "pointer",
              color: choiceInput === "group" ? "gray" : "black",
            }}
            id="form-dialog-title"
          >
            {i18n.t("newTicketModal.title")}
          </DialogTitle>
          <DialogTitle
            id="form-dialog-title"
            style={{
              cursor: "pointer",
              color: choiceInput === "ticket" ? "gray" : "black",
            }}
            onClick={() => {
              setOptions([]);
              setChoiceInput("group");
            }}
          >
            Criar Grupo
          </DialogTitle>
        </div>
        {choiceInput === "ticket" ? (
          <>
            <DialogContent dividers>
              <Grid style={{ width: 300 }} container spacing={2}>
                {renderContactAutocomplete()}
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
                      user?.queues.map((queue, key) => {
                        if (!queue.deleted)
                          return (
                            <MenuItem dense key={key} value={queue.id}>
                              <ListItemText primary={queue.name} />
                            </MenuItem>
                          );
                      })}
                  </Select>
                  <Select
                    disabled={selectedMeta || selectedWhatsApi || isMeta}
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
                      const whats = whatsApps.find(
                        (w) => w.id === selectedWhats
                      );
                      return whats.name;
                    }}
                  >
                    <MenuItem dense value={""}>
                      <ListItemText primary={"Sem Whatsapp"} />
                    </MenuItem>
                    {user &&
                      user?.whatsapps
                        .filter((whats) => whats.status !== "INATIVE")
                        .map((whats, key) => (
                          <MenuItem dense key={key} value={whats.id}>
                            <ListItemText primary={whats.name} />
                          </MenuItem>
                        ))}
                  </Select>
                  <Select
                    disabled={selectedMeta || selectedWhats || isMeta}
                    fullWidth
                    displayEmpty
                    variant="outlined"
                    value={selectedWhatsApi}
                    onChange={(e) => {
                      setSelectedWhatsApi(e.target.value);
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
                      if (selectedWhatsApi === "") {
                        return "Selecione um Whatsapp Api";
                      }
                      const whats = whatsAppApis.find(
                        (w) => w.id === selectedWhatsApi
                      );
                      return whats.name;
                    }}
                  >
                    <MenuItem dense value={""}>
                      <ListItemText primary={"Sem Whatsapp"} />
                    </MenuItem>
                    {user &&
                      user?.whatsappApis.map((whats, key) => (
                        <MenuItem dense key={key} value={whats.id}>
                          <ListItemText primary={whats.name} />
                        </MenuItem>
                      ))}
                  </Select>
                  <Select
                    disabled={selectedWhats || selectedWhatsApi || !isMeta}
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
                      user?.metas
                        .filter((meta) => meta.status !== "INATIVE")
                        .map((meta, key) => (
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
                  (selectedWhats === "" &&
                    selectedMeta === "" &&
                    selectedWhatsApi === "")
                }
                onClick={() => handleSaveTicket(selectedContact.id)}
                color="primary"
                loading={loading}
              >
                {i18n.t("newTicketModal.buttons.ok")}
              </ButtonWithSpinner>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogContent dividers>
              <Grid style={{ width: 300 }} container spacing={2}>
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
                      user?.queues.map((queue, key) => {
                        if (!queue.deleted)
                          return (
                            <MenuItem dense key={key} value={queue.id}>
                              <ListItemText primary={queue.name} />
                            </MenuItem>
                          );
                      })}
                  </Select>
                  <Select
                    disabled={selectedMeta ? true : false || isMeta}
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
                      const whats = whatsApps.find(
                        (w) => w.id === selectedWhats
                      );
                      return whats.name;
                    }}
                  >
                    <MenuItem dense value={""}>
                      <ListItemText primary={"Sem Whatsapp"} />
                    </MenuItem>
                    {user &&
                      user.whatsapps
                        ?.filter((whats) => whats.status !== "INATIVE")
                        .map((whats, key) => (
                          <MenuItem dense key={key} value={whats.id}>
                            <ListItemText primary={whats.name} />
                          </MenuItem>
                        ))}
                  </Select>
                </Grid>
              </Grid>
            </DialogContent>
            <div
              style={{
                display: openTextBox ? "none" : "flex",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <AddIcon
                onClick={() => setOpenTextBox(true)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                style={{
                  display: openTextBox && "none",
                  cursor: isHovering && "pointer",
                }}
              />
              <p style={{ display: openTextBox && "none" }}>
                total adicionado: {listSelectd.length}
              </p>
            </div>
            {openTextBox && (
              <>
                <DialogContent dividers>
                  <Autocomplete
                    options={options}
                    loading={loading}
                    style={{ width: 300 }}
                    clearOnBlur
                    autoHighlight
                    freeSolo
                    clearOnEscape
                    getOptionLabel={renderOptionLabel}
                    renderOption={renderOption}
                    filterOptions={createAddContactOption}
                    onChange={(e, newValue) => {
                      handleListSelectd(e, newValue);
                      setOpenTextBox(false);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={i18n.t("newTicketModal.fieldLabel")}
                        variant="outlined"
                        autoFocus
                        onChange={(e) => setSearchParam(e.target.value)}
                        onKeyPress={(e) => {
                          if (loading || !selectedContact) return;
                          else if (e.key === "Enter") {
                            handleSaveTicket(selectedContact.id);
                          }
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <React.Fragment>
                              {loading ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </React.Fragment>
                          ),
                        }}
                      />
                    )}
                  />
                  <p>total adicionado: {listSelectd.length}</p>
                </DialogContent>
              </>
            )}
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
                disabled={listSelectd.length === 0 || selectedWhats <= 0}
                onClick={() => setGroupModalOpen(true)}
                color="primary"
                loading={loading}
              >
                Avançar
              </ButtonWithSpinner>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default NewTicketModal;
