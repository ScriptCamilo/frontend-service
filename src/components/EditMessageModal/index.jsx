import React, { useEffect, useState } from "react";
import {
  Button,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputBase,
  Typography,
} from "@material-ui/core";
import { i18n } from "../../translate/i18n.js";
import { useStyles } from "./styles.js";
import api from "../../services/api.js";
import toastError from "../../errors/toastError.jsx";
import { toast } from "react-toastify";
import { Picker } from "emoji-mart";
import IconButton from "@material-ui/core/IconButton";
import MoodIcon from "@material-ui/icons/Mood";

export default function EditMessageModal({ open, onClose, message, isPossibleEditBecauseMinutes }) {
  const classes = useStyles();
	const [inputMessage, setInputMessage] = useState(message);
	const [showEmoji, setShowEmoji] = useState(false);

	useEffect(() => {
		if (message) {
			setInputMessage(message.body);
		}
	}, [message.body])

	const handleChangeInput = (e) => {
		setInputMessage(e.target.value);
	}

	const handleUpdateMessage = async () => {
		if (!inputMessage) {
			toast.error("A mensagem não pode ser vazia!");
			return;
		}
		if (!isPossibleEditBecauseMinutes()) {
			toast.error("A mensagem não pode ser editada após 15 minutos!");
			return;
		}
		try {
			await api.put(`/messages/${message.id}`, {
				ticketId: message.ticketId,
				body: inputMessage,
			})
		} catch (error) {
			toastError(error);
		} finally {
			onClose();
		}
	}

  return (
		<>
			{showEmoji ? (
				<div className={classes.emojiBox}>
					<ClickAwayListener onClickAway={(e) => setShowEmoji(false)}>
						<Picker
							perLine={9}
							showPreview={false}
							showSkinTones={false}
							onSelect={(emoji) => setInputMessage(inputMessage + emoji.native)}
						/>
					</ClickAwayListener>
				</div>
			) : null}
			<Dialog
				open={open}
				onClose={() => onClose()}
				aria-labelledby="confirm-dialog"
				fullWidth
        scroll="paper"
			>
				<DialogTitle id="confirm-dialog">Editar mensagem</DialogTitle>
				<DialogContent dividers>
					<div
						className={classes.messageInput}
					>
						<InputBase
							style={{
								width: '100%'
							}}
							placeholder="Digite a mensagem..."
							multiline
							value={inputMessage}
							onChange={handleChangeInput}
						/>
						<IconButton
								aria-label="emojiPicker"
								onClick={() => setShowEmoji(!showEmoji)}
							>
								<MoodIcon />
						</IconButton>
					</div>
				</DialogContent>
				<DialogActions>
					<Button
						variant="contained"
						onClick={onClose}
						color="secondary"
					>
						{i18n.t("confirmationModal.buttons.cancel")}
					</Button>
					<Button
						variant="contained"
						onClick={handleUpdateMessage}
						color="primary"
					>
						{i18n.t("confirmationModal.buttons.confirm")}
					</Button>
				</DialogActions>
			</Dialog>
		</>
  );
}
