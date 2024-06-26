import React, { useEffect, useRef, useState } from "react";

import MenuItem from "@material-ui/core/MenuItem";
import Menu from "@material-ui/core/Menu";

import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import TransferTicketModal from "../TransferTicketModal";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";

import AddPeoplesModal from "../AddPeoplesModal";
import DeletePeoplesModal from "../DeletePeoplesModal";
import SelectAdminModal from "../SelectAdminModal/index";
import RemoveAdminModal from "../RemoveAdminModal";

const TicketOptionsGroupMenu = ({ ticket, menuOpen, handleClose, anchorEl }) => {
	const history = useHistory();

	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
	const [addPeoplesModal, setAddPeoplesModal] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [deletePeoplesModal, setDeletePeoplesModal] = useState(false);
	const [selectAdminModal, setSelectAdminModal] = useState(false);
	const [removeAdminModal, setRemoveAdminModal] = useState(false);

	const numberOfGroup = history.location.pathname.split('/')[2];

	const isMounted = useRef(true);

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const getHistory = async () => {
		try {
			toast.dark('Carregando Histórico, por favor aguarde', {
				position: "top-right",
				hideProgressBar: false,
				pauseOnHover: false,
				closeOnClick: true,
				draggable: true,
				autoClose: false,
			});
			await api.get(`/history/${ticket.id}`).then(() => {
				window.location.reload(true);
			})
		} catch (err) {
			toastError('Espere a aplicação iniciar, tente novamente em alguns segundos')
		}
	}

	const handleOnlyAdm = async (onlyAdminMenssage = true) => {
		const { data: { contact: { number } }, data } = await api.get(`/tickets/${numberOfGroup}`)
		await api.put('/group/onlyAdmin', {
			chatID: `${number}@g.us`,
			onlyAdminMenssage,
			whatsappId: ticket.whatsappId
		})
		if (onlyAdminMenssage) toast.success('Agora só quem fala são os admins!');
		else toast.success('Agora todos podem falar!');
		handleClose();
	}

	const alertWarning = () => {
		toast.warning(`Para uma maior facilidade, 
		vefique se todos os contatos do grupo estão salvos na lista de contatos!`);;
	}

	const handleOpenSelectAdminModal = e => {
		setSelectAdminModal(true);
		handleClose();
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

	const handleOpenRemoveAdminModal = e => {
		setRemoveAdminModal(true);
		handleClose();
	};


	const handleOpenAddPeoplesModal = e => {
		setAddPeoplesModal(true);
		handleClose();
	};

	const handleOpenDeletePeoplesModal = e => {
		setDeletePeoplesModal(true);
		handleClose();
	};

	const handleDeleteTicket = async () => {
		try {
			await api.delete(`/tickets/${ticket.id}`);
		} catch (err) {
			toastError(err);
		}
	};

	const handleOpenTransferModal = e => {
		setTransferTicketModalOpen(true);
		handleClose();
	};

	const handleCloseTransferTicketModal = () => {
		if (isMounted.current) {
			setTransferTicketModalOpen(false);
		}
	};

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
				<MenuItem onClick={handleOpenTransferModal}>
					Trocar Fila
				</MenuItem>
				<MenuItem onClick={getHistory}>
					Obter Historico
				</MenuItem>
				{isAdmin && (
					<>
						<MenuItem onClick={handleOpenAddPeoplesModal}>
							Adicionar pessoas
						</MenuItem>
					

						<MenuItem onClick={() => {
							handleOpenDeletePeoplesModal()
							alertWarning();
						}}>
							Remover pessoas
						</MenuItem>
					

						<MenuItem onClick={() => {
							handleOpenSelectAdminModal()
							alertWarning();
						}}>
							Tornar pessoas admins
						</MenuItem>
					

						<MenuItem onClick={() => {
							handleOpenRemoveAdminModal()
							alertWarning();
						}}>
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
			</Menu>
			<ConfirmationModal
				title={`${i18n.t("ticketOptionsMenu.confirmationModal.title")}${ticket.id
					} ${i18n.t("ticketOptionsMenu.confirmationModal.titleFrom")} ${ticket.contact.name
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
				status={ticket.status}
				ticket={ticket}
			/>
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

export default TicketOptionsGroupMenu;
