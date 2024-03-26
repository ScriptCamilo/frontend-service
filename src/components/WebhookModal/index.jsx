import React, { useState, useEffect } from "react";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import FormControl from "@material-ui/core/FormControl";
import { Checkbox, FormControlLabel, FormGroup, makeStyles, Switch, TextField } from "@material-ui/core";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { i18n } from "../../translate/i18n";

import ButtonWithSpinner from "../ButtonWithSpinner";
import api from "../../services/api";
import { Form, Formik } from "formik";
import { toast } from "react-toastify";


const useStyles = makeStyles((theme) => ({
	maxWidth: {
		width: "100%",
	},
	whatsStyle: {
		width: "100%",
		marginTop: "15px"
	},
	formGroup: {
		flexDirection: 'row', 
		justifyContent: 'space-around'
	}
}));

const WebhookModal = ({ webhook, open, onClose, getWebhooks }) => {
	const classes = useStyles();
	const [loading, setLoading] = useState(false);
	const [url, setUrl] = useState()
	const [active, setActive] = useState()
	const [box, setBox] = useState({
		'ticketCreation': false,
		'ticketUpdate': false,
		'ticketDelete': false,
		'contactCreation': false,
		'contactUpdate': false,
		'contactDelete': false,
	});
	const { 
		ticketCreation, 
		ticketUpdate, 
		ticketDelete,
		contactCreation, 
		contactUpdate,
		contactDelete
	} = box;

	const cleanForm = () => {
		setUrl('')
		setActive('')
		setBox({
			'ticketCreation': false,
			'ticketUpdate': false,
			'ticketDelete': false,
			'contactCreation': false,
			'contactUpdate': false,
			'contactDelete': false,
		})
	}

	const handleChangeBox = (event) => {
		setBox({ ...box, [event.target.name]: event.target.checked });
	};

	useEffect(() => {
		if (open === true && webhook) {
			const {options} = webhook
			setUrl(webhook.url)
			setActive(webhook.active)
			options.forEach((option) => {
				setBox((prevState) => {
					return { ...prevState, [option.name]: option.active };
				});
			})
		} else {
			cleanForm()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open])

	const handleClose = () => {
		onClose();
	};

	const createWebhook = async (e) => {
		e.preventDefault()
		setLoading(true)
		const formData = new FormData(e.target);
		const formProps = Object.fromEntries(formData);
		if (webhook) {
			try {
			  await api.put(`/webhook/${webhook.id}`, formProps);
			  toast.success("Webhook atualizado com sucesso");
		  
			  Object.entries(box).forEach(async (entry) => {
				const body = {
				  name: entry[0],
				  active: entry[1],
				  webhookId: webhook.id
				};
				try {
				  await api.put(`/webhook-option`, body);
				} catch (error) {
				  toast.error("Erro ao atualizar dados");
				}
			  });
			  getWebhooks();
			} catch (error) {
			  toast.error("Erro ao atualizar dados");
			}
		} else {
			try {
			  const { data } = await api.post("/webhook", formProps);
			  toast.success("Webhook criado com sucesso");
		  
			  Object.entries(box).forEach((entry) => {
				const body = {
				  name: entry[0],
				  active: entry[1],
				  webhookId: data.id
				};
				try {
				  api.post(`/webhook-option`, body)
				} catch (error) {
				  toast.error("Erro ao atualizar dados");
				}
			  });
			} catch (error) {
			  toast.error("Erro ao criar webhook");
			}
		}
		getWebhooks();
		setLoading(false)
		handleClose()
		cleanForm()
	}


	return (
		<Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
			<DialogTitle id="form-dialog-title">
				Criar Webhook
			</DialogTitle>

			<Formik>
				<Form onSubmit={createWebhook} encType="multipart/form-data">
					<DialogContent>
						<FormControl
							variant="outlined"
							className={classes.maxWidth}
						>
							<TextField
								id='url'
								name='url'
								label="Nome do Webhook"
								value={url}
								onChange={(e) => setUrl(e.target.value)}
							/>
						</FormControl>

						<FormControlLabel
							control={
							<Switch
								id='active'
								name='active'
								onChange={(e) => setActive(e.target.checked)}
								value={active}
								checked={Boolean(active)}
								color="primary"
							/>
							}
							label="Ativado"
						/>

						<FormControl className={classes.maxWidth} >
							<FormGroup className={classes.formGroup}
							>
								<FormControlLabel
									control={
										<Checkbox 
											id="ticketCreation"
											name="ticketCreation"
											checked={ticketCreation} 
											onChange={handleChangeBox}
											value={ticketCreation}
										/>
									}
									label="Criação Tickets"
								/>
								<FormControlLabel
									control={
										<Checkbox
											id="ticketUpdate"
											name="ticketUpdate"
											checked={ticketUpdate}
											onChange={handleChangeBox}
											value={ticketUpdate}
										/>
									}
									label="Atualização Tickets"
								/>
								<FormControlLabel
									control={
										<Checkbox
											id="ticketDelete"
											name="ticketDelete"
											checked={ticketDelete}
											onChange={handleChangeBox}
											value={ticketDelete}
										/>
									}
									label="Deleção Tickets"
								/>
								<FormControlLabel
									control={
										<Checkbox 
											id="contactCreation"
											name="contactCreation"
											checked={contactCreation} 
											onChange={handleChangeBox}
											value={contactCreation}
										/>
									}
									label="Criação Contatos"
								/>
								<FormControlLabel
									control={
										<Checkbox 
											id="contactUpdate"
											name="contactUpdate"
											checked={contactUpdate} 
											onChange={handleChangeBox}
											value={contactUpdate}
										/>
									}
									label="Atualização Contatos"
								/>
								<FormControlLabel
									control={
										<Checkbox 
											id="contactDelete"
											name="contactDelete"
											checked={contactDelete} 
											onChange={handleChangeBox}
											value={contactDelete}
										/>
									}
									label="Deleção Contatos"
								/>
							</FormGroup>
						</FormControl>

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
							>
								{webhook ? 'Atualizar' : 'Criar'}
							</ButtonWithSpinner>
						</DialogActions>
					</DialogContent>
				</Form>
			</Formik>
		</Dialog>
	);
};

export default WebhookModal;
