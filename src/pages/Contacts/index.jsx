import React, { useCallback, useEffect, useReducer, useState } from "react";

import {
  Input,
  Menu,
  MenuItem,
  Select,
  TableContainer,
  TextField,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import { ExpandLess, ExpandMore, MoreVert } from "@material-ui/icons";
import ArrowDown from "@material-ui/icons/ArrowDropDown";
import ArrowUp from "@material-ui/icons/ArrowDropUp";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import VisibilityIcon from "@material-ui/icons/Visibility";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import csvtojson from "csvtojson";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

import exemploImportarContatos from "../../assets/exemploImportarContatos.png";
import BarProgressModal from "../../components/BarProgressModal";
import { Can } from "../../components/Can";
import ConfirmationModal from "../../components/ConfirmationModal";
import { ContactFilters } from "../../components/ContactFIlters";
import ContactModal from "../../components/ContactModal";
import ExportContactsModal from "../../components/ExportContactsModal";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MarkdownWrapper from "../../components/MarkdownWrapper";
import NewTicketModalForSelectedContact from "../../components/NewTicketModalForSelectedContact";
import PocketingModal from "../../components/PocketingModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { useAuthContext } from "../../context/Auth/AuthContext";
import { useSettingsContext } from "../../context/SettingsContext";
import { useUsersContext } from "../../context/UsersContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import { i18n } from "../../translate/i18n";
import ContactInfos from "./ContactInfos";
import { useStyles } from "./styles";
import { StyledTableCell, StyledTableRow } from "../StyledTable";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const INITIAL_FILTERS = {
  extraFields: {},
};

const Contacts = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user, track, progress, showResults, setShowResults } = useAuthContext();
  const { getSettingValue } = useSettingsContext();
  const {
    users,
    pageNumber: usersPageNumber,
    setUsersPageNumber,
  } = useUsersContext();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [contacts, dispatch] = useReducer(reducer, []);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [fixedFields, setFixedFields] = useState();
  const [pocketingModal, setPocketingModal] = useState(false);
  const [exportContactsModalOpen, setExportContactsModalOpen] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [confirmOpenList, setConfirmOpenList] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [lastSanitizedFilters, setLastSanitizedFilters] =
    useState(INITIAL_FILTERS);
  const [allFields, setAllFields] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedContactInfos, setSelectedContactInfos] = useState([]);
  const [countContacts, setCountContacts] = useState(0);
  const [actualValueDate, setActualValueDate] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [allQueues, setAllQueues] = useState([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

  const URL = window.location.href;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/queue");
        setAllQueues(data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!progress) {
      setShowProgress(false);
    }
  }, [progress]);

  useEffect(() => {
    if (!usersPageNumber) setUsersPageNumber(1);
  }, [usersPageNumber, setUsersPageNumber]);

  useEffect(() => {
    const takeAllFields = async () => {
      const { data } = await api.get("/extrainfo/field");
      setAllFields(data);
    };
    takeAllFields();
  }, []);

  useEffect(() => {
    const fieldsList = getSettingValue("contactsFixedFields")?.split(",");
    setFixedFields(fieldsList?.filter((v) => v !== ""));
  }, [getSettingValue]);

  const fetchContactsInitial = useCallback(async (params) => {
    try {
      const { data } = await api.post("/filtered-contacts/", {
        ...(params && params),
      });
      setCountContacts(data.count);
      dispatch({ type: "RESET" });
      setPageNumber(1);
      dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
      setHasMore(data.hasMore);
      setLoading(false);
      params ? setLastSanitizedFilters(params) : setLastSanitizedFilters({});
    } catch (err) {
      toastError(err);
    }
  }, []);

  const fetchContacts = async (params) => {
    try {
      const { data } = await api.post("/filtered-contacts/", {
        ...(params ? params : filters),
      });
      setCountContacts(data.count);
      dispatch({ type: "RESET" });
      setPageNumber(1);
      dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
      setHasMore(data.hasMore);
      setLoading(false);
      params ? setLastSanitizedFilters(params) : setLastSanitizedFilters({});
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchContactsInitial();
  }, [fetchContactsInitial]);

  useEffect(() => {
    if (pageNumber === 1) return;

    const sanitizedFilters = {
      email: filters.email,
      name: filters?.name,
      number: filters.number,
      isGroup: filters.isGroup,
      tagIds: filters.tag,
      userIds: filters.user,
      channels: filters.channel,
      extraFields: Object.entries(filters.extraFields).map(([key, value]) => {
        if (value !== "" && value !== null) {
          return {
            fieldName: key,
            fieldValue: value,
          };
        }
        return null;
      }),
      createdAtStart: filters.createdAtStart,
      createdAtEnd: filters.createdAtEnd,
    };

    const fetchMoreContacts = async () => {
      try {
        const { data } = await api.post("/filtered-contacts/", {
          ...sanitizedFilters,
          pageNumber,
        });

        dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };

    fetchMoreContacts();
  }, [pageNumber, filters]);

  useEffect(() => {
    const socket = openSocket({
      userId: user.id,
      scope: "contacts",
      component: "Contacts",
    });

    socket.on(`${user?.companyId}-contact`, (data) => {
      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!selectedContact) return;

    (async () => {
      try {
        const { data } = await api.get(`/contacts/${selectedContact.id}`);
        setSelectedContactInfos(data);
      } catch (err) {
        toastError(err);
      }
    })();
  }, [selectedContact]);

  const handleimportListContact = async () => {
    try {
      await api.post("/contacts/import", fileList);
      setFileList([]);
    } catch (err) {
      toastError(err);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file.name.toLowerCase().endsWith(".csv")) {
      const newCsvFileReader = new FileReader();
      newCsvFileReader.onload = function (e) {
        csvtojson()
          .fromString(e.target.result)
          .then((json) => {
            const contactCsv = json.map(
              ({
                nome,
                Nome,
                NOME,
                telefone,
                Telefone,
                TELEFONE,
                atendente,
                Atendente,
                ATENDENTE,
                email,
                Email,
                EMAIL,
                ...customFields
              }) => {
                const extraInfo = Object.entries(customFields).map(
                  ([name, value]) => ({ name, value })
                );
                return {
                  name: nome || Nome || NOME,
                  number: telefone || Telefone || TELEFONE,
                  attendant: atendente || Atendente || ATENDENTE,
                  email: email || Email || EMAIL,
                  extraInfo,
                };
              }
            );
            setFileList(contactCsv);
          });
      };
      newCsvFileReader.readAsText(file);
    }

    if (file.name.toLowerCase().split(".").pop().startsWith("xls")) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const xlsxJson = XLSX.utils
        .sheet_to_json(worksheet)
        .map(
          ({
            nome,
            Nome,
            NOME,
            telefone,
            Telefone,
            TELEFONE,
            atendente,
            Atendente,
            ATENDENTE,
            email,
            Email,
            EMAIL,
            ...customFields
          }) => {
            let number = telefone || Telefone || TELEFONE;
            if (typeof number === "number") {
              number = number.toString();
            }
            const extraInfo = Object.entries(customFields).map(
              ([name, value]) => ({ name, value })
            );
            return {
              name: nome || Nome || NOME,
              number,
              attendant: atendente || Atendente || ATENDENTE,
              email: email || Email || EMAIL,
              extraInfo,
            };
          }
        );
      setFileList(xlsxJson);
    }
  };

  const handleOpenContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  const handleCloseNewTicketModal = () => {
    setNewTicketModalOpen(false);
  };

  const handleEditContact = (event, contactId) => {
    event.stopPropagation();
    setSelectedContactId(contactId);
    setContactModalOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.success(i18n.t("contacts.toasts.deleted"));
      setCountContacts((prevState) => prevState - 1);
    } catch (err) {
      toastError(err);
    }
    setDeletingContact(null);
    setPageNumber(1);
    fetchContacts();
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const updateClientPocketing = async (userId, contact) => {
    const data =
      userId !== undefined
        ? { ...contact, userId }
        : { ...contact, userId: null };

    if (contact.id) {
      try {
        await api.put(`/contacts/${contact.id}`, data);
        track(`Contact Attendant Change`, {
          Action: "Update",
          Name: contact.name,
          Origin: `${URL.split("/")[3]}`,
        });
      } catch (error) {
        toastError(error);
      }
    }
  };

  const updateQueuePocketing = async (queueId, contact) => {
    const data = queueId
      ? { ...contact, queueId }
      : { ...contact, queueId: null };

    if (contact.id) {
      try {
        await api.put(`/contacts/${contact.id}`, data);
      } catch (error) {
        toastError(error);
      }
    }
  };

  const formatNumber = (number) => {
    if (!number) return "";
    if (number.length === 13) {
      return number.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})/, "+$1 ($2) $3-$4");
    }
    if (number.length === 12) {
      return number.replace(/^(\d{2})(\d{2})(\d{4})(\d{4})/, "+$1 ($2) $3-$4");
    }
    return number;
  };

  const handleChangeValuesFields = async (value, field, contactId) => {
    field.value = value;
    try {
      await api.put(`/extrainfo/${contactId}`, { ...field, fieldId: field.id });
      track(`Custom Field Value Change`, {
        Action: "Update",
        Origin: `${URL.split("/")[3]}`,
        Name: field.name,
      });
    } catch (error) {
      toastError(error);
    }
  };

  const handleAddMedia = async (e, field, contactId) => {
    if (!e.target.files) {
      return;
    }

    const img = e.target.files[0];
    e.preventDefault();
    let formData = new FormData();
    formData.append("file", img);
    await api.post("/extrainfo/media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const url = `${process.env.REACT_APP_BACKEND_URL}/public/${img?.name}`;

    try {
      await api.put(`/extrainfo/${contactId}`, {
        name: field?.name,
        value: img?.name,
        fieldId: field.id,
        ticketId: undefined,
        path: url,
      });

      track(`Custom Field Value Change`, {
        Action: "Update",
        Origin: `${URL.split("/")[3]}`,
        Name: field.name,
      });

      fetchContacts();
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveMedia = async (field, contactId) => {
    try {
      await api.put(`/extrainfo/${contactId}`, {
        ...field,
        contactCustomFieldId: field.id,
      });
      fetchContacts();
    } catch (error) {
      toastError(error);
    }
  };

  const deleteExtraInfo = async (field, contactId) => {
    try {
      await api.delete(`/extrainfo/contactextrainfo/${contactId}`, {
        data: {
          fieldId: field.id,
          user: user.id,
        },
      });
      fetchContacts();
    } catch (error) {
      toastError(error);
    }
  };

  const findExtraInfo = (field, contact) => {
    return contact.extraInfo?.find((info) => info.name === field.name);
  };

  const isDisabled = (field) => {
    return field.onlyAdmin ? user?.profile !== "admin" : false;
  };

  const renderFilters = () => {
    if (!isMobile)
      return (
        <ContactFilters
          fetchContacts={fetchContacts}
          filters={filters}
          setFilters={setFilters}
        />
      );

    if (isMobile)
      return (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "10px",
            }}
          >
            <Button
              variant="contained"
              color="warning"
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtros{" "}
              {showFilters ? (
                <ArrowUp style={{ color: "black" }} />
              ) : (
                <ArrowDown style={{ color: "black" }} />
              )}
            </Button>
            {renderMainHeaderButtons()}
          </div>

          {showFilters && (
            <ContactFilters
              fetchContacts={fetchContacts}
              filters={filters}
              setFilters={setFilters}
            />
          )}
        </>
      );
  };

  const renderMainHeaderButtons = () => {
    if (!isMobile) {
      return (
        <MainHeaderButtonsWrapper>
          {progress ? (
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => {
                setShowProgress(true);
              }}
              style={{ whiteSpace: "wrap" }}
            >
              Status da Importação
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => {
                setConfirmOpenList(true);
              }}
              style={{ whiteSpace: "wrap" }}
            >
              {i18n.t("contacts.buttons.importlist")}
            </Button>
          )}

          {user.profile === "admin" && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setExportContactsModalOpen(true)}
              >
                Exportar Contatos
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setPocketingModal(!pocketingModal)}
              >
                Transferir Carterização
              </Button>
            </>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenContactModal}
          >
            {i18n.t("contacts.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      );
    } else {
      return (
        <>
          <IconButton
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={(e) => {
              setMenuOpen(true);
              setAnchorEl(e.currentTarget);
            }}
            color="inherit"
          >
            <span style={{ fontSize: "16px" }}>Opções</span>
            <MoreVert />
          </IconButton>
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
            onClose={() => setMenuOpen(false)}
          >
            {progress ? (
              <MenuItem
                onClick={(e) => {
                  setShowProgress(true);
                }}
                style={{ whiteSpace: "wrap" }}
              >
                Status da Importação
              </MenuItem>
            ) : (
              <MenuItem
                onClick={(e) => {
                  setConfirmOpenList(true);
                }}
                style={{ whiteSpace: "wrap" }}
              >
                {i18n.t("contacts.buttons.importlist")}
              </MenuItem>
            )}

            {user.profile === "admin" && (
              <>
                <MenuItem
                  onClick={() => {
                    setExportContactsModalOpen(true);
                    setMenuOpen(false);
                  }}
                >
                  Exportar Contatos
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setPocketingModal(!pocketingModal);
                    setMenuOpen(false);
                  }}
                >
                  Transferir Carterização
                </MenuItem>
              </>
            )}

            <MenuItem
              onClick={() => {
                handleOpenContactModal();
                setMenuOpen(false);
              }}
            >
              {i18n.t("contacts.buttons.add")}
            </MenuItem>
          </Menu>
        </>
      );
    }
  };

  return (
    <MainContainer className={classes.mainContainer}>
      <ExportContactsModal
        open={exportContactsModalOpen}
        lastSanitizedFilters={lastSanitizedFilters}
        onClose={() => setExportContactsModalOpen(false)}
      />

      <PocketingModal
        open={pocketingModal}
        onClose={async () => {
          setPocketingModal(!pocketingModal);
        }}
        aria-labelledby="form-dialog-title"
      ></PocketingModal>

      <NewTicketModalForSelectedContact
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={handleCloseNewTicketModal}
      />

      <ContactModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
        setCountContacts={setCountContacts}
      ></ContactModal>

      <BarProgressModal
        progress={progress}
        open={showProgress}
        onClose={() => {
          setShowProgress(false);
        }}
      />

			<ConfirmationModal
				title={`${i18n.t("contacts.confirmationModal.deleteTitle")}`}
				open={confirmOpen}
				onClose={setConfirmOpen}
				onConfirm={(e) => {
					handleDeleteContact(deletingContact.id);
					setDeletingContact(null);
				}}
			>
				{`${i18n.t("contacts.confirmationModal.deleteMessage")}`}
			</ConfirmationModal>

      <ConfirmationModal
        title={`${i18n.t("contacts.confirmationModal.importTitleList")}`}
        open={confirmOpenList}
        onClose={setConfirmOpenList}
        onConfirm={(e) => {
          handleimportListContact();
          setShowProgress(true);
        }}
      >
        Quantidade de Contatos a serem importados:<b> {fileList.length}</b>
        <br />
        <br /> Serão Importados da sua Lista: o Nome do Seu Contato (<b>Nome</b>
        ), o WhatsApp Vinculado a ele (<b>Telefone</b>), E-mail (<b>Email</b>) e
        Atendente Recorrente (<b>Atendente</b>).
        <br />
        <br />
        Serão Aceitos Telefones que Estiverem Completos com:{" "}
        <b>Código do País</b>,<b> DDD</b> e <b>WhatsApp Válido</b> (Sem
        Caracteres Especiais, Apenas Números).
        <br />
        <br />
        Para importar campos personalizados basta colocar o nome do campo no
        topo da coluna.
        <br />
        <br />
        Exemplo:
        <br />
        <br />
        <img
          src={exemploImportarContatos}
          alt="Exemplo de importar contatos vi CSV"
        />
        <br />
        <input type="file" onChange={handleFileChange} />
        <br />
        <br />
        {deletingContact
          ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
          : `${i18n.t("contacts.confirmationModal.importListMessage")}`}
      </ConfirmationModal>

      <ConfirmationModal
        title={`${i18n.t("contacts.confirmationModal.importTitleList")}`}
        open={Boolean(showResults)}
        onConfirm={() => setShowResults(false)}
				onClose={() => setShowResults(false)}
      >
        <b>Contatos Importados:</b>
        <br />
        <ol>
          {showResults.validNumbersArray?.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <b>Contatos Não Importados </b>(Caso hajam contatos nesta lista, os
        mesmos não foram adicionados pois não possuem um número de WhatsApp
        válidos ou já estão registrados na plataforma)<b>:</b>
        <br />
        <ol>
          {showResults.invalidNumbersArray?.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </ConfirmationModal>

      <MainHeader style>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Title>{i18n.t("contacts.title")}</Title>
          <Title>Total: {countContacts}</Title>
        </div>

        {isMobile ? renderFilters() : renderMainHeaderButtons()}
      </MainHeader>

      {!isMobile && renderFilters()}

      <TableContainer
        style={{
          height: "calc(100vh - 200px)",
          overflow: "scroll",
        }}
        component={Paper}
        onScroll={handleScroll}
      >
        <Table size="medium" onScroll={handleScroll}>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell padding="checkbox" />
              <StyledTableCell align="right">
                <p style={{ width: "80px", textAlign: "right" }}>
                  {i18n.t("contacts.table.actions")}
                </p>
              </StyledTableCell>
              <StyledTableCell style={{ lineHeight: "1.2em", width: "500px" }}>
                {i18n.t("contacts.table.name")}
              </StyledTableCell>
              <StyledTableCell align="right">Número</StyledTableCell>
              <StyledTableCell align="center">Atendente</StyledTableCell>
              <StyledTableCell align="center">Setor</StyledTableCell>
              {fixedFields?.map((info) => (
                <StyledTableCell
                  key={info}
                  style={{ lineHeight: "1.2em" }}
                  align="center"
                >
                  {info?.toUpperCase()}
                </StyledTableCell>
              ))}
              {/* Adiciona campos personalizados de contato */}
              {allFields
                ?.filter((info) => info.context === "contact")
								.sort((field, nextField) => {
									if ((field.order || 1) > (nextField.order || 1)) {
										return 1;
									} else if ((field.order || 1) === (nextField.order || 1)) {
										// Se os campos têm a mesma ordem, verificar em ordem alfabética
										if (field.name > nextField.name) {
												return 1;
										} else if (field.name < nextField.name) {
												return -1;
										} else {
												return 0;
										}
									} else {
										return -1;
									}
								})
                .map((info) => (
                  <StyledTableCell
                    key={info.name}
                    style={{ lineHeight: "1.2em" }}
                    align="center"
                  >
                    {info?.name}
                  </StyledTableCell>
                ))}
            </StyledTableRow>
          </TableHead>
          <TableBody>
            <>
              {contacts.map((contact) => (
                <>
                  <StyledTableRow>
                    <StyledTableCell align="rigth">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: "10px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          selectedContact?.id === contact.id
                            ? setSelectedContact(null)
                            : setSelectedContact(contact);

                          setSelectedContactInfos([]);
                        }}
                      >
                        {selectedContact?.id === contact.id ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                        <Avatar
                          style={{ width: "30px", height: "30px" }}
                          src={contact.profilePicUrl}
                        />
                      </div>
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <div style={{ width: "50px", display: "flex" }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setContactTicket(contact);
                            setNewTicketModalOpen(true);
                          }}
                        >
                          <WhatsAppIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleEditContact(e, contact.id)}
                        >
                          <EditIcon />
                        </IconButton>
                        <Can
                          role={user.profile}
                          perform="contacts-page:deleteContact"
                          yes={() => (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmOpen(true);
                                setDeletingContact(contact);
                              }}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          )}
                        />
                      </div>
                    </StyledTableCell>
                    <StyledTableCell
                      style={{ lineHeight: "1.2em", width: "500px" }}
                    >
                      <p style={{ width: "150px", fontSize: "0.8em" }}>
                        {contact?.name}
                      </p>
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      <p style={{ width: "150px", fontSize: "0.8em" }}>
                        {formatNumber(contact.number)}
                      </p>
                    </StyledTableCell>

                    <StyledTableCell
                      align="center"
                      style={{ fontSize: "0.8em", margin: "0px" }}
                    >
                      {user.profile === "admin" ||
                      !contact.userId ||
                      contact.userId === user.id ? (
                        <Select
                          defaultValue={contact.userId || ""}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MenuItem
                            key={user.id}
                            value={""}
                            onClick={() => updateClientPocketing(null, contact)}
                          >
                            Não atribuído
                          </MenuItem>
                          {users.map((user) => (
                            <MenuItem
                              key={user.id}
                              value={user.id}
                              onClick={() =>
                                updateClientPocketing(user.id, contact)
                              }
                            >
                              {user?.name}
                            </MenuItem>
                          ))}
                        </Select>
                      ) : (
                        <MarkdownWrapper>
                          {`${
                            contact.userId
                              ? users.find((user) => user.id === contact.userId)
                                  ?.name
                              : "Não"
                          }`}
                        </MarkdownWrapper>
                      )}
                    </StyledTableCell>

                    <StyledTableCell>
                      <Select
                        defaultValue={contact.queueId || ""}
                        onChange={({ target: { value } }) => {
                          if (value === "")
                            return updateQueuePocketing(value, contact);
                          return updateQueuePocketing(value, contact);
                        }}
                      >
                        <MenuItem key={""} value={""}>
                          Não atribuído
                        </MenuItem>
                        {allQueues?.map((queue) => (
                          <MenuItem key={queue.id} value={queue.id}>
                            {queue.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </StyledTableCell>

                    {allFields
                      ?.filter((info) => info.context === "contact")
											.sort((field, nextField) => {
												if ((field.order || 1) > (nextField.order || 1)) {
													return 1;
												} else if ((field.order || 1) === (nextField.order || 1)) {
													// Se os campos têm a mesma ordem, verificar em ordem alfabética
													if (field.name > nextField.name) {
															return 1;
													} else if (field.name < nextField.name) {
															return -1;
													} else {
															return 0;
													}
												} else {
													return -1;
												}
											})
                      .map((field) => (
                        <StyledTableCell
                          align="center"
                          style={{ fontSize: "0.8em", margin: "0px" }}
                          className={`${isDisabled(field) && classes.disabled}`}
                        >
                          {field.type === "text" &&
                            field.mask?.split("&")[1] === "DATA" && (
                              <TextField
                                variant="outlined"
                                size="small"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                value={(() => {
                                  if (actualValueDate[contact.id])
                                    return actualValueDate[contact.id];

                                  const value =
                                    contact.extraInfo?.find(
                                      (info) => info.name === field.name
                                    )?.value || "";

                                  if (value?.includes("/")) {
                                    return value.split("/").reverse().join("-");
                                  }
                                  return value;
                                })()}
                                ff
                                id="input-with-date"
                                onChange={async ({ target: { value } }) => {
                                  await handleChangeValuesFields(
                                    value,
                                    field,
                                    contact.id
                                  );
                                  setActualValueDate({
                                    ...actualValueDate,
                                    [contact.id]: value,
                                  });
                                }}
                              />
                            )}

                          {field.type === "text" &&
                            field.mask?.split("&")[1] !== "DATA" && (
                              <Input
                                style={{ width: "250px" }}
                                defaultValue={
                                  contact.extraInfo?.find(
                                    (info) => info.name === field.name
                                  )?.value || ""
                                }
                                onBlur={({ target: { value } }) =>
                                  handleChangeValuesFields(
                                    value,
                                    field,
                                    contact.id
                                  )
                                }
                              />
                            )}

                          {field.type === "singleOption" && (
                            <Select
                              defaultValue={
                                contact.extraInfo?.find(
                                  (info) => info.name === field.name
                                )?.value || ""
                              }
                              onChange={({ target: { value } }) => {
                                if (value === "")
                                  return deleteExtraInfo(field, contact.id);
                                return handleChangeValuesFields(
                                  value,
                                  field,
                                  contact.id
                                );
                              }}
                            >
                              <MenuItem key={""} value={""}>
                                Nenhum (a)
                              </MenuItem>
                              {field.options.map((option) => (
                                <MenuItem key={option.value} value={option.id}>
                                  {option.value}
                                </MenuItem>
                              ))}
                            </Select>
                          )}

                          {field.type === "multiOption" && (
                            <Select
                              multiple
                              defaultValue={function () {
                                const haveValue = contact.extraInfo
                                  ?.filter((info) => info.name === field.name)
                                  ?.map((info) => +info.value);

                                try {
                                  return haveValue.length > 0 ? haveValue : [];
                                } catch (error) {
                                  console.log(error);
                                  return [];
                                }
                              }}
                              onChange={({ target: { value } }) => {
                                handleChangeValuesFields(
                                  value,
                                  field,
                                  contact.id
                                );
                              }}
                              style={{ maxWidth: "250px", minWidth: "250px" }}
                            >
                              {field.options.map((option) => (
                                <MenuItem key={option.value} value={option.id}>
                                  {option.value}
                                </MenuItem>
                              ))}
                            </Select>
                          )}

                          {field.type === "media" && (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                              }}
                            >
                              <Button
                                component="label"
                                size="small"
                                variant="contained"
                                color="primary"
                                style={{
                                  margin: 0,
                                  padding: "0 0.8em",
                                  fontSize: "0.7rem",
                                  textAlign: "center",
                                  width: "150px",
                                  height: "30px",
                                }}
                              >
                                Adicionar Mídia
                                <input
                                  type="file"
                                  hidden
                                  onChange={(e) => {
                                    handleAddMedia(e, field, contact.id);
                                  }}
                                />
                              </Button>
                              {contact.extraInfo
                                ?.filter((info) => info.name === field.name)
                                .map((info, index) => (
                                  <>
                                    <p
                                      style={{
                                        fontSize: "1.2em",
                                        margin: "0px",
                                        width: "150px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {info?.value}
                                    </p>

                                    <div>
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          window.open(info?.path, "_blank");
                                        }}
                                      >
                                        <VisibilityIcon />
                                      </IconButton>

                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          handleRemoveMedia(
                                            {
                                              ...info,
                                              value: "",
                                            },
                                            contact.id
                                          );
                                        }}
                                      >
                                        <DeleteOutlineIcon />
                                      </IconButton>
                                    </div>
                                    {index !==
                                      contact.extraInfo?.filter(
                                        (info) => info.name === field.name
                                      ).length -
                                        1 && <hr style={{ width: "100%" }} />}
                                  </>
                                ))}
                            </div>
                          )}
                        </StyledTableCell>
                      ))}
                  </StyledTableRow>
                  {selectedContact?.id === contact.id && (
                    <ContactInfos contactInfos={selectedContactInfos} />
                  )}
                </>
              ))}
              {loading && <TableRowSkeleton avatar columns={3} />}
            </>
          </TableBody>
        </Table>
      </TableContainer>
    </MainContainer>
  );
};

export default Contacts;
