import React, { useState, useEffect, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Select,
  InputLabel,
  MenuItem,
  FormControl,
  TextField,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Box,
} from "@material-ui/core";

import { Visibility, VisibilityOff } from "@material-ui/icons";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";
import WhatsappSelect from "../WhatsappSelect";
import MetaSelect from "../MetaSelect";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import ChangeConfirmationModal from "../ChangeConfirmationModal";
import WhatsappApiSelect from "../WhatsappApiSelect";

// import Swal from "sweetalert2";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  formHours: {
    width: "110px",
    marginRight: "10px",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
    width: "20%",
  },
}));

const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  password: Yup.string().min(5, "Too Short!").max(50, "Too Long!"),
  email: Yup.string().email("Invalid email").required("Required"),
});

const week = [
  { value: "Domingo", id: "sunday" },
  { value: "Segunda-feira", id: "monday" },
  { value: "Terça-feira", id: "tuesday" },
  { value: "Quarta-feira", id: "wednesday" },
  { value: "Quinta-feira", id: "thursday" },
  { value: "Sexta-feira", id: "friday" },
  { value: "Sábado", id: "saturday" },
];

const UserModal = ({ open, onClose, userId }) => {
  const classes = useStyles();

  const initialState = {
    name: "",
    email: "",
    password: "",
    profile: "user",
    ramal: "#",
  };

  const weekState = {
    sunday: { day: "sunday", open: "00:00", close: "23:59", closed: false },
    monday: { day: "monday", open: "00:00", close: "23:59", closed: false },
    tuesday: { day: "tuesday", open: "00:00", close: "23:59", closed: false },
    wednesday: {
      day: "wednesday",
      open: "00:00",
      close: "23:59",
      closed: false,
    },
    thursday: { day: "thursday", open: "00:00", close: "23:59", closed: false },
    friday: { day: "friday", open: "00:00", close: "23:59", closed: false },
    saturday: { day: "saturday", open: "00:00", close: "23:59", closed: false },
  };

  const { user: loggedInUser, track } = useContext(AuthContext);

  const [user, setUser] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [selectedWhatsappIds, setSelectedWhatsappIds] = useState([]);
  const [selectedWhatsappApiIds, setSelectedWhatsappApiIds] = useState([]);
  const [selectedMetaIds, setSelectedMetaIds] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [whatsappId, setWhatsappId] = useState(false);
  const [metaId, setMetaId] = useState(false);
  const { whatsApps, loading, allMetas: metas } = useContext(WhatsAppsContext);

  const [tabIndex, setTabIndex] = useState(0);
  const [weekDays, setWeekDays] = useState(weekState);

  const [confirmChangePassword, setConfirmChangePassword] = useState(false);

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
    };
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const { data } = await api.get(`/users/${userId}`);
        setUser((prevState) => {
          return { ...prevState, ...data };
        });
        getDays(data.userHours);
        const userQueueIds = data.queues?.map((queue) => queue.id);
        const userWhatsappIds = data.whatsapps?.map((whats) => whats.id);
        const userWhatsappApiIds = data.whatsappApis?.map((whats) => whats.id);
        const userMetaIds = data.metas?.map((meta) => meta.id);
        setSelectedQueueIds(userQueueIds);
        setSelectedWhatsappIds(userWhatsappIds);
        setSelectedWhatsappApiIds(userWhatsappApiIds);
        setSelectedMetaIds(userMetaIds);
        setWhatsappId(data.whatsappId ? data.whatsappId : "");
        setMetaId(data.metaId ? data.metaId : "");
      } catch (err) {
        toastError(err);
      }
    };

    fetchUser();
  }, [userId, open]);

  const showBlock = () => {
    if (user.id === 1) return false;
    if (loggedInUser.profile !== "admin") return false;
    if (user.id === loggedInUser.id) return false;
    if (!userId) return false;

    if (!user.active) return "unblock";
    return "block";
  };

  const handleClose = () => {
    onClose();
    setUser(initialState);
    setTabIndex(0);
    setConfirmChangePassword(false);
  };

  const validateForm = () => {
    const emailRegex = /\S+@\S+\.\S+/;
    let name = true,
      password = true,
      email = true;
    if (user.name.length < 2) {
      name = false;
      toast.error("Nome muito curto!");
    } else if (user.name.length > 50) {
      name = false;
      toast.error("Nome muito longo! O máximo permitido são 50 caracteres.");
    }
    if (user.password.length > 0 && user.password.length < 5) {
      password = false;
      toast.error("Senha muito curta");
    } else if (user.password.length > 50) {
      password = false;
      toast.error("Senha muito longa! O máximo permitido são 50 caracteres.");
    }
    if (!emailRegex.test(user.email)) {
      email = false;
      toast.error("E-mail inválido!");
    }
    return name && password && email;
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const userData = {
      ...user,
      whatsappId,
      queueIds: selectedQueueIds,
      whatsappIds: selectedWhatsappIds,
      whatsappApiIds: selectedWhatsappApiIds,
      metaIds: selectedMetaIds,
      metaId,
      ramal:
        user.ramal && user.ramal[0] === "#" ? user.ramal : `#${user.ramal}`,
    };

    if (userData.password.length > 0 && !confirmChangePassword) {
      setConfirmChangePassword(true);
      return;
    }

    if (userData.password.length === 0) {
      delete userData.password;
    }

    try {
      if (userId) {
        await api.put(`/users/${userId}`, { userData, weekDays });
        track("User Change", {
          Action: "Update",
        });
      } else {
        await api.post("/users", { userData, weekDays });
        track("User Change", {
          Action: "Create",
        });
      }
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  const handleBlockUser = async (action) => {
    try {
      await api.patch(`/users/${userId}`);
      if (action === "block") toast.success(i18n.t("userModal.block"));
      if (action === "unblock") toast.success(i18n.t("userModal.unblock"));
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <div className={classes.root}>
      <ChangeConfirmationModal
        open={confirmChangePassword}
        onSave={handleSaveUser}
        onClose={handleClose}
      />
      <Dialog open={open} onClose={handleClose} maxWidth="md" scroll="paper">
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
        >
          <Tab
            label={
              userId
                ? `${i18n.t("userModal.title.edit")}`
                : `${i18n.t("userModal.title.add")}`
            }
          />
          {loggedInUser.profile === "admin" && (
            <Tab label="Horários de Acesso" />
          )}
        </Tabs>
        {tabIndex === 0 && (
          <form onSubmit={handleSaveUser}>
            <DialogContent dividers>
              <div className={classes.multFieldLine}>
                <TextField
                  label={i18n.t("userModal.form.name")}
                  autoFocus
                  name="name"
                  id="name"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                />
                <TextField
                  name="password"
                  id="password"
                  value={user.password}
                  onChange={(e) =>
                    setUser({ ...user, password: e.target.value })
                  }
                  variant="outlined"
                  margin="dense"
                  label={i18n.t("userModal.form.password")}
                  type={showPassword ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((e) => !e)}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </div>
              <div className={classes.multFieldLine}>
                <TextField
                  label={i18n.t("userModal.form.email")}
                  name="email"
                  id="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                />
                <TextField
                  label="Ramal"
                  id="userRamalInput"
                  name="ramal"
                  value={user.ramal}
                  onChange={(e) => setUser({ ...user, ramal: e.target.value })}
                  variant="outlined"
                  margin="dense"
                  fullWidth
                />
                <FormControl
                  variant="outlined"
                  className={classes.formControl}
                  margin="dense"
                >
                  <Can
                    role={loggedInUser.profile}
                    perform="user-modal:editProfile"
                    yes={() => (
                      <>
                        <InputLabel id="profile-selection-input-label">
                          {i18n.t("userModal.form.profile")}
                        </InputLabel>

                        <Select
                          label={i18n.t("userModal.form.profile")}
                          name="profile"
                          labelId="profile-selection-label"
                          id="profile-selection"
                          required
                          value={user.profile}
                          onChange={(e) =>
                            setUser({ ...user, profile: e.target.value })
                          }
                        >
                          <MenuItem value="admin">Administrador</MenuItem>
                          <MenuItem value="user">Atendente</MenuItem>
                          <MenuItem value="supervisor">Supervisor</MenuItem>
                        </Select>
                      </>
                    )}
                  />
                </FormControl>
              </div>
              <Can
                role={loggedInUser.profile}
                perform="user-modal:editQueues"
                yes={() => (
                  <QueueSelect
                    selectedQueueIds={selectedQueueIds}
                    onChange={(values) => setSelectedQueueIds(values)}
                  />
                )}
              />
              <Can
                role={loggedInUser.profile}
                perform="user-modal:editQueues"
                yes={() => (
                  <WhatsappSelect
                    selectedWhatsappIds={selectedWhatsappIds}
                    onChange={(values) => setSelectedWhatsappIds(values)}
                  />
                )}
              />
              <Can
                role={loggedInUser.profile}
                perform="user-modal:editQueues"
                yes={() => (
                  <WhatsappApiSelect
                    selectedWhatsappIds={selectedWhatsappApiIds}
                    onChange={(values) => setSelectedWhatsappApiIds(values)}
                  />
                )}
              />
              <Can
                role={loggedInUser.profile}
                perform="user-modal:editQueues"
                yes={() => (
                  <MetaSelect
                    selectedMetaIds={selectedMetaIds}
                    onChange={(values) => setSelectedMetaIds(values)}
                  />
                )}
              />
              <Can
                role={loggedInUser.profile}
                perform="user-modal:editQueues"
                yes={() =>
                  !loading && (
                    <FormControl
                      variant="outlined"
                      margin="dense"
                      className={classes.maxWidth}
                      fullWidth
                    >
                      <InputLabel>
                        {i18n.t("userModal.form.whatsapp")}
                      </InputLabel>
                      <Select
                        value={whatsappId}
                        onChange={(e) => setWhatsappId(e.target.value)}
                        label={i18n.t("userModal.form.whatsapp")}
                      >
                        <MenuItem value={""}>&nbsp;</MenuItem>
                        {whatsApps
                          .filter((whatsapp) => whatsapp.status !== "INATIVE")
                          .map((whatsapp) => (
                            <MenuItem key={whatsapp.id} value={whatsapp.id}>
                              {whatsapp.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  )
                }
              />
              <Can
                role={loggedInUser.profile}
                perform="user-modal:editQueues"
                yes={() =>
                  !loading && (
                    <FormControl
                      variant="outlined"
                      margin="dense"
                      className={classes.maxWidth}
                      fullWidth
                    >
                      <InputLabel>{"Página Padrão"}</InputLabel>
                      <Select
                        value={metaId}
                        onChange={(e) => setMetaId(e.target.value)}
                        label={"Página em uso"}
                      >
                        <MenuItem value={""}>&nbsp;</MenuItem>
                        {metas
                          .filter((meta) => meta.status !== "INATIVE")
                          .map((meta) => (
                            <MenuItem key={meta.id} value={meta.id}>
                              {meta.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  )
                }
              />
              {showBlock() && (
                <Button
                  onClick={
                    showBlock() === "block"
                      ? () => handleBlockUser("block")
                      : () => handleBlockUser("unblock")
                  }
                  color={showBlock() === "block" ? "secondary" : "primary"}
                  variant="contained"
                >
                  {showBlock() === "block"
                    ? i18n.t("userModal.buttons.block")
                    : i18n.t("userModal.buttons.unblock")}
                </Button>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClose}
                color="secondary"
                variant="contained"
              >
                {i18n.t("userModal.buttons.cancel")}
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                className={classes.btnWrapper}
              >
                {userId
                  ? `${i18n.t("userModal.buttons.okEdit")}`
                  : `${i18n.t("userModal.buttons.okAdd")}`}
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
                    className={classes.textField}
                    disabled={weekDays[day.id].closed}
                  />
                  <TextField
                    className={classes.formHours}
                    id={`start-${day.id}`}
                    label="Hora início"
                    name={`start-${day.id}`}
                    variant="outlined"
                    margin="dense"
                    type={weekDays[day.id].closed ? "string" : "time"}
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
                    id={`close-${day.id}`}
                    label="Hora final"
                    name={`close-${day.id}`}
                    margin="dense"
                    variant="outlined"
                    type={weekDays[day.id].closed ? "string" : "time"}
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
                    label="Sem acesso"
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
                {i18n.t("userModal.buttons.cancel")}
              </Button>
              <Button
                type="button"
                onClick={handleSaveUser}
                color="primary"
                variant="contained"
                className={classes.btnWrapper}
              >
                {userId
                  ? `${i18n.t("userModal.buttons.okEdit")}`
                  : `${i18n.t("userModal.buttons.okAdd")}`}
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>
    </div>
  );
};

export default UserModal;
