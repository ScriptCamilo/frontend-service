import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

import uuid from "react-uuid";
import { useSettingsContext } from "../../context/SettingsContext";
import TransferTicketModal from "../TransferTicketModal";
import { i18n } from "../../translate/i18n";

const TicketContextMenu = ({
  ticket,
  anchorEl,
  onClose,
  onMarkAsUnread,
  isMarkedAsUnread,
  setChangeIsFixed,
	isMobile,
	setDisabled = () => {},
	deleteTicketFromList
}) => {

  const { user, track } = useContext(AuthContext);
  const history = useHistory();
  const isStatusPending = ticket.status === "pending";
  const { getSettingValue } = useSettingsContext();
  const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);

  const getTicketPreviewPermission = (profile) => {
    const ticketPreviewPermission = getSettingValue("ticketPreviewPermission");

    switch (ticketPreviewPermission) {
      case "user":
        return true;
      case "supervisor":
        return profile !== "user";
      default:
        return profile === "admin";
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleMarkAsUnread = async () => {
    try {
      await api.patch("/tickets/unread", {
        markedAsUnread: !isMarkedAsUnread,
        ticketId: ticket.id,
      });

      handleClose();
      onMarkAsUnread(!isMarkedAsUnread);
    } catch (err) {
      toastError(err);
      handleClose();
    }
  };

  const handleFinishTicket = async () => {
    // fixing here
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status: "closed",
        sendSurvey: false,
				actionNameUser: user?.name
      });

			deleteTicketFromList(ticket.id);

      track("Ticket Change", {
        Action: "End Ticket",
        Origin: "Right button",
      });

      handleClose();
    } catch (err) {
      toastError(err);
      handleClose();
    }
  };

  const handleOpenTicket = () => {
    history.push(`/tickets/${ticket.id}`);
    api.post(`/track-ticket-preview`, {
      ticketId: ticket.id,
      contactId: ticket.contactId,
    });
    handleClose();
  };

  const handleFixTicket = async () => {
    try {
      await api.put(`/tickets/${ticket.id}`, {
        ...ticket,
        isFixed: ticket.isFixed ? null : true,
      });

      setChangeIsFixed(uuid());

      handleClose();
    } catch (err) {
      toastError(err);
      handleClose();
    }
  };

	const handleCloseTransferTicketModal = () => {
    setTransferTicketModalOpen(false);
		setDisabled(false);
  };

  const handleOpenTransferModal = (e) => {
		setDisabled(true);
    handleClose();
    setTransferTicketModalOpen(true);
  };

  return (

		<>
		  <TransferTicketModal
        modalOpen={transferTicketModalOpen}
        onClose={handleCloseTransferTicketModal}
        ticketid={ticket.id}
        ticketWhatsappId={ticket.whatsappId}
        ticket={ticket}
      />

			<Menu
				anchorEl={anchorEl}
				getContentAnchorEl={null}
				anchorOrigin={{
					vertical: "center",
					horizontal: "right",
				}}
				keepMounted
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				open={Boolean(anchorEl)}
				onClose={handleClose}
			>
				<MenuItem onClick={handleMarkAsUnread}>
					{isMarkedAsUnread ? "Marcar como lido" : "Marcar como não lido"}
				</MenuItem>
				{isStatusPending && getTicketPreviewPermission(user.profile) && (
					<MenuItem onClick={handleOpenTicket}>Visualizar Ticket</MenuItem>
				)}
				<MenuItem onClick={handleFinishTicket}>Finalizar</MenuItem>
				{ticket.isFixed && ticket.status === "open" && (
					<MenuItem onClick={handleFixTicket}>Desafixar no Topo</MenuItem>
				)}
				{!ticket.isFixed && ticket.status === "open" && (
					<MenuItem onClick={handleFixTicket}>Fixar no Topo</MenuItem>
				)}
				{isMobile && (
					<MenuItem onClick={handleOpenTransferModal}>
						{i18n.t("ticketOptionsMenu.transfer")}
					</MenuItem>
				)}
			</Menu>
		</>

  );
};

export default TicketContextMenu;
