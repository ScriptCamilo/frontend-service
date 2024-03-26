import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import api from "../../services/api";
import toastError from "../../errors/toastError";

import AllowedUsersDropdown from "../AllowedUsersDropdown";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Divider } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},

	container: {
		display: 'flex',
		flexWrap: 'wrap',
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
	colorAdorment: {
		width: 20,
		height: 20,
	},

	usersSelect: {
		height: "40vh",
		display: "flex",
		flexDirection: "column",
		padding: "10px 10px 10px 23px",
	}
}));

const DistributionModal = ({ open, onClose, distribution, setDistribution, queueId }) => {
	const classes = useStyles();
	const { users } = useContext(AuthContext)

	useEffect(() => {
		if (!distribution?.id && queueId) {
			(async () => {
				try {
					const response = await api.post("/distributions", { queueId });
					const { data } = response;
					setDistribution(data);
				} catch (err) {
					toastError(err);
				}
			})();
		}
	}, [queueId]);

	const handleClose = () => {
		onClose();
	};

	// const handleSaveDistribution = async values => {
	// 	try {
	// 		if (distribution.id) {
	// 			await api.put(`/distributions/${distribution.id}`, values);
	// 		}
	// 		toast.success(`Distribuição alterada com sucesso!`);
	// 		handleClose();
	// 	} catch (err) {
	// 		toastError(err);
	// 	}
	// };

	return (
		<div className={classes.root}>
			<Dialog open={open} onClose={handleClose} >
				<DialogTitle style={{ width: "100%" }}>
					Atribuir atendentes
				</DialogTitle>
				<div className={classes.usersSelect}>
					<Divider />
					<AllowedUsersDropdown distribution={distribution} users={users} usersIdOnline={distribution?.userIds} setDistribution={setDistribution} distributionId={distribution?.id} />

					{/* <Formik
					initialValues={queue}
					enableReinitialize={true}
					validationSchema={QueueSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveDistribution(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting, values }) => (
						<Form>
							<DialogContent dividers>
								<Field
									as={TextField}
									label={i18n.t("queueModal.form.name")}
									autoFocus
									name="name"
									error={touched.name && Boolean(errors.name)}
									helperText={touched.name && errors.name}
									variant="outlined"
									margin="dense"
									className={classes.textField}
								/>
								<Field
									as={TextField}
									label={i18n.t("queueModal.form.color")}
									name="color"
									id="color"
									onFocus={() => {
										setColorPickerModalOpen(true);
										greetingRef.current.focus();
									}}
									error={touched.color && Boolean(errors.color)}
									helperText={touched.color && errors.color}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<div
													style={{ backgroundColor: values.color }}
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
									onChange={color => {
										values.color = color;
										setQueue(() => {
											return { ...values, color };
										});
									}}
								/>
								<div>
									<Field
										as={TextField}
										label={i18n.t("queueModal.form.greetingMessage")}
										type="greetingMessage"
										multiline
										inputRef={greetingRef}
										rows={4}
										fullWidth
										name="greetingMessage"
										error={
											touched.greetingMessage && Boolean(errors.greetingMessage)
										}
										helperText={
											touched.greetingMessage && errors.greetingMessage
										}
										variant="outlined"
										margin="dense"
									/>
								</div>
								<form className={classes.container} noValidate>
									<Field
										as={TextField}
										label={i18n.t("queueModal.form.startWork")}
										type="time"
										ampm={false}
										defaultValue="08:00"
										inputRef={startWorkRef}
										InputLabelProps={{
											shrink: true,
										}}
										inputProps={{
											step: 600, // 5 min
										}}
										fullWidth
										name="startWork"
										error={
											touched.startWork && Boolean(errors.startWork)
										}
										helperText={
											touched.startWork && errors.startWork
										}
										variant="outlined"
										margin="dense"
										className={classes.textField}
									/>
									<Field
										as={TextField}
										label={i18n.t("queueModal.form.endWork")}
										type="time"
										ampm={false}
										defaultValue="18:00"
										inputRef={endWorkRef}
										InputLabelProps={{
											shrink: true,
										}}
										inputProps={{
											step: 600, // 5 min
										}}
										fullWidth
										name="endWork"
										error={
											touched.endWork && Boolean(errors.endWork)
										}
										helperText={
											touched.endWork && errors.endWork
										}
										variant="outlined"
										margin="dense"
										className={classes.textField}
									/>
								</form>
								<div>
									<Field
										as={TextField}
										label={i18n.t("queueModal.form.absenceMessage")}
										type="absenceMessage"
										multiline
										inputRef={absenceRef}
										rows={2}
										fullWidth
										name="absenceMessage"
										error={
											touched.absenceMessage && Boolean(errors.absenceMessage)
										}
										helperText={
											touched.absenceMessage && errors.absenceMessage
										}
										variant="outlined"
										margin="dense"
									/>
								</div>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("queueModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{queueId
										? `${i18n.t("queueModal.buttons.okEdit")}`
										: `${i18n.t("queueModal.buttons.okAdd")}`}
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
				</Formik> */}
				</div>
			</Dialog>
		</div>
	);
};

export default DistributionModal;
