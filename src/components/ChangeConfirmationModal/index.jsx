import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

import { i18n } from "../../translate/i18n";


const useStyles = makeStyles(theme => ({
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

const ChangeConfirmationModal = ({ open, onSave, onClose }) => {
	const classes = useStyles();
	const isMounted = useRef(true);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	return (
		<div className={classes.root}>
			<Dialog open={open} onClose={onClose} maxWidth="lg" scroll="paper">
				<DialogTitle id="form-dialog-title">
					Tem certeza que quer mudar a senha?
				</DialogTitle>
				<DialogContent 
					dividers
					style={{
						display: 'flex', 
						alignItems: 'center', 
						justifyContent: 'space-around', 
				    width: '100%'
					}}
				>
					<Button
						onClick={onClose}
						color="secondary"
						variant="outlined"
						>
						{i18n.t("contactModal.buttons.cancel")}
					</Button>
					<Button
						type="submit"
						color="primary"
						variant="contained"
						className={classes.btnWrapper}
						onClick={onSave}
					>
						SIM
					</Button>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ChangeConfirmationModal;
