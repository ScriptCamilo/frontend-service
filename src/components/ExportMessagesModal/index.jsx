import React, { useState, useEffect, useContext } from "react";
import { CSVLink } from "react-csv";
import { AuthContext, useAuthContext } from "../../context/Auth/AuthContext";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ExportMessagesPDF from "../../components/ExportMessagesPDF";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";
import ConfirmationChangeDownload from "../ConfirmationChangeChatTicketDownload";
// import useMixpanel from "../../hooks/useMixpanel";

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
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const OPTIONAL_EXPORT = ['Exportar conversa do ticket', 'Exportar conversa inteira']

const ExportMessagesModal = ({ open, onClose, ticket }) => {
  const classes = useStyles();
  const [ticketData, setTicketData] = useState([]);
  const [showExport, setShowExport] = useState(false);
	const [action, setAction] = useState(OPTIONAL_EXPORT[0]);
	const [confirmationChangeChatModal, setConfirmationChangeChatModal] = useState(false);
	const { track } = useAuthContext();

	// const mixpanel = useMixpanel();

  const {
    users: { users },
  } = useContext(AuthContext);

  useEffect(() => {
    const fetchAllMessages = async () => {
      if (!open) return;
      try {
				if (action === OPTIONAL_EXPORT[0]) {
					const { data } = await api.get("/messages/all/" + ticket);
					setTicketData(data);
					setShowExport(true);
				} else {
					const { data } = await api.get("/messages/export-all-messages/" + ticket);
					if (data.messages.length > 50)
						toast.info('Isto pode demorar um pouco...',
						{ autoClose: (data.messages.length)/100 * 1000 })
					setTicketData(data);
					setShowExport(true);
				}
      } catch (err) {
        toastError(err);
      }
    };
    fetchAllMessages();
  }, [open, ticket, action]);

  const handleClose = () => {
    onClose();
		setAction(OPTIONAL_EXPORT[0]);
  };

  return (
    <div className={classes.root}>
			<ConfirmationChangeDownload
				open={confirmationChangeChatModal}
				onClose={() => setConfirmationChangeChatModal(false)}
				setAction={setAction}
			/>
      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth scroll="paper">
        <DialogTitle id="form-dialog-title">{i18n.t("exportModal.title")}</DialogTitle>
        <>
          <DialogContent dividers>
						<FormControl fullWidth margin="dense" variant="outlined">
							<InputLabel>Escolha</InputLabel>
							<Select
								labelWidth={60}
								id="action"
								name="action"
								label="Escolha"
								value={action}
								onChange={(e) => {
									if (e.target.value === OPTIONAL_EXPORT[1]) {
										setConfirmationChangeChatModal(true);
									} else {
										setAction(e.target.value);
									}
								}}
								MenuProps={{
									anchorOrigin: {
										vertical: "bottom",
										horizontal: "left",
									},
									transformOrigin: {
										vertical: "top",
										horizontal: "left",
									},
									getContentAnchorEl: null,
								}}
							>
								{OPTIONAL_EXPORT.map((action, i) => (
									<MenuItem key={i} value={action}>
										{action}
									</MenuItem>
								))}
							</Select>
						</FormControl>
          </DialogContent>
          {showExport && (
            <DialogActions>
              <Button onClick={handleClose} color="secondary" variant="outlined">
                {i18n.t("exportModal.buttons.cancel")}
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                className={classes.btnWrapper}
                onClick={() => {
									handleClose();
									track('Conversation Export', {
										'Format': 'TXT'
									})
								}}
              >
                <CSVLink
                  style={{ textDecoration: "none", color: "white" }}
                  data={ticketData.messages.map((message) => {
                    let content;
                    if (message.isDeleted) content = "(excluído)";
                    else if (message.mediaType === "chat") content = message.body;
                    else content = `${message.mediaType}: ${message.mediaUrl}`;
                    return [
                      `Ticket: ${message.ticketId}`,
                      `[${format(parseISO(message.createdAt), "dd/MM/yyyy HH:mm:ss")}]`,
                      message.fromMe ? "Eu:" : `${message.contact?.name}:`,
                      // message.fromMe ? `${users.find((user) => user.id === message.userId)?.name}:` : `${message.contact?.name}:`,
                      content,
                    ];
                  })}
                  filename={`historico - ${ticketData.ticket.contact.number} - ${format(parseISO(new Date().toJSON()), "yyyyMMddHHmmss")}.txt`}
                  separator={" "}
                  enclosingCharacter={""}
                >
                  DOWNLOAD TXT
                </CSVLink>
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                className={classes.btnWrapper}
                onClick={() => {
									handleClose();
									track('Conversation Export', {
										'Format': 'PDF'
									})
								}}
              >
                <PDFDownloadLink
                  document={
                    <ExportMessagesPDF
                      messages={ticketData.messages}
                      from={ticketData.ticket.contact.number}
                      ticket={ticket}
                      users={users}
											allChatNumber={action === OPTIONAL_EXPORT[1]}
                    />
                  }
                  fileName={`historico - ${ticketData.ticket.contact.number} - ${format(parseISO(new Date().toJSON()), "yyyyMMddHHmmss")}.pdf`}
                  style={{ textDecoration: "none", color: "white" }}
                >
                  {({ blob, url, loading, error }) =>
									loading ? 'Carregando...' : 'DOWNLOAD PDF'}
                </PDFDownloadLink>
              </Button>
            </DialogActions>
          )}
        </>
      </Dialog>
    </div>
  );
};

export default ExportMessagesModal;
