import React, { useContext, useEffect, useState } from "react";

// Material UI Imports
import {
  Button,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";

import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import WhatsAppBussinessIcon from "../../assets/WhatsAppBusinessIconWithout.png";
import FacebookIcon from "@material-ui/icons/Facebook";
import InstagramIcon from "@material-ui/icons/Instagram";

import ArrowUp from "@material-ui/icons/ArrowDropUp";
import ArrowDown from "@material-ui/icons/ArrowDropDown";
import { MoreVert } from "@material-ui/icons";

// Components Imports
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { useHistory } from "react-router-dom";
import MainHeader from "../../components/MainHeader";
import MainContainer from "../../components/MainContainer";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TransferAllTicketModal from "../../components/TransferAllTicketModal";

//Services Imports
import api from "../../services/api";
import DeleteAllTicketModal from "../../components/DeleteAllTicketModal";
import ExportTicketsModal from "../../components/ExportTicketsModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import { TicketLogFilters } from "../../components/TicketLogFilters";
import TicketInfos from "./TicketInfos";
import { StyledTableCell, StyledTableRow } from "../StyledTable";

const statusPT = {
  open: { name: "Aberto", color: "#4caf50" },
  closed: { name: "Finalizado", color: "#757575" },
  pending: { name: "Pendente", color: "#2196f3" },
  groups: { name: "Grupo", color: "#9575cd" },
};

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 180,
  },
  button: {
    width: "100%",
    color: "white",
    padding: "4px",
    borderRadius: "4px",
  },
}));

const INITIAL_FILTERS = { extraFields: {} };

const EndTickets = () => {
  const classes = useStyles();

  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [originalList, setOriginalList] = useState([]);
  const [ticketsList, setTicketsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const [deleteAllTicketModalOpen, setDeleteAllTicketModalOpen] =
    useState(false);
  const [transferAllTicketModalOpen, setTransferAllTicketModalOpen] =
    useState(false);
  const [exportTicketsModalOpen, setExportTicketsModalOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [lastSanitizedFilters, setLastSanitizedFilters] =
    useState(INITIAL_FILTERS);
  const [countTickets, setCountTickets] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

  useEffect(() => {
    if (pageNumber === 1) return;

    const sanitizedFilters = {
      email: filters.email,
      name: filters.name,
      number: filters.number,
      isGroup: filters.isGroup,
      userIds: filters.user,
      channels: filters.channel,
      extraFields: Object.entries(filters.extraFields).map(([key, value]) => {
        if (value !== "" && value !== null && value.length !== 0) {
          return {
            fieldName: key,
            fieldValue: value,
          };
        }
      }),
      createdAtStart: filters.createdAtStart,
      createdAtEnd: filters.createdAtEnd,
      updatedAtStart: filters.updatedAtStart,
      updatedAtEnd: filters.updatedAtEnd,
      motives: filters.motive,
      queueIds: filters.queue,
      status: filters.status,
      tags: filters.tag,
      origins: filters.origin,
      protocol: filters.protocol,
    };

    const fetchMoreTickets = async () => {
      try {
        const { data } = await api.post("/tickets/filtered-tickets", {
          ...sanitizedFilters,
          pageNumber,
        });

        setTicketsList((prevList) => [...prevList, ...data.tickets]);
        setCountTickets(data.count);
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };

    fetchMoreTickets();
  }, [pageNumber]);

  const resetData = () => {
    setTicketsList([]);
    setOriginalList([]);
    fetchTickets();
  };

  const goToTicket = (ticketId) => {
    history.push(`tickets/${ticketId}`);
  };

  const filterActualList = (filterName) => {
    if (filterName === "Todos") {
      setTicketsList(originalList);
    } else if (filterName === "Abertos") {
      const filterList = originalList
        .filter((ticket) => ticket.status === "open")
        .sort(function (a, b) {
          return new Date(b.start) - new Date(a.start);
        });
      setTicketsList(filterList);
    } else if (filterName === "Finalizados") {
      const filterList = originalList
        .filter((ticket) => ticket.status === "closed")
        .sort(function (a, b) {
          return new Date(b.end) - new Date(a.end);
        });
      setTicketsList(filterList);
    } else if (filterName === "Pendentes") {
      const filterList = originalList
        .filter((ticket) => ticket.status === "pending")
        .sort(function (a, b) {
          return new Date(b.end) - new Date(a.end);
        });
      setTicketsList(filterList);
    } else if (filterName === "Feedbacks") {
      const filterList = originalList
        .filter((ticket) => ticket.isFeedback === true)
        .sort(function (a, b) {
          return new Date(b.end) - new Date(a.end);
        });
      setTicketsList(filterList);
    } else if (filterName === "Tickets Receptivos") {
      const filterList = originalList
        .filter(
          (ticket) =>
            ticket.queue === "Sem Fila" && ticket.atendente === "Sem Atendente"
        )
        .sort(function (a, b) {
          return new Date(b.end) - new Date(a.end);
        });
      setTicketsList(filterList);
    } else if (filterName === "Tickets Potenciais") {
      const filterList = originalList
        .filter((ticket) => ticket.inChatBot === true)
        .sort(function (a, b) {
          return new Date(b.end) - new Date(a.end);
        });
      setTicketsList(filterList);
    }
  };

  const handleOpenDeleteAllModal = (e) => {
    setDeleteAllTicketModalOpen(true);
  };

  const handleCloseDeleteAllTicketModal = () => {
    setDeleteAllTicketModalOpen(false);
  };

  const handleOpenTransferAllTicketModal = (e) => {
    setTransferAllTicketModalOpen(true);
  };

  const handleCloseTransferAllTicketModal = () => {
    setTransferAllTicketModalOpen(false);
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

  const fetchTickets = async (params) => {
    try {
      const { data } = await api.post("/tickets/filtered-tickets/", {
        ...params,
      });
      setTicketsList(data.tickets);
      setCountTickets(data.count);
      setPageNumber(1);
      setHasMore(data.hasMore);
      setLoading(false);
      params
        ? setLastSanitizedFilters(params)
        : setLastSanitizedFilters(INITIAL_FILTERS);
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    setLoading(true);

    fetchTickets();
  }, [user]);

  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };

  const defineOrigim = (ticket) => {
    if (!ticket?.action || ticket?.action.length === 0) {
      return "";
    }

    if (
      ticket.action &&
      ticket.action.find(
        (action) => action.fromUser === null || action.fromUser === "Chatbot"
      )
    ) {
      return "Potencial";
    } else {
      return ticket.origin || "Ativo";
    }
  };

  const renderFilters = () => {
    if (!isMobile)
      return (
        <TicketLogFilters
          filters={filters}
          setFilters={setFilters}
          fetchTickets={fetchTickets}
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
            <TicketLogFilters
              filters={filters}
              setFilters={setFilters}
              fetchTickets={fetchTickets}
            />
          )}
        </>
      );
  };

  const renderMainHeaderButtons = () => {
    if (!isMobile) {
      return (
        <MainHeaderButtonsWrapper>
          {user.profile === "admin" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setExportTicketsModalOpen(true)}
            >
              Exportar Tickets
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDeleteAllModal}
          >
            Finalizar Tickets
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenTransferAllTicketModal}
          >
            Transferir tickets
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
            {user.profile === "admin" && (
              <MenuItem
                onClick={() => {
                  setExportTicketsModalOpen(true);
                  setMenuOpen(false);
                }}
              >
                Exportar Tickets
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                handleOpenDeleteAllModal();
                setMenuOpen(false);
              }}
            >
              Finalizar Tickets
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleOpenTransferAllTicketModal();
                setMenuOpen(false);
              }}
            >
              Transferir tickets
            </MenuItem>
          </Menu>
        </>
      );
    }
  };

  return (
    <MainContainer>
      <ExportTicketsModal
        open={exportTicketsModalOpen}
        onClose={() => setExportTicketsModalOpen(false)}
        lastSanitizedFilters={lastSanitizedFilters}
      />
      <DeleteAllTicketModal
        modalOpen={deleteAllTicketModalOpen}
        onClose={handleCloseDeleteAllTicketModal}
        onClick={resetData}
      />
      <TransferAllTicketModal
        modalOpen={transferAllTicketModalOpen}
        onClose={handleCloseTransferAllTicketModal}
      />
      <MainHeader>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Title>Relatório de Tickets</Title>
          <Title>Total: {countTickets}</Title>
        </div>

        {isMobile ? renderFilters() : renderMainHeaderButtons()}
      </MainHeader>

      {!isMobile && renderFilters()}

      <TableContainer
        style={{
          height: isMobile ? "" : "calc(100vh - 300px)",
          overflow: "auto",
          width: "100%",
        }}
        component={Paper}
        onScroll={handleScroll}
      >
        <Table size="medium">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center">Visualizar</StyledTableCell>
              <StyledTableCell align="center">Conexão</StyledTableCell>
              <StyledTableCell align="center">Protocolo</StyledTableCell>
              <StyledTableCell align="center">Status</StyledTableCell>
              <StyledTableCell align="center">Cliente</StyledTableCell>
              <StyledTableCell align="center">Atendente</StyledTableCell>
              <StyledTableCell align="center">Departamento</StyledTableCell>
              <StyledTableCell align="center">Data de criação</StyledTableCell>
              <StyledTableCell align="center">
                Data de finalização
              </StyledTableCell>
              <StyledTableCell align="center">
                Motivo de Finalização
              </StyledTableCell>
              <StyledTableCell align="center">Avaliação</StyledTableCell>
              <StyledTableCell align="center">Origem</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            <>
              {ticketsList?.length > 0 &&
                ticketsList.map((ticket, i) => (
                  <>
                    <StyledTableRow
                      style={{
                        cursor: "pointer",
                      }}
                      key={`row-${i}`}
                      onClick={() => {
                        selectedTicket?.id === ticket.id
                          ? setSelectedTicket(null)
                          : setSelectedTicket(ticket);
                      }}
                    >
                      <StyledTableCell align="left">
                        <IconButton
                          size="small"
                          onClick={() => goToTicket(ticket.id)}
                        >
                          {(!ticket.contact?.channel ||
                            ticket.contact?.channel === "whatsapp") && (
                            <WhatsAppIcon style={{ color: "green" }} />
                          )}
                          {ticket.contact?.channel === "whatsappApi" && (
                            <img
                              src={WhatsAppBussinessIcon}
                              style={{
                                width: "22px",
                                height: "22px",
                              }}
                              alt=""
                            />
                          )}
                          {ticket.contact?.channel === "facebook" && (
                            <FacebookIcon style={{ color: "blue" }} />
                          )}
                          {ticket.contact?.channel === "instagram" && (
                            <InstagramIcon style={{ color: "red" }} />
                          )}
                        </IconButton>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {ticket?.whatsapp?.name ||
                          ticket?.meta?.name ||
                          ticket?.whatsappApi?.name}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {ticket.id}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Button
                          className={classes.button}
                          style={{ background: statusPT[ticket.status].color }}
                        >
                          {statusPT[ticket.status].name}
                        </Button>
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        {ticket.contact?.name}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {ticket.user?.name}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {ticket.queue?.name}
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        {new Date(ticket.createdAt).toLocaleDateString(
                          "pt-BR",
                          options
                        )}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {ticket.status === "closed" &&
                          new Date(ticket.updatedAt).toLocaleDateString(
                            "pt-BR",
                            options
                          )}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {ticket.endTicket && ticket.endTicket[0]?.option}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {ticket.avaliation?.avaliation}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {ticket.origin || defineOrigim(ticket)}
                      </StyledTableCell>
                    </StyledTableRow>

                    {selectedTicket?.id === ticket.id && (
                      <TicketInfos ticketInfos={ticket} />
                    )}
                  </>
                ))}
              {loading && <TableRowSkeleton avatar columns={2} />}
            </>
          </TableBody>
        </Table>
      </TableContainer>
    </MainContainer>
  );
};

export default EndTickets;
