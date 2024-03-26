import React, { useState, useEffect, useContext } from "react";

import {
  FormControlLabel,
  IconButton,
  Switch,
  TextField,
  Tooltip,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Check from "@material-ui/icons/CheckCircle";
import DeleteIcon from "@material-ui/icons/Delete";
import Report from "@material-ui/icons/Report";
import RestoreIcon from "@material-ui/icons/Restore";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import { toast } from "react-toastify";

import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import CustomFileViewer from "../CustomFileViewer";
import DefaultWildCardsDisplay from "../DefaultWildCardsDisplay";
import { useStyles } from "./styles";
import { useAuthContext } from "../../context/Auth/AuthContext";

const DisparadorModal = ({ disparador, open, onClose, getDisparadores }) => {
  const { track } = useAuthContext();

  const classes = useStyles();
  const { whatsApps } = useContext(WhatsAppsContext);
  const day = dayjs();
  const [dateInfo, timeInfo] = disparador?.date
    ? disparador.date.split(" ")
    : [];

  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [contacts, setContacts] = useState("");
  const [message, setMessage] = useState("");
  const [selectedQueue, setSelectedQueue] = useState("");
  const [selectedWhatsapp, setSelectedWhatsapp] = useState("");
  const [createTicket, setCreateTicket] = useState("");
  const [media, setMedia] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [queues, setQueues] = useState([]);
  const [interval, setInterval] = useState(3);

  const isButtonDisabled = !(
    name &&
    contacts &&
    (message || media || mediaUrl) &&
    selectedWhatsapp &&
    selectedQueue
  );

  const handleSetTime = (e) => {
    const arrayTime = e.target.value.split(":");
    let newHour = Number(arrayTime[0]);
    let newMinute = Number(arrayTime[1]);
    const nowHour = dayjs().get("hour");
    const nowMinute = dayjs().get("minute");

    if (date === day.format("YYYY-MM-DD")) {
      if (newHour < nowHour) {
        newHour = nowHour;
      }
      if (newHour === nowHour && newMinute < nowMinute) {
        newMinute = nowMinute;
      }
    }

    setTime(
      `${newHour < 10 ? "0" + newHour : newHour}:${
        newMinute < 10 ? "0" + newMinute : newMinute
      }`
    );
  };

  const handleSwitch = (value) => {
    setCreateTicket(value);
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) {
      return;
    }

    const selectedMedia = e.target.files[0];

    selectedMedia.nameMedia = e.target.name;
    setMedia(selectedMedia);
  };

  const cleanForm = () => {
    setName("");
    setContacts("");
    setMessage("");
    setMedia("");
    setMediaUrl("");
    setDate("");
    setTime("");
  };

  const handleClose = () => {
    onClose();
  };

  const createDisparador = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("date", date);
    formData.append("time", time);
    formData.append("interval", interval);
    formData.append("name", name);
    formData.append("contacts", contacts);
    formData.append("message", message);
    formData.append("medias", media);
    formData.append(
      "whatsappId",
      selectedWhatsapp === "" ? null : selectedWhatsapp
    );
    formData.append("queueId", selectedQueue === "" ? null : selectedQueue);
    formData.append("createTicket", createTicket ? true : false);

    try {
      formData.append("disparadorMedia", media.name || mediaUrl);
    } catch {
      console.log("Sem Media");
    }
    if (mediaUrl === "" && !media.name) formData.set("disparadorMedia", "");

    try {
      if (disparador) {
        await api.put(`/disparador/${disparador.id}`, formData);
        toast.success("Disparador atualizado com sucesso");
      } else {
        await api.post("/disparador", formData);
        track("Trigger Change", {
          Contacts: contacts.split("\n").length,
          Action: "Create",
        });
        toast.success("Disparador criado com sucesso");
      }
    } catch (err) {
      toastError(err);
    }
    getDisparadores();
    handleClose();
    cleanForm();
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/queue");
        setQueues(data);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  useEffect(() => {
    if (open === true && disparador) {
      setName(disparador?.name);
      setContacts(disparador.contacts);
      setMessage(disparador.message);
      setSelectedWhatsapp(disparador.whatsappId);
      setSelectedQueue(disparador.queueId);
      setCreateTicket(disparador.createTicket);
      setInterval(disparador.interval);
      setDate(dateInfo);
      setTime(timeInfo);
      setMediaUrl(disparador.mediaUrl);
    } else {
      cleanForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
      <DialogTitle id="form-dialog-title">Criar Disparador</DialogTitle>

      <DefaultWildCardsDisplay displayValues={["cliente", "número", "email"]} />

      <Formik>
        <Form onSubmit={createDisparador} encType="multipart/form-data">
          <DialogContent dividers className={classes.disparadorContentWrapper}>
            <div className={classes.dateTimeWrapper}>
              <TextField
                style={{ width: "50%" }}
                variant="outlined"
                id="date"
                label="Data"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                style={{ width: "40%" }}
                variant="outlined"
                id="time"
                label="Hora"
                type="time"
                value={time}
                onChange={handleSetTime}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                style={{ width: "20%" }}
                variant="outlined"
                id="interval"
                label="Intervalo (s)"
                type="number"
                value={interval}
                inputProps={{ min: 2 }}
                onChange={(e) => setInterval(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <Tooltip title="Limpar Data e intervalo">
                <IconButton
                  size="small"
                  onClick={() => {
                    setDate("");
                    setTime("");
                    setInterval(3);
                  }}
                >
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            </div>

            {disparador?.lastDate && (
              <div className={classes.lastSchedule}>
                <span>
                  Último agendamento:{" "}
                  <b>
                    {dayjs(disparador.lastDate).format(
                      i18n.t("schedules.date.format")
                    )}
                  </b>
                </span>
                <span className={classes.status}>
                  Status:&nbsp;
                  <b>{i18n.t(`schedules.status.${disparador.lastStatus}`)}</b>
                  &nbsp;
                  {disparador.lastStatus === "sent" ? (
                    <Check
                      fontSize="small"
                      style={{ color: "#00B050", opacity: 0.64 }}
                    />
                  ) : (
                    <Report
                      fontSize="small"
                      style={{ color: "#FF0000", opacity: 0.64 }}
                    />
                  )}
                </span>
              </div>
            )}
            <FormControl variant="outlined">
              <TextField
                required
                id="name"
                name="name"
                label="Nome do Disparador"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>

            <FormControl variant="outlined">
              <TextField
                required
                id="contacts"
                name="contacts"
                label="Contatos"
                multiline
                value={contacts}
                onChange={(e) => setContacts(e.target.value)}
              />
            </FormControl>

            <FormControl variant="outlined">
              <TextField
                id="message"
                name="message"
                label="Mensagem"
                multiline
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "16px",
                }}
              >
                <input
                  name="mediaHeader"
                  type="file"
                  onChange={handleChangeMedias}
                  style={{
                    color: "transparent",
                    overflow: "hidden",
                  }}
                />
                <Tooltip title="Remover mídia">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setMedia("");
                      setMediaUrl("");
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </div>

              <div>
                {mediaUrl && (
                  <CustomFileViewer imageUrl={mediaUrl} previousMedia={true} />
                )}

                {media && (
                  <CustomFileViewer
                    imageUrl={URL.createObjectURL(media)}
                    name={media?.name || media}
                  />
                )}
              </div>
            </FormControl>

            <FormControl variant="outlined">
              <InputLabel id="conexao-label">Conexão</InputLabel>
              <Select
                required
                id="whatsappId"
                name="whatsappId"
                value={selectedWhatsapp}
                onChange={(e) => setSelectedWhatsapp(e.target.value)}
                labelId="conexao-label"
              >
                {whatsApps.map((whasapp) => (
                  <MenuItem key={whasapp.id} value={whasapp.id}>
                    {whasapp?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="outlined">
              <InputLabel id="fila-label">Setor</InputLabel>
              <Select
                required
                id="queueId"
                name="queueId"
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                labelId="fila-label"
              >
                {queues.map((queue) => (
                  <MenuItem key={queue.id} value={queue.id}>
                    {queue?.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              style={{ alignSelf: "start" }}
              control={
                <Switch
                  id="createTicket"
                  name="createTicket"
                  checked={createTicket}
                  onChange={(e) => handleSwitch(e.target.checked)}
                  inputProps={{ "aria-label": "controlled" }}
                />
              }
              label="Criar Ticket"
            />
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
              disabled={isButtonDisabled}
            >
              {disparador ? "Atualizar" : "Criar"}
            </ButtonWithSpinner>
          </DialogActions>
        </Form>
      </Formik>
    </Dialog>
  );
};

export default DisparadorModal;
