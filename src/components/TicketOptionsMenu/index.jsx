import React, { useContext, useEffect, useRef, useState } from "react";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { toast } from "react-toastify";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import AddPeoplesModal from "../AddPeoplesModal";
import { Can } from "../Can";
import ConfirmationModal from "../ConfirmationModal";
import DeletePeoplesModal from "../DeletePeoplesModal";
import ExportMessagesModal from "../ExportMessagesModal";
import RemoveAdminModal from "../RemoveAdminModal";
import SelectAdminModal from "../SelectAdminModal/index";
import TransferTicketModal from "../TransferTicketModal";

const TicketOptionsMenu = ({
  ticket,
  menuOpen,
  handleClose,
  anchorEl,
  onlyExport,
  ignoreExport,
  ignoreDelete,
  showFinish,
  checkedFinish,
  isQueueAutoFinishEnabled,
	checkedAbsenceMessage,
  onChangeFinish,
	onChangeAbsenceMessage,
	viewAbsenceToggle,
  isMobile,
	setOpenFromOptionsMenu
}) => {
  const history = useHistory();

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const isMounted = useRef(true);
  const { user, user: loggedInUser, track } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [addPeoplesModal, setAddPeoplesModal] = useState(false);
  const [deletePeoplesModal, setDeletePeoplesModal] = useState(false);
  const [selectAdminModal, setSelectAdminModal] = useState(false);
  const [removeAdminModal, setRemoveAdminModal] = useState(false);

  const numberOfGroup = history.location.pathname.split("/")[2];

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const getHistory = async () => {
    try {
      toast.dark("Carregando Histórico, por favor aguarde", {
        position: "top-right",
        hideProgressBar: false,
        pauseOnHover: false,
        closeOnClick: true,
        draggable: true,
        autoClose: false,
      });
      await api.get(`/history/${ticket.id}`).then(() => {
        window.location.reload(true);
      });
      track("History Obtained");
    } catch (err) {
      toastError(
        "Espere a aplicação iniciar, tente novamente em alguns segundos"
      );
    }
  };

  const handleOnlyAdm = async (onlyAdminMenssage = true) => {
    const {
      data: {
        contact: { number },
      },
      data,
    } = await api.get(`/tickets/${numberOfGroup}`);
    await api.put("/group/onlyAdmin", {
      chatID: `${number}@g.us`,
      onlyAdminMenssage,
      whatsappId: ticket.whatsappId,
    });
    if (onlyAdminMenssage) toast.success("Agora só quem fala são os admins!");
    else toast.success("Agora todos podem falar!");
    handleClose();
  };

  const alertWarning = () => {
    toast.warning(`Para uma maior facilidade,
		vefique se todos os contatos do grupo estão salvos na lista de contatos!`);
  };

  const handleDeleteTicket = async () => {
    try {
      await api.delete(`/tickets/${ticket.id}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenConfirmationModal = (e) => {
    setConfirmationOpen(true);
    handleClose();
  };

  const handleCloseConfirmationModal = () => {
    setExportModalOpen(false);
    handleClose();
  };

  const handleOpenAddPeoplesModal = (e) => {
    setAddPeoplesModal(true);
    handleClose();
  };

  const handleChangeFinish = () => {
    onChangeFinish();
    handleClose();
  };

	const handleChangeAbsenceMessage = () => {
		onChangeAbsenceMessage();
		handleClose();
	};

  const handleOpenDeletePeoplesModal = (e) => {
    setDeletePeoplesModal(true);
    handleClose();
  };

  const handleOpenTransferModal = (e) => {
    setTransferTicketModalOpen(true);
    handleClose();
  };

  const handleOpenSelectAdminModal = (e) => {
    setSelectAdminModal(true);
    handleClose();
  };

  const handleOpenRemoveAdminModal = (e) => {
    setRemoveAdminModal(true);
    handleClose();
  };

  // const handleOpenTransferAllModal = e => {
  // 	setTransferAllTicketModalOpen(true);
  // 	handleClose();
  // };

  const handleCloseTransferTicketModal = () => {
    if (isMounted.current) {
      setTransferTicketModalOpen(false);
    }
  };

  const handleCloseAddPeoplesModal = () => {
    if (isMounted.current) {
      setAddPeoplesModal(false);
    }
  };

  const handleCloseDeletePeoplesModal = () => {
    if (isMounted.current) {
      setDeletePeoplesModal(false);
    }
  };

  const handleSelectAdminModal = () => {
    if (isMounted.current) {
      setSelectAdminModal(false);
    }
  };

  const handleRemoveAdminModal = () => {
    if (isMounted.current) {
      setRemoveAdminModal(false);
    }
  };

  // const handleCloseTransferAllTicketModal = () => {
  // 	if (isMounted.current) {
  // 		setTransferAllTicketModalOpen(false);
  // 	}
  // };

  if (onlyExport) {
    return (
      <>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={menuOpen}
          onClose={handleClose}
        >
          <MenuItem
            onClick={() => {
              setExportModalOpen(true);
            }}
          >
            {i18n.t("ticketOptionsMenu.export")}
          </MenuItem>
        </Menu>
        <ExportMessagesModal
          open={exportModalOpen}
          onClose={handleCloseConfirmationModal}
          ticket={ticket.id}
        />
      </>
    );
  }

  return (
    <>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={menuOpen}
        onClose={handleClose}
      >
        {isMobile && (
					<MenuItem onClick={handleOpenTransferModal}>
						{i18n.t("ticketOptionsMenu.transfer")}
					</MenuItem>
				)}
        {!["facebook", "instagram"].includes(ticket.contact.channel) && (
          <MenuItem onClick={getHistory}>Obter Historico</MenuItem>
        )}
        {!ignoreDelete && (
          <Can
            role={user.profile}
            perform="ticket-options:deleteTicket"
            yes={() => (
              <MenuItem onClick={handleOpenConfirmationModal}>
                {i18n.t("ticketOptionsMenu.delete")}
              </MenuItem>
            )}
          />
        )}
        {!["facebook", "instagram"].includes(ticket.contact.channel) &&
          !ignoreExport && (
            <MenuItem
              onClick={() => {
                setExportModalOpen(true);
              }}
            >
              {i18n.t("ticketOptionsMenu.export")}
            </MenuItem>
          )}
        {isAdmin && (
          <>
            <MenuItem onClick={handleOpenAddPeoplesModal}>
              Adicionar pessoas
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleOpenDeletePeoplesModal();
                alertWarning();
              }}
            >
              Remover pessoas
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleOpenSelectAdminModal();
                alertWarning();
              }}
            >
              Tornar pessoas admins
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleOpenRemoveAdminModal();
                alertWarning();
              }}
            >
              Remover pessoas admins
            </MenuItem>

            <MenuItem onClick={handleOnlyAdm}>
              Bloquear só para administradores falarem
            </MenuItem>

            <MenuItem onClick={() => handleOnlyAdm(false)}>
              Desbloquar para todos falarem
            </MenuItem>
          </>
        )}

        {isMobile && isQueueAutoFinishEnabled && (
          <MenuItem onClick={handleChangeFinish}>
            {checkedFinish ? "Desativar" : "Ativar"} Finalização Automática
          </MenuItem>
        )}

				{isMobile && viewAbsenceToggle && (
					<MenuItem onClick={handleChangeAbsenceMessage}>
						{checkedAbsenceMessage ? "Desativar" : "Ativar"} Mensagem de Ausência
					</MenuItem>
				)}

        <MenuItem onClick={() => setOpenFromOptionsMenu(true)}>Finalizar</MenuItem>
      </Menu>
      <ConfirmationModal
        title={`${i18n.t("ticketOptionsMenu.confirmationModal.title")}${
          ticket.id
        } ${i18n.t("ticketOptionsMenu.confirmationModal.titleFrom")} ${
          ticket.contact.name
        }?`}
        open={confirmationOpen}
        onClose={setConfirmationOpen}
        onConfirm={handleDeleteTicket}
      >
        {i18n.t("ticketOptionsMenu.confirmationModal.message")}
      </ConfirmationModal>
      <TransferTicketModal
        modalOpen={transferTicketModalOpen}
        onClose={handleCloseTransferTicketModal}
        ticketid={ticket.id}
        ticketWhatsappId={ticket.whatsappId}
        ticket={ticket}
      />
      <ExportMessagesModal
        open={exportModalOpen}
        onClose={handleCloseConfirmationModal}
        ticket={ticket.id}
      />
      {/* <TransferAllTicketModal
				modalOpen={transferAllTicketModalOpen}
				onClose={handleCloseTransferAllTicketModal}
				ticketid={ticket.id}
				ticketWhatsappId={ticket.whatsappId}
			/> */}
      <AddPeoplesModal
        modalOpen={addPeoplesModal}
        onClose={handleCloseAddPeoplesModal}
        ticketid={ticket.id}
        ticketWhatsappId={ticket.whatsappId}
      />
      <DeletePeoplesModal
        modalOpen={deletePeoplesModal}
        onClose={handleCloseDeletePeoplesModal}
        ticketid={ticket.id}
        ticketWhatsappId={ticket.whatsappId}
      />
      <SelectAdminModal
        modalOpen={selectAdminModal}
        onClose={handleSelectAdminModal}
        ticketid={ticket.id}
        ticketWhatsappId={ticket.whatsappId}
      />
      <RemoveAdminModal
        modalOpen={removeAdminModal}
        onClose={handleRemoveAdminModal}
        ticketid={ticket.id}
        ticketWhatsappId={ticket.whatsappId}
      />
    </>
  );
};

export default TicketOptionsMenu;
