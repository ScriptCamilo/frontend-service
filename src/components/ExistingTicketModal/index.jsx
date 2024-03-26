import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";

import api from "../../services/api";

const ExistingTicketModal = ({ modalOpen, onClose, ticketId, newTicketModalProps }) => {
  const history = useHistory();
  const [openTicket, setOpenTicket] = useState({});
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (modalOpen === false) return;

    const getTicket = async (ticketId) => {
      const { data } = await api.get(`tickets/${ticketId}`);
      setOpenTicket(data);
    };

    getTicket(ticketId);
  }, [modalOpen]);

  const handleClose = () => {
    onClose();
  };

  const validateUserProfile = (loggedUser) => {
    if (
      loggedUser.profile === "admin" ||
      loggedUser.profile === "supervisor" ||
      loggedUser.id === openTicket.userId
    ) {
      return true;
    }
    return false;
  };

  const handleRedirect = () => {
    // newTicketModalProps.closeTicketModal();
    onClose();

    if (newTicketModalProps && newTicketModalProps.newTicketModalStatus) {
      newTicketModalProps.newTicketModalClose();
    }

    history.push(`/tickets/${openTicket.id}`);
  }

  return (
    <>
      <Dialog open={modalOpen} onClose={handleClose}>
        <DialogTitle id="form-dialog-title">
          Atendimento já iniciado
        </DialogTitle>

        {Object.keys(openTicket).length > 0 && (
          <>
            <DialogContent
              style={{ marginBottom: 8, marginTop: 12 }}
              variant="subtitle1"
            >
              <p id="simple-modal-description">
                <strong>Protocolo:</strong> {openTicket?.id}
              </p>
              <p id="simple-modal-description">
                <strong>Atendente:</strong>{" "}
                {openTicket?.user?.name || "Não atribuído"}
              </p>
              <p id="simple-modal-description">
                <strong>Setor:</strong>{" "}
                {openTicket?.queue?.name || "Não atribuído"}
              </p>
              <p id="simple-modal-description">
                <strong>Conexão:</strong> {
                openTicket?.meta?.name ? 
                  openTicket.meta.name :
                  openTicket?.whatsapp?.name || openTicket?.whatsappApi?.name
              }
              </p>
            </DialogContent>

            <DialogActions>
              <Button
                onClick={handleClose}
                color="secondary"
                variant="outlined"
              >
                Cancelar
              </Button>

              {validateUserProfile(user) && (
                <Button
                  onClick={handleRedirect}
                  color="primary"
                  variant="outlined"
                >
                  Abrir Ticket
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default ExistingTicketModal;
