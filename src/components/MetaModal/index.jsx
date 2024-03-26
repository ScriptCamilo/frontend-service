import React, { useState, useEffect, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import UserSelect from "../UserSelect";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  CircularProgress,
  TextField,
  Switch,
  FormControlLabel,
} from "@material-ui/core";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },

  multFieldLine: {
    display: "flex",
    flexDirection: "column",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },

  textField: {
    width: "100%",
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
  pageId: Yup.string()
    .min(2, "Too Short!")
    .max(100, "Too Long!")
    .required("Required"),
  pageToken: Yup.string()
    .min(2, "Too Short!")
    .max(1000, "Too Long!")
    .required("Required"),
  verifyToken: Yup.string()
    .min(2, "Too Short!")
    .max(1000, "Too Long!")
    .required("Required"),
});

const MetaModal = ({ open, onClose, metaId, getConnectionsMeta }) => {
  const classes = useStyles();
  const initialState = {
    name: "",
    pageId: "",
    pageToken: "",
    verifyToken: "",
  };
  const [meta, setMeta] = useState(initialState);
  const [userSelectedIds, setUserSelectedIds] = useState([]);

  useEffect(() => {
    const fetchSession = async () => {
      if (!metaId) return;

      try {
        const { data } = await api.get(`meta/${metaId}`);
        const whatsUserSelect = data.TicketsNoQueuesMetas.map(
          ({ TicketsNoQueuesMeta }) => TicketsNoQueuesMeta.userId
        );

        setUserSelectedIds(whatsUserSelect);
        setMeta(data);
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, [metaId]);

  const handleSaveMeta = async (values) => {
    const metaData = { ...values, userIds: userSelectedIds };
    try {
      if (metaId) {
        await api.put(`/meta/${metaId}`, metaData);
        toast.success("Facebook Page atualizado com sucesso");
      } else {
        await api.post("/meta", metaData);
        getConnectionsMeta();
        toast.success("Facebook Page criado com sucesso");
      }
      handleClose();
      // await api.get(
      //     `profile?mode=all&verify_token=${metaData.verifyToken}&pageId=${metaData.pageId}`
      // )
    } catch (err) {
      toastError(err);
    }
  };

  const handleClose = () => {
    onClose();
    setMeta(initialState);
  };

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
          {metaId ? "Editar Facebook Page" : "Criar Facebook Page"}
        </DialogTitle>
        <Formik
          initialValues={meta}
          enableReinitialize={true}
          validationSchema={SessionSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveMeta(values);
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
                    disabled={true}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                  />
                  <Field
                    as={TextField}
                    label={"ID DA PÁGINA"}
                    autoFocus
                    name="pageId"
                    disabled={true}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                  />
                  <Field
                    as={TextField}
                    label={"TOKEN DA PÁGINA"}
                    autoFocus
                    name="pageToken"
                    disabled={true}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
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
                  {metaId
                    ? i18n.t("whatsappModal.buttons.okEdit")
                    : i18n.t("whatsappModal.buttons.okAdd")}
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

export default React.memo(MetaModal);
