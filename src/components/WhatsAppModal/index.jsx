import React, { useEffect, useState } from "react";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import { Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";

import { useAuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import UserSelect from "../UserSelect";
import { getSuperUserEmail } from "../../config";

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
}));

const SessionSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

const WhatsAppModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();
  const initialState = {
    name: "",
    isDefault: false,
  };
  const [whatsApp, setWhatsApp] = useState(initialState);
  const [userSelectedIds, setUserSelectedIds] = useState([]);
  const { user, getConnections } = useAuthContext();

  const isDeskRioAdmin = user.email.includes(getSuperUserEmail());

  const handleDuplicateWhatsApp = async () => {
    try {
      if (whatsAppId) {
        await api.post(`/whatsapp/`, {
          ...whatsApp,
          name: `${whatsApp.name}-recriado`,
          queueIds: whatsApp.queues.map((queue) => queue.id),
        });

        getConnections();
      }
      toast.success(i18n.t("whatsappModal.success"));
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleSaveWhatsApp = async (values) => {
    const whatsappData = { ...values, userIds: userSelectedIds };

    try {
      if (whatsAppId) {
        await api.put(`/whatsapp/${whatsAppId}`, whatsappData);
        getConnections();
      } else {
        await api.post("/whatsapp", whatsappData);
        getConnections();
      }
      toast.success(i18n.t("whatsappModal.success"));
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleClose = () => {
    onClose();
    setWhatsApp(initialState);
  };

  useEffect(() => {
    const fetchSession = async () => {
			if (open) {
				if (!whatsAppId) return;

				try {
					const { data } = await api.get(`whatsapp/${whatsAppId}`);
	
					const whatsUserSelect = data.TicketsNoQueuesWhatsapps.map(
						({ TicketsNoQueuesWhatsapp }) => TicketsNoQueuesWhatsapp.userId
					);
					setWhatsApp(data);
					setUserSelectedIds(whatsUserSelect);
				} catch (err) {
					console.log("ERROR", err.message);
					toastError(err);
				}
			}
    };
    fetchSession();
  }, [whatsAppId]);

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          {whatsAppId
            ? i18n.t("whatsappModal.title.edit")
            : i18n.t("whatsappModal.title.add")}
        </DialogTitle>
        <Formik
          initialValues={whatsApp}
          enableReinitialize={true}
          validationSchema={SessionSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveWhatsApp(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, touched, errors, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("whatsappModal.form.name")}
                    autoFocus
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                  />
                  <FormControlLabel
                    control={
                      <Field
                        as={Switch}
                        color="primary"
                        name="isDefault"
                        checked={values.isDefault}
                      />
                    }
                    label={i18n.t("whatsappModal.form.default")}
                  />
                </div>
                <br />
                <label>
                  <b>Usuários permitidos a visualizar potenciais:</b>
                </label>
                <br />
                <UserSelect
                  selectedUsers={userSelectedIds}
                  onChange={(selectedIds) => setUserSelectedIds(selectedIds)}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("whatsappModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {whatsAppId
                    ? i18n.t("whatsappModal.buttons.okEdit")
                    : i18n.t("whatsappModal.buttons.okAdd")}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </Button>

                {whatsAppId && isDeskRioAdmin && (
                  <Button
                    color="primary"
                    disabled={isSubmitting}
                    variant="contained"
                    className={classes.btnWrapper}
                    onClick={() => {
                      handleDuplicateWhatsApp();
                    }}
                  >
                    Duplicar
                  </Button>
                )}
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default React.memo(WhatsAppModal);
