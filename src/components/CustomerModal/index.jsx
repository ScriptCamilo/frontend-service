import React from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";
import { useAdminContext } from "../../context/AdminContext";
import { useStyles } from "./styles";


const CustomerSchema = Yup.object().shape({
  name: Yup.string().required("O nome é obrigatório"),
  url: Yup.string()
    .required("A URL é obrigatória")
    .matches(
      /^https:\/\/[a-zA-Z0-9]+\.deskrio\.com\.br\/?$/,
      "Exemplo de URL correta: https://demo.deskrio.com.br"
    )
});

/**
 * @typedef {object} CustomerModalParams
 * @property {boolean} open
 * @property {function} onClose
 * @property {object} customer
 *
 * @param {CustomerModalParams} params
 * @returns
 */

function CustomerModal({ open, onClose, customer }) {
  const {
    customerLoading,
    createCustomer,
    updateCustomer,
  } = useAdminContext();

  const classes = useStyles();

  const initialState = customer ? {
    ...customer,
    url: `https://${customer.url}`,
  } : {
    name: "",
    url: "",
  };

  const handleSubmit = async (values) => {
    if (customer) {
      await updateCustomer(values);
      return onClose();
    }
    await createCustomer(values);
    onClose();
  }

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="xl" scroll="paper">
      <DialogTitle id="form-dialog-title">
        {`${i18n.t("customerModal.title.add")}`}
      </DialogTitle>
      <Formik
        initialValues={initialState}
        enableReinitialize={true}
        onSubmit={handleSubmit}
        validationSchema={CustomerSchema}
      >
        {({ values, errors, touched }) => (
          <Form>
            <DialogContent dividers>
              <Typography variant="subtitle1" gutterBottom>
                {i18n.t("customerModal.form.mainInfo")}
              </Typography>

              <Field
                as={TextField}
                label={i18n.t("customerModal.form.name")}
                name="name"
                autoFocus
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
                variant="outlined"
                margin="dense"
                className={classes.textField}
              />

              <Field
                as={TextField}
                label={i18n.t("customerModal.form.url")}
                name="url"
                error={touched.url && Boolean(errors.url)}
                helperText={touched.url && errors.url}
                variant="outlined"
                margin="dense"
                className={classes.textField}
                placeholder="https://"
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => onClose()}
                color="secondary"
                disabled={customerLoading}
                variant="outlined"
              >
                {i18n.t("customerModal.buttons.cancel")}
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={customerLoading}
                variant="contained"
                className={classes.btnWrapper}
              >
                {`${i18n.t(`customerModal.buttons.${customer ? "okEdit" : "okAdd"}`)}`}
                {customerLoading && (
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
  );
};

export default CustomerModal;
