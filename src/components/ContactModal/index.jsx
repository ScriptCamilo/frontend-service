import React, { useEffect, useRef, useState } from "react";

import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { Field, FieldArray, Form, Formik } from "formik";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import * as Yup from "yup";

import { useAuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import checkContactExists from "../../helpers/checkContactExists";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import CountryCodePhoneInput from "../CountryCodePhoneInput";
import ExistingTicketModal from "../ExistingTicketModal";
import NewTicketModalForSelectedContact from "../NewTicketModalForSelectedContact";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },

  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
}));

const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Nome Muito Curto!")
    .max(50, "Nome Muito Longo!")
    .required("O Nome é Obrigatório"),
  number: Yup.string()
    .min(11, "Número Incompleto")
    .max(30, "Número Muito Longo")
    .required("O Número é Obrigatório"),
  email: Yup.string().email("E-mail Inválido"),
});

const initialContactState = {
  name: "",
  number: "",
  email: "",
  channel: "",
};

const ContactModal = ({
  open,
  onClose,
  contactId,
  initialValues,
  onSave,
  newTicketModalProps,
  setCountContacts,
}) => {
  const history = useHistory();
  const classes = useStyles();
  const isMounted = useRef(true);
  const { user } = useAuthContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoPush, setAutoPush] = useState(true);
  const [defaultKeys, setDefaultKeys] = useState([]);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [existingTicketModalOpen, setExistingTicketModalOpen] = useState(false);
  const [existingTickedId, setExistingTickedId] = useState(0);
  const [existingContact, setExistingContact] = useState({});
  const [contact, setContact] = useState(initialContactState);

  const handleClose = () => {
    onClose();
    setContact(initialContactState);
  };

  const handleContactExists = async (values) => {
    try {
      const contactExists = await checkContactExists(values);

      // const openTicket = await getOpenTicket(contactExists.id, user.whatsappId, user.id);

      // if (openTicket) {
      // 	setExistingTickedId(openTicket.id);
      // 	setExistingTicketModalOpen(true)
      // 	setIsSubmitting(false);
      // 	return;
      // }

      setExistingContact(contactExists);
      setNewTicketModalOpen(true);
      newTicketModalProps.newTicketModalStatus &&
        newTicketModalProps.newTicketModalClose();
      handleClose();

      setIsSubmitting(false);
    } catch (err) {
      // toastError(err);
      setIsSubmitting(false);
    }
  };

  const handleSaveContact = async (values) => {
    setIsSubmitting(true);
    try {
      if (contactId) {
        await api.put(`/contacts/${contactId}`, values);
        handleClose();
        toast.success(i18n.t("contactModal.success"));
        setIsSubmitting(false);
      } else {
        const { data } = await api.post("/contacts", values);
        if (setCountContacts) {
          setCountContacts((prevState) => prevState + 1);
        }
        if (onSave) {
          onSave(data);
        }
        handleClose();
        toast.success(i18n.t("contactModal.success"));
        setIsSubmitting(false);
        return data;
      }
    } catch (err) {
      if (err.response?.data?.error === "ERR_DUPLICATED_CONTACT") {
        handleContactExists(values);
        setIsSubmitting(false);
        return undefined;
      }

      if (err.response?.data?.error === "ERR_NO_DEF_WAPP_FOUND") {
        toast.error("Nenhum WhatsApp marcado como padrão");
        setIsSubmitting(false);
        return undefined;
      }

      toast.error("Este número é inválido ou não está cadastrado no WhatsApp");
      setIsSubmitting(false);

      // handleClose();
      // return undefined
    }
  };

  const handleGenerateTicket = async (contactId) => {
    if (!contactId) return;
    if (autoPush) {
      try {
        const { data: ticket } = await api.post("/tickets", {
          contactId: contactId,
          userId: user?.id,
          status: "open",
        });
        history.push(`/tickets/${ticket.id}`);
      } catch (err) {
        toastError(err);
      }
    }
  };

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchContact = async () => {
      if (initialValues) {
        setContact((prevState) => {
          return { ...prevState, ...initialValues };
        });
      }

      if (!contactId) return;

      try {
        const { data } = await api.get(`/contacts/${contactId}`);
        if (isMounted.current) {
          setContact(data);
        }
      } catch (err) {
        toastError(err);
      }
    };

    fetchContact();
  }, [contactId, open, initialValues]);

  return (
    <div className={classes.root}>
      <ExistingTicketModal
        modalOpen={existingTicketModalOpen}
        onClose={() => {
          setExistingTicketModalOpen(false);
          handleClose();
        }}
        ticketId={existingTickedId}
      />

      <NewTicketModalForSelectedContact
        modalOpen={newTicketModalOpen}
        onClose={() => {
          setNewTicketModalOpen(false);
          handleClose();
        }}
        initialContact={existingContact}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
        <DialogTitle id="form-dialog-title">
          {contactId
            ? `${i18n.t("contactModal.title.edit")}`
            : `${i18n.t("contactModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={contact}
          enableReinitialize={true}
          validationSchema={ContactSchema}
          onSubmit={(values) => {
            const { id } = handleSaveContact(values);
            id !== undefined && handleGenerateTicket(id);
          }}
        >
          {({ values, errors, touched }) => (
            <Form>
              <DialogContent dividers>
                <Typography variant="subtitle1" gutterBottom>
                  {i18n.t("contactModal.form.mainInfo")}
                </Typography>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <Field
                    as={TextField}
                    label={i18n.t("contactModal.form.name")}
                    name="name"
                    autoFocus
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                  />
                  {contact.channel !== "facebook" &&
                    contact.channel !== "instagram" &&
                    !contact.isGroup && (
                      <Field
                        // label={i18n.t("contactModal.form.number")}
                        name="number"
                        error={touched.number && Boolean(errors.number)}
                        helperText={touched.number && errors.number}
                        // placeholder="5521939006391"
                        // variant="outlined"
                        // margin="dense"
                        component={CountryCodePhoneInput}
                        // className={classes.textField}
                      />
                    )}
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("contactModal.form.email")}
                    name="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    placeholder="Email address"
                    fullWidth
                    margin="dense"
                    variant="outlined"
                  />
                </div>
                {user.name === "Administrador" && (
                  <>
                    <Typography
                      style={{ marginBottom: 8, marginTop: 12 }}
                      variant="subtitle1"
                    >
                      {i18n.t("contactModal.form.extraInfo")}
                    </Typography>

                    {
                      // chaves que vem do banco
                      defaultKeys.map((defaultKey) => {
                        if (
                          !values.extraInfo?.some(
                            (info) =>
                              info.name.toLowerCase() ===
                              defaultKey.toLowerCase()
                          ) &&
                          defaultKey.length > 0
                        ) {
                          const newInfos = values.extraInfo?.push({
                            name: defaultKey,
                            value: "",
                          });
                          return null;
                        }
                        return null;
                      })
                    }

                    <FieldArray name="extraInfo">
                      {({ push, remove }) => (
                        <>
                          {values.extraInfo &&
                            values.extraInfo.length > 0 &&
                            values.extraInfo.map((info, index) => (
                              <div
                                className={classes.extraAttr}
                                key={`${index}-info`}
                              >
                                <Field
                                  as={TextField}
                                  label={i18n.t("contactModal.form.extraName")}
                                  name={`extraInfo[${index}].name`}
                                  variant="outlined"
                                  margin="dense"
                                  className={classes.textField}
                                />
                                <Field
                                  as={TextField}
                                  label={i18n.t("contactModal.form.extraValue")}
                                  name={`extraInfo[${index}].value`}
                                  variant="outlined"
                                  margin="dense"
                                  className={classes.textField}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => remove(index)}
                                >
                                  <DeleteOutlineIcon />
                                </IconButton>
                              </div>
                            ))}
                          <div className={classes.extraAttr}>
                            <Button
                              style={{ flex: 1, marginTop: 8 }}
                              variant="outlined"
                              color="primary"
                              onClick={() => push({ name: "", value: "" })}
                            >
                              {`+ ${i18n.t(
                                "contactModal.buttons.addExtraInfo"
                              )}`}
                            </Button>
                          </div>
                        </>
                      )}
                    </FieldArray>
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("contactModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {contactId
                    ? `${i18n.t("contactModal.buttons.okEdit")}`
                    : `${i18n.t("contactModal.buttons.okAdd")}`}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default ContactModal;
