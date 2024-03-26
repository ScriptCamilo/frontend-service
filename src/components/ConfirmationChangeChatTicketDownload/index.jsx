import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";

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

const ConfirmationChangeDownload = ({ open, onClose, setAction }) => {
	const classes = useStyles();

	const handleClick = () => {
		onClose();
		setAction("Exportar conversa inteira");
	}

	return (
		<div className={classes.root}>
			<Dialog open={open} onClose={onClose} maxWidth="lg" scroll="paper">
				<DialogTitle id="form-dialog-title">
					Confirme a ação
				</DialogTitle>
				<DialogContent>
					<Typography variant="body1" style={{ whiteSpace: "pre-line" }}>
						{`Baixar as conversas do contato inteiro pode ser uma ação demorada a depender do
						tamanho do histórico de mensagens, tem certeza que deseja continuar?`}
					</Typography>
				</DialogContent>
				<DialogActions>
				<Button
					type="submit"
					color="primary"
					variant="contained"
					className={classes.btnWrapper}
					onClick={handleClick}
				>
					Continuar
				</Button>
				<Button
					type="submit"
					color="secondary"
					variant="outlined"
					className={classes.btnWrapper}
					onClick={onClose}
				>
					Cancelar
				</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default ConfirmationChangeDownload;
