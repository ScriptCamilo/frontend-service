import React, { useEffect, useRef, useState } from "react";

import {
  Box,
  Checkbox,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Switch,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import TextField from "@material-ui/core/TextField";
import { Colorize } from "@material-ui/icons";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import { toast } from "react-toastify";

import { useAuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ColorPicker from "../ColorPicker";
import MotiveModal from "../MotiveModal";
import { useStyles } from "./styles";
// import useMixpanel from "../../hooks/useMixpanel";

const week = [
  { value: "Domingo", id: "sunday" },
  { value: "Segunda-feira", id: "monday" },
  { value: "Terça-feira", id: "tuesday" },
  { value: "Quarta-feira", id: "wednesday" },
  { value: "Quinta-feira", id: "thursday" },
  { value: "Sexta-feira", id: "friday" },
  { value: "Sábado", id: "saturday" },
];

const weekState = {
  sunday: {
    day: "sunday",
    open: "00:00",
    close: "23:59",
    startInterval: "00:00",
    endInterval: "00:00",
    closed: false,
  },
  monday: {
    day: "monday",
    open: "00:00",
    close: "23:59",
    startInterval: "00:00",
    endInterval: "00:00",
    closed: false,
  },
  tuesday: {
    day: "tuesday",
    open: "00:00",
    close: "23:59",
    startInterval: "00:00",
    endInterval: "00:00",
    closed: false,
  },
  wednesday: {
    day: "wednesday",
    open: "00:00",
    close: "23:59",
    startInterval: "00:00",
    endInterval: "00:00",
    closed: false,
  },
  thursday: {
    day: "thursday",
    open: "00:00",
    close: "23:59",
    startInterval: "00:00",
    endInterval: "00:00",
    closed: false,
  },
  friday: {
    day: "friday",
    open: "00:00",
    close: "23:59",
    startInterval: "00:00",
    endInterval: "00:00",
    closed: false,
  },
  saturday: {
    day: "saturday",
    open: "00:00",
    close: "23:59",
    startInterval: "00:00",
    endInterval: "00:00",
    closed: false,
  },
};

const initialState = {
  name: "",
  color: "",
  absenceMessage: "",
  autoFinishSeconds: "",
  autoFinishMessage: "",
};

const QueueModal = ({ open, onClose, queueId, setQueuesCount }) => {
  const classes = useStyles();
  const absenceRef = useRef();
  const { getQueues, track } = useAuthContext();

  const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
  const [queue, setQueue] = useState(initialState);
  const [motives, setMotives] = useState([]);
  const [openMotive, setMotiveOpen] = useState(false);
  const [selectedMotive, setSelectedMotive] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [weekDays, setWeekDays] = useState(weekState);
	const [previousWeekDays, setPreviousWeekDays] = useState(weekState);
  const [autoFinish, setAutoFinish] = useState(false);

  const isSecondsInvalid = autoFinish && queue.autoFinishSeconds < 1;

  const handleQueueChange = (e) => {
    const target = e.target;
    const value = target.value;
    const name = target?.name;

    setQueue(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCloseMotiveModal = () => {
    setMotiveOpen(false);
  };

  const handleAutoFinishSwitch = () => {
		setAutoFinish(prevState => {
			if (!prevState) {
				track('Auto Finalize Use');
			}
			return !prevState
		})
  };

  const handleClose = () => {
    onClose();
    setQueue(initialState);
    setTabIndex(0);
    setWeekDays(weekState);
    setAutoFinish(false);
  };

  const handleSaveQueue = async (e) => {
    e.preventDefault();
    const values = {
      ...queue,
      autoFinishSeconds: autoFinish ? +queue.autoFinishSeconds : null,
      autoFinishMessage: autoFinish ? queue.autoFinishMessage : undefined,
    };

    try {
      if (queueId) {
        await api.put(`/queue/${queueId}`, { values, weekDays });
				if (JSON.stringify(weekDays) !== JSON.stringify(previousWeekDays)) {
					track('Opening Hours Change', {
						"Action": "Update",
					});
				}
        getQueues();
      } else {
        await api.post("/queue", { values, weekDays });
				track('Sector Change', {
					"Action": "Create",
				});
        getQueues();
				setQueuesCount((prevState) => prevState + 1);
      }
      toast.success(`Setor atualizado com sucesso!`);
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const deleteMotive = async (motiveId) => {
    try {
      await api.delete(`/motive/${motiveId}`);
      toast.success(`Motivo deletado com sucesso!`);
      setMotives(motives.filter((motive) => motive.id !== motiveId));
    } catch (err) {
      toastError(err);
    }
  };

  const addMotive = async (motive) => {
    try {
      await api.post(`/queue/motive/${queueId}/${motive}`);
      toast.success(`Motivo adicionado com sucesso!`);
    } catch (err) {
      toastError(err);
    }
  };

  const removeMotive = async (motive) => {
    try {
      await api.delete(`/queue/motive/${queueId}/${motive}`);
      toast.success(`Motivo removido com sucesso!`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    const getDays = async (days) => {
      setWeekDays({
        sunday: days.find((day) => day.day === "sunday") || weekState.sunday,
        monday: days.find((day) => day.day === "monday") || weekState.monday,
        tuesday: days.find((day) => day.day === "tuesday") || weekState.tuesday,
        wednesday:
          days.find((day) => day.day === "wednesday") || weekState.wednesday,
        thursday:
          days.find((day) => day.day === "thursday") || weekState.thursday,
        friday: days.find((day) => day.day === "friday") || weekState.friday,
        saturday:
          days.find((day) => day.day === "saturday") || weekState.saturday,
      });
      setPreviousWeekDays({
				sunday: days.find((day) => day.day === "sunday") || weekState.sunday,
        monday: days.find((day) => day.day === "monday") || weekState.monday,
        tuesday: days.find((day) => day.day === "tuesday") || weekState.tuesday,
        wednesday:
          days.find((day) => day.day === "wednesday") || weekState.wednesday,
        thursday:
          days.find((day) => day.day === "thursday") || weekState.thursday,
        friday: days.find((day) => day.day === "friday") || weekState.friday,
        saturday:
          days.find((day) => day.day === "saturday") || weekState.saturday,
			})
    };
    (async () => {
      if (!queueId) return;
      try {
        const { data } = await api.get(`/queue/${queueId}`);
        setQueue((prevState) => ({ ...prevState, ...data }));
        setAutoFinish(Boolean(data.autoFinishSeconds));
        getDays(data.openHours);
        try {
          const { data: dataMotives } = await api.get(`/motive`);
          const allWithCheck = dataMotives.map((motive) => {
            return { ...motive, checked: false };
          });

          const selectedWithCheck = data?.motives.map((motive) => {
            return { ...motive, checked: true };
          });
          const motivesList = [
            ...allWithCheck.filter(
              (m) => !selectedWithCheck.map((mt) => mt.id).includes(m.id)
            ),
            ...selectedWithCheck,
          ];

          motivesList.sort(function (a, b) {
            var textA = a?.name.toUpperCase();
            var textB = b?.name.toUpperCase();
            return textA < textB ? -1 : textA > textB ? 1 : 0;
          });

          setMotives(motivesList);
        } catch (err) {
          toastError(err);
        }
      } catch (err) {
        toastError(err);
      }
    })();
  }, [queueId, open, openMotive]);

  return (
    <div className={classes.root}>
      <Dialog open={open} onClose={handleClose} scroll="paper" maxWidth="md">
        <MotiveModal
          open={openMotive}
          handleClose={handleCloseMotiveModal}
          setOpen={setMotiveOpen}
          selectedMotive={selectedMotive}
          setSelectedMotive={setSelectedMotive}
        />
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
        >
          <Tab
            label={
              queueId
                ? `${i18n.t("queueModal.title.edit")}`
                : `${i18n.t("queueModal.title.add")}`
            }
          />
          <Tab label="Horários de atendimento" />
        </Tabs>
        {tabIndex === 0 && (
          <form onSubmit={handleSaveQueue}>
            <DialogContent dividers>
              <TextField
                label={i18n.t("queueModal.form.name")}
                autoFocus
                name="name"
                id="name"
                value={queue?.name}
                onChange={handleQueueChange}
                variant="outlined"
                margin="dense"
                className={classes.textField}
              />
              <TextField
                label={i18n.t("queueModal.form.color")}
                name="color"
                id="color"
                value={queue.color}
                onFocus={() => {
                  setColorPickerModalOpen(true);
                  absenceRef.current.focus();
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <div
                        style={{ backgroundColor: queue.color }}
                        className={classes.colorAdorment}
                      ></div>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <IconButton
                      size="small"
                      color="default"
                      onClick={() => setColorPickerModalOpen(true)}
                    >
                      <Colorize />
                    </IconButton>
                  ),
                }}
                variant="outlined"
                margin="dense"
              />
              <ColorPicker
                open={colorPickerModalOpen}
                handleClose={() => setColorPickerModalOpen(false)}
                onChange={(color) => {
                  setQueue(() => {
                    return { ...queue, color };
                  });
                }}
              />
              <div>
                <TextField
                  label={i18n.t("queueModal.form.absenceMessage")}
                  type="absenceMessage"
                  multiline
                  inputRef={absenceRef}
                  minRows={2}
                  fullWidth
                  name="absenceMessage"
                  id="absenceMessage"
                  value={queue.absenceMessage}
                  onChange={handleQueueChange}
                  variant="outlined"
                  margin="dense"
                />
              </div>
              <div className={classes.autoFinishWrapper}>
                <FormControlLabel
                  label="Habilitar a finalização automática do ticket"
                  control={
                    <Switch
                      checked={autoFinish}
                      onChange={handleAutoFinishSwitch}
                      color="primary"
                      name="autoFinish"
                    />
                  }
                />

                {autoFinish ? (
                  <>
                    <TextField
                      label="Segundos"
                      onChange={handleQueueChange}
                      value={queue.autoFinishSeconds}
                      name="autoFinishSeconds"
                      margin="dense"
                      variant="outlined"
                      type="number"
                      className={classes.textField}
                      data-disabled={!autoFinish}
                      disabled={!autoFinish}
                    />

                    <TextField
                      id="autoFinishMessage"
                      name="autoFinishMessage"
                      label="Mensagem de Finalização Automática"
                      onChange={handleQueueChange}
                      value={queue.autoFinishMessage}
                      multiline
                      variant="outlined"
                      margin="dense"
                    />
                  </>
                ) : <div style={{ height: 40, margin: "8px 0px 4px 0px" }} />}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1em",
                }}
              >
                <InputLabel id="demo-multiple-chip-label">Motivos</InputLabel>
                <Select
                  multiple
                  labelId="motives-label"
                  id="motives-select"
                  label="Selecionar motivos"
                  placeholder="Motivos"
                  value={motives.map((m) =>
                    m.checked === true ? m?.name : null
                  )}
                  renderValue={() => (
                    <p style={{ width: "30vw", maxWidth: "280px" }}>
                      {motives
                        .filter((m) => m.checked)
                        .map((m) => m?.name)
                        .join(`, \n`)}
                    </p>
                  )}
                >
                  <MenuItem key={"create-motive"} value={"createMotive"}>
                    <ListItemText
                      primary={"Criar novo motivo"}
                      onClick={() => setMotiveOpen(true)}
                    />
                  </MenuItem>

                  {motives.map((motive) => (
                    <MenuItem key={motive.id} value={motive.id}>
                      <Checkbox
                        checked={motive.checked === true}
                        onClick={() => {
                          if (motive.checked === false) {
                            setMotives([
                              ...motives.filter((m) => m.id !== motive.id),
                              { ...motive, checked: true },
                            ]);
                            addMotive(motive.id);
                          } else {
                            setMotives([
                              ...motives.filter((m) => m.id !== motive.id),
                              { ...motive, checked: false },
                            ]);
                            removeMotive(motive.id);
                          }
                        }}
                      />
                      <ListItemText primary={motive?.name} />
                      <IconButton>
                        <EditIcon
                          onClick={() => {
                            setSelectedMotive(motive);
                            setMotiveOpen(true);
                          }}
                        />
                      </IconButton>
                      <IconButton>
                        <DeleteIcon onClick={() => deleteMotive(motive.id)} />
                      </IconButton>
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClose}
                color="secondary"
                variant="contained"
              >
                {i18n.t("queueModal.buttons.cancel")}
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                className={classes.btnWrapper}
                disabled={isSecondsInvalid}
              >
                {queueId
                  ? `${i18n.t("queueModal.buttons.okEdit")}`
                  : `${i18n.t("queueModal.buttons.okAdd")}`}
              </Button>
            </DialogActions>
          </form>
        )}
        {tabIndex === 1 && (
          <Box>
            <DialogContent dividers>
              {week.map((day, index) => (
                <div key={index}>
                  <TextField
                    InputProps={{ readOnly: true }}
                    name={day.id}
                    id={day.id}
                    margin="dense"
                    value={day.value}
                    className={classes.nameField}
                  />
                  <TextField
                    className={classes.formHours}
                    id={`start-${day.id}`}
                    label="Hora início"
                    name={`start-${day.id}`}
                    variant="outlined"
                    margin="dense"
                    type="time"
                    disabled={weekDays[day.id].closed}
                    value={
                      weekDays[day.id].closed ? "--:--" : weekDays[day.id].open
                    }
                    onChange={(e) => {
                      setWeekDays({
                        ...weekDays,
                        [day.id]: { ...weekDays[day.id], open: e.target.value },
                      });
                    }}
                  />
                  <TextField
                    className={classes.formHours}
                    id={`start-interval-${day.id}`}
                    label="Início intervalo"
                    name={`start-interval-${day.id}`}
                    margin="dense"
                    variant="outlined"
                    type="time"
                    disabled={weekDays[day.id].closed}
                    value={
                      weekDays[day.id].closed
                        ? "--:--"
                        : weekDays[day.id].startInterval
                    }
                    onChange={(e) => {
                      setWeekDays({
                        ...weekDays,
                        [day.id]: {
                          ...weekDays[day.id],
                          startInterval: e.target.value,
                        },
                      });
                    }}
                  />
                  <TextField
                    className={classes.formHours}
                    id={`end-interval-${day.id}`}
                    label="Fim intervalo"
                    name={`end-interval-${day.id}`}
                    margin="dense"
                    variant="outlined"
                    type="time"
                    disabled={weekDays[day.id].closed}
                    value={
                      weekDays[day.id].closed
                        ? "--:--"
                        : weekDays[day.id].endInterval
                    }
                    onChange={(e) => {
                      setWeekDays({
                        ...weekDays,
                        [day.id]: {
                          ...weekDays[day.id],
                          endInterval: e.target.value,
                        },
                      });
                    }}
                  />
                  <TextField
                    className={classes.formHours}
                    id={`close-${day.id}`}
                    label="Hora final"
                    name={`close-${day.id}`}
                    margin="dense"
                    variant="outlined"
                    type="time"
                    disabled={weekDays[day.id].closed}
                    value={
                      weekDays[day.id].closed ? "--:--" : weekDays[day.id].close
                    }
                    onChange={(e) => {
                      setWeekDays({
                        ...weekDays,
                        [day.id]: {
                          ...weekDays[day.id],
                          close: e.target.value,
                        },
                      });
                    }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={weekDays[day.id].closed}
                        onChange={(e) => {
                          setWeekDays({
                            ...weekDays,
                            [day.id]: {
                              ...weekDays[day.id],
                              closed: e.target.checked,
                            },
                          });
                        }}
                        color="primary"
                      />
                    }
                    label="Sem atendimento"
                  />
                </div>
              ))}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClose}
                color="secondary"
                variant="contained"
              >
                {i18n.t("queueModal.buttons.cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleSaveQueue}
                color="primary"
                variant="contained"
                className={classes.btnWrapper}
              >
                {queueId
                  ? `${i18n.t("queueModal.buttons.okEdit")}`
                  : `${i18n.t("queueModal.buttons.okAdd")}`}
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>
    </div>
  );
};

export default QueueModal;
