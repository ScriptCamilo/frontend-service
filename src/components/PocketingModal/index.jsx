import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../../context/Auth/AuthContext"

import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { Checkbox, MenuItem, Select } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},

	selectField: {
		width: '120px',
	},

	selectFields: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: '1em',
	},

	checkboxAll: {
		margin: "1em 0",
		padding: "0",
		display: "flex",
		alignItems: "center",
		textAlign: "center",
	},

	checkbox: {
		padding: "0",
		margin: "0 0.2em 0 0",
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

const PocketingModal = ({ open, onClose, contactId, initialValues, onSave }) => {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [userId, setUserId] = useState(0);
	const [toUserId, setToUserId] = useState(0);
	const [fullLimit, setFullLimit] = useState(false)
	const { users } = useContext(AuthContext);

	const classes = useStyles();
	const isMounted = useRef(true);

	const initialState = {
		/* 	userId: 0,
		toUserId: 0, */
		setLimit: 0,
	};
	const [contact, setContact] = useState(initialState);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const handleClose = () => {
		onClose();
		setContact(initialState);
	};

	const transferPocketedClients = async ({ userId, toUserId, setLimit }) => {
		setIsSubmitting(true)

		const body = { toUserId }
		body[setLimit] = fullLimit ? null : setLimit

		try {
			await api.put(`/contacts/pocketing-transfer-all/${userId}`, { toUserId, setLimit })
			handleClose();
			toast.success(i18n.t("contactModal.success"));
			setIsSubmitting(false)
		} catch (err) {
			toastError(err);
			setIsSubmitting(false)
			return undefined
		}
	}

	return (
		<div className={classes.root}>
			<Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
				<DialogTitle id="form-dialog-title">
					Transferir carteirização
				</DialogTitle>
				<Formik
					initialValues={contact}
					enableReinitialize={true}
					onSubmit={(values) => {
						transferPocketedClients({ userId, toUserId, ...values })
					}}
				>
					{({ values, errors, touched }) => (
						<Form>
							<DialogContent dividers>
								<div className={classes.selectFields}>
									<Typography variant="subtitle1" gutterBottom>
										Transferir de:
									</Typography>
									<Select
										value={userId}
										name="userId"
										onChange={(e) => setUserId(e.target.value)}
										label='transferir de:'
										className={classes.selectField}
									>
										<MenuItem value={''}>&nbsp;</MenuItem>
										{
											users.users?.map((user) => (
												<MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
											))
										}
									</Select>
									<Typography variant="subtitle1" gutterBottom>
										Para:
									</Typography>
									<Select
										value={toUserId}
										defaultValue={toUserId}
										name="toUserId"
										onChange={(e) => setToUserId(e.target.value)}
										label='transferir para:'
										className={classes.selectField}
									>
										<MenuItem value={''}>&nbsp;</MenuItem>
										{
											users.users?.map((user) => (
												<MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
											))
										}
									</Select>
								</div>
								<div className={classes.checkboxAll} >
									<Checkbox
										defaultChecked={fullLimit}
										onChange={() => setFullLimit(!fullLimit)}
										className={classes.checkbox}
									/>
									<Typography variant="subtitle1" gutterBottom>
										Transferir todos
									</Typography>
								</div>
								{
									!fullLimit && (
										<Field
											as={TextField}
											label='quantidade:'
											name="setLimit"
											// error={touched.email && Boolean(errors.email)}
											placeholder="0"
											fullWidth
											margin="dense"
											variant="outlined"
										/>
									)
								}

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

export default PocketingModal;
