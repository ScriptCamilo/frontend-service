import React, { useState, useContext, useEffect } from "react";

import { Menu } from "@material-ui/core";
import MenuItem from "@material-ui/core/MenuItem";

import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ConfirmationModal from "../ConfirmationModal";
import ForwardModal from "../ForwardModal";
import NewTicketModalForSelectedContact from "../NewTicketModalForSelectedContact";
import EditMessageModal from "../EditMessageModal";
import { toast } from "react-toastify";

const NUMBER_LIMIT_MINUTES_EDIT = 900000;

const MessageOptionsMenu = ({ message, menuOpen, handleClose, anchorEl }) => {
  const { setReplyingMessage } = useContext(ReplyMessageContext);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [openForwardModal, setOpenForwardModal] = useState(false);
	const [openEditModal, setOpenEditModal] = useState(false);
  const [actualMessage, setActualMessage] = useState();
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
	const [isPossibleEdit, setIsPossibleEdit] = useState(false);

	const isPossibleEditBecauseMinutes = () => {
		return new Date(message.createdAt) > new Date(Date.now() - NUMBER_LIMIT_MINUTES_EDIT);
	}

	useEffect(() => {
		const isPossibleEdit = isPossibleEditBecauseMinutes() 
			&& message.body 
			&& (!['templates', 'comment'].includes(message.mediaType) || !message.type)
			&& message.fromMe; 
		setIsPossibleEdit(isPossibleEdit);
	}, [message.createdAt])

  const handleDeleteMessage = async () => {
    try {
      await api.delete(`/messages/${message.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  const hanldeReplyMessage = () => {
    setReplyingMessage(message);
    handleClose();
  };

  const handleOpenConfirmationModal = (e) => {
    setConfirmationOpen(true);
    handleClose();
  };

  const handleOpenForwardModal = (e) => {
    setActualMessage(message);
    setOpenForwardModal(true);
    handleClose();
  };

  const handleCloseForwardModal = (e) => {
    setOpenForwardModal(false);
    handleClose();
    setActualMessage();
  };

  const handleCloseNewTicketModal = () => {
    setNewTicketModalOpen(false);
  };

	const handleEditModalOpen = () => {
		if (!isPossibleEditBecauseMinutes()) {
			toast.error("A mensagem não pode ser editada após 15 minutos!");
			handleClose();
			return;
		}
		handleClose();
		setOpenEditModal(true);
	};

  return (
    <>
      <ForwardModal
        open={openForwardModal}
        onClose={handleCloseForwardModal}
        message={actualMessage}
      />
			<EditMessageModal
				open={openEditModal}
				onClose={() => setOpenEditModal(false)}
				message={message}
				isPossibleEditBecauseMinutes={isPossibleEditBecauseMinutes}
			/>
      <ConfirmationModal
        title={i18n.t("messageOptionsMenu.confirmationModal.title")}
        open={confirmationOpen}
        onClose={setConfirmationOpen}
        onConfirm={handleDeleteMessage}
      >
        {i18n.t("messageOptionsMenu.confirmationModal.message")}
      </ConfirmationModal>
      <NewTicketModalForSelectedContact
        modalOpen={newTicketModalOpen}
        initialContact={message.contact}
        onClose={handleCloseNewTicketModal}
      />
      <Menu
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={menuOpen}
        onClose={handleClose}
      >
        {message.fromMe && (
          <MenuItem onClick={handleOpenConfirmationModal}>
            {i18n.t("messageOptionsMenu.delete")}
          </MenuItem>
        )}
        <MenuItem onClick={hanldeReplyMessage}>
          {i18n.t("messageOptionsMenu.reply")}
        </MenuItem>
        <MenuItem onClick={() => handleOpenForwardModal()}>Encaminhar</MenuItem>
        {isPossibleEdit && (
					<MenuItem onClick={handleEditModalOpen}>Editar</MenuItem>
				)}
      </Menu>
    </>
  );
};

export default MessageOptionsMenu;
