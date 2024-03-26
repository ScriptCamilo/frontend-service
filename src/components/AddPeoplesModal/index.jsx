import React, { useContext, useEffect, useState } from "react";

import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import AddIcon from "@material-ui/icons/Add";
import Autocomplete, {
	createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ContactModalForGroup from "../ContactModalForGroup";

const filter = createFilterOptions({
	trim: true,
});

const AddPeoplesModal = ({ modalOpen, onClose, ticketid, ticketWhatsappId }) => {
	const history = useHistory();
	const [options, setOptions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchParam, setSearchParam] = useState("");
	const [listSelected, setListSelected] = useState([]);
	const [selectedContact, setSelectedContact] = useState(null);
	const [openTextBox, setOpenTextBox] = useState(false);
	const numberOfGroup = history.location.pathname.split('/')[2];
	const [newContactForGroup, setNewContactForGroup] = useState({});
	const [isHovering, setIsHovering] = useState(false);
	const [contactModalForGroupOpen, setContactModalForGroupOpen] = useState(false);
	const { user } = useContext(AuthContext);

	const handleClose = () => {
		setListSelected([])
		onClose();
		setSearchParam("");
		setOpenTextBox(false);
	};

	const handleAdd = async () => {
		const { data: { contact: { number } } } = await api.get(`/tickets/${numberOfGroup}`)
		const { data } = await api.put('/group/addPeoples', {
			chatID: `${number}@g.us`,
			peoples: listSelected,
			whatsappId: ticketWhatsappId,
		});
		if (data.type === 'ERROR_NUMBER') {
			toast.error('Algo deu errado! Verifique o(s) número(s)!')
			setListSelected([]);
			handleClose();
		}
		else {
			toast.success('Pessoa(s) Adicionada(s)!')
			setListSelected([]);
			handleClose();
		}
	}

	const handleListSelectd = async (e, newValue) => {
		if (newValue?.number && !listSelected.some(e => e.number === newValue.number)) {
			const { data: { contact: { number } } } = await api.get(`/tickets/${numberOfGroup}`)
			const { data: { groupMetadata: { participants }} } = await api.get(`/group/${number}@g.us`, {
				params: {
					whatsappId: ticketWhatsappId,
				}
			});
			const contactInGroup = participants.find(e => e.id.user === newValue.number);
			const contactInList = listSelected.find(e => e.includes(newValue.number))
			if (contactInGroup) {
				toast.error('Este contato já está no grupo');
				setSearchParam("");
			}
			else if(contactInList) {
				toast.error('Este contato já está na lista para ser adicionado');
				setSearchParam("");
			}
			else {
				setListSelected([...listSelected, `${newValue.number}@c.us`]);
				setSearchParam("");
				if(newValue.notification === undefined) toast.success('Contato adicionado a lista do grupo com sucesso!')
	  	}
		}
		else if (newValue?.name) {
			setNewContactForGroup({ name: newValue.name });
			setSearchParam("");
			setContactModalForGroupOpen(true);
		}
	}

	const renderOption = option => {
		if (option.number) {
			return `${option.name} - ${option.number}`;
		} else {
			return `${i18n.t("newTicketModal.add")} ${option.name}`;
		}
	};

	const renderOptionLabel = option => {
		if (option.number) {
			return `${option.name} - ${option.number}`;
		} else {
			return `${option.name}`;
		}
	};

	const createAddContactOption = (filterOptions, params) => {
		const filtered = filter(filterOptions, params);

		if (params.inputValue !== "" && !loading && searchParam.length >= 3) {
			filtered.push({
				name: `${params.inputValue}`,
			});
		}

		return filtered;
	};

	const handleSaveTicket = async contactId => {
		if (!contactId) return;
		setLoading(true);
		try {
			const { data: ticket } = await api.post("/tickets", {
				contactId: contactId,
				userId: user.id,
				status: "open",
			});
			history.push(`/tickets/${ticket.id}`);
		} catch (err) {
			toastError(err);
		}
		setLoading(false);
		handleClose();
	};

	const handleCloseContactForGroupModal = () => {
		setContactModalForGroupOpen(false);
	};

	useEffect(() => {
		if (!modalOpen || searchParam.length < 3) {
			setLoading(false);
			return;
		}
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchContacts = async () => {
				try {
					const { data } = await api.get("contacts", {
						params: {
							searchParam,
							ignoreOffset: 'true',
							includeGroup: 'false',
							channel: 'whatsapp',
						},
					});
					const contactsFilter = data.contacts;
					// contactsFilter = data.contacts.filter((e, i) => e.isGroup === false)
					setOptions(contactsFilter);
					setLoading(false);
				} catch (err) {
					setLoading(false);
					toastError(err);
				}
			};

			fetchContacts();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, modalOpen]);

	return (
		<>
			<ContactModalForGroup
				open={contactModalForGroupOpen}
				initialValues={newContactForGroup}
				onClose={handleCloseContactForGroupModal}
				onSave={handleListSelectd}
			/>
			<Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
					<DialogTitle id="form-dialog-title">
						Adicionar pessoas
					</DialogTitle>
					<div style={ { display: openTextBox ? 'none' : 'flex', alignItems: 'center', flexDirection: 'column' } }>
						<AddIcon
							onClick={() => setOpenTextBox(true)}
							onMouseEnter={() => setIsHovering(true)}
							onMouseLeave={() => setIsHovering(false)}
							style={ { display: openTextBox && 'none', cursor: isHovering && 'pointer' } }
						/>
						<p style={ { display: openTextBox && 'none' } }>total adicionado: {listSelected.length}</p>
					</div>
					{openTextBox && (
						<DialogContent dividers>
						<Autocomplete
							options={options}
							loading={loading}
							style={{ width: 300 }}
							clearOnBlur
							autoHighlight
							freeSolo
							clearOnEscape
							getOptionLabel={renderOptionLabel}
							renderOption={renderOption}
							filterOptions={createAddContactOption}
							onChange={(e, newValue) => {
								handleListSelectd(e, newValue)
								setOpenTextBox(false);
							}}
							renderInput={params => (
								<TextField
									{...params}
									label={i18n.t("newTicketModal.fieldLabel")}
									variant="outlined"
									autoFocus
									onChange={e => setSearchParam(e.target.value) }
									onKeyPress={e => {
										if (loading || !selectedContact) return;
										else if (e.key === "Enter") {
											handleSaveTicket(selectedContact.id);
										}
									}}
									InputProps={{
										...params.InputProps,
										endAdornment: (
											<React.Fragment>
												{loading ? (
													<CircularProgress color="inherit" size={20} />
												) : null}
												{params.InputProps.endAdornment}
											</React.Fragment>
										),
									}}
								/>
							)}
						/>
						<p>total adicionado: {listSelected.length}</p>
						</DialogContent>
					)}
					<DialogActions>
						<Button
							onClick={handleClose}
							color="secondary"
							disabled={loading}
							variant="outlined"
						>
							{i18n.t("transferTicketModal.buttons.cancel")}
						</Button>
						<ButtonWithSpinner
							variant="contained"
							type="button"
							color="primary"
							onClick={ handleAdd }
							disabled={ loading || !listSelected.length > 0 }
							loading={loading}
						>
							Adicionar
						</ButtonWithSpinner>
					</DialogActions>
			</Dialog>
		</>
	);
};

export default AddPeoplesModal;
