import React, { useState, useEffect, useContext } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  CircularProgress,
  TextField,
} from "@material-ui/core";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import UserSelect from "../UserSelect";
// import { AuthContext } from "../../context/Auth/AuthContext";
// import CountryCodePhoneInput from "../CountryCodePhoneInput";

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
	textField: {
		width: "100%",
	}
}));

const SessionSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

const initialState = {
	name: "",
};

const OficialWhatsAppModal = ({ open, onClose, whatsAppId }) => {
	const classes = useStyles();
	const [whatsApp, setWhatsApp] = useState(initialState);
	const [userSelectedIds, setUserSelectedIds] = useState([]);

  useEffect(() => {
    const fetchSession = async () => {
			if (open) {
				if (!whatsAppId) return;

				try {
					const { data } = await api.get(`whatsapp-api/${whatsAppId}`)

					const whatsUserSelect = data.TicketsNoQueuesWhatsappApis.
					  map(({TicketsNoQueuesWhatsappApi}) => TicketsNoQueuesWhatsappApi.userId);

					setWhatsApp(data);
					setUserSelectedIds(whatsUserSelect);
				} catch (err) {
					console.log('ERROR', err.message);
					toastError(err);
				}
			}
    };
    fetchSession();
  }, [whatsAppId]);

	const handleSaveWhatsApp = async values => {
		const whatsappData = { ...values, userIds: userSelectedIds, isOficial: true };

		try {
			if (whatsAppId) {
				await api.put(`/whatsapp-api/${whatsAppId}`, whatsappData);
			} else {
				await api.post("/whatsapp-api", whatsappData);
			}
			toast.success(i18n.t("whatsappModal.success"));
			// setTimeout(() => {
			// 	window.location.reload();
			// }, 1500)
			handleClose();
		} catch (err) {
			console.log('ERROR', err.response.data);
			toastError(err);
		}
	};

	const handleClose = () => {
		onClose();
		setWhatsApp(initialState);
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
					{whatsAppId
						? 'Editar WhatsApp Oficial'
						: 'Adicionar WhatsApp Oficial'}
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
										required
										label={i18n.t("whatsappModal.form.name")}
										autoFocus
										name="name"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										// className={classes.textField}
									/>
									<Field
										as={TextField}
										required
										label={'Número do whatsapp'}
										name="number"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										// className={classes.textField}
									/>
								</div>
								<Field
									as={TextField}
									required={!whatsAppId}
									label='Token de acesso temporário ou permanente'
									name="accessToken"
									error={touched.name && Boolean(errors.name)}
									helperText={touched.name && errors.name}
									variant="outlined"
									margin="dense"
									className={classes.textField}
								/>
								{!whatsAppId && (
									<Field
										as={TextField}
										required
										label='Id do Número'
										name="idNumber"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										className={classes.textField}
									/>
								)}
								{!whatsAppId && (
									<Field
										as={TextField}
										required
										label='Id do Whatsapp Business'
										name="whatsappBusinessId"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										className={classes.textField}
									/>
								)}
								{!whatsAppId && (
									<Field
										as={TextField}
										required
										label='Id do aplicativo'
										name="appId"
										error={touched.name && Boolean(errors.name)}
										helperText={touched.name && errors.name}
										variant="outlined"
										margin="dense"
										className={classes.textField}
									/>
								)}
								<br />
								<label><b>Usuários permitidos a visualizar potenciais:</b></label>
								<br />
								<UserSelect
									selectedUsers={userSelectedIds}
									onChange={selectedIds => setUserSelectedIds(selectedIds)}
								/>
								<br />
								{/* <label style={{marginBottom: '200px'}}>
									<b>Digite um numero de um Whatsapp responsável. Caso o token expire,
									enviaremos uma mensagem avisando da invalidez do token.</b>
								</label>
								<br />
								<Field
									name="feedbackWhatsappNumber"
									error={touched.number && Boolean(errors.number)}
									helperText={touched.number && errors.number}
									component={CountryCodePhoneInput}
								/> */}
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
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</div>
	);
};

export default React.memo(OficialWhatsAppModal);
