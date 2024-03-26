import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import openSocket from "../../services/socket-io";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TransferAllTicketModal from "../../components/TransferAllTicketModal";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import UserModal from "../../components/UserModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SettingsBackupRestore } from "@material-ui/icons";
import { Chip, Tooltip } from "@material-ui/core";
import { getSuperCompanyId, getSuperUserEmail } from "../../config";
import { StyledTableCell, StyledTableRow } from "../StyledTable";

const reducer = (state, action) => {
  if (action.type === "LOAD_USERS") {
    const users = action.payload;
    const newUsers = [];

    users.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }

  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex((u) => u.id === user.id);

    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    } else {
      return [user, ...state];
    }
  }

  if (action.type === "DELETE_USER") {
    const userId = action.payload;

    const userIndex = state.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      state.splice(userIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
}));

const Users = () => {
  const SUPER_USER_EMAIL = getSuperUserEmail();

  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [transferAllTicketModalOpen, setTransferAllTicketModalOpen] =
    useState(false);
  const [users, dispatch] = useReducer(reducer, []);
  const { user: loggedUser } = useContext(AuthContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    if (userModalOpen) {
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_USERS", payload: data.users });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, userModalOpen]);

  useEffect(() => {
    const getDeleted = async () => {
      try {
        const { data } = await api.get("/users/deleted");
        setDeletedUsers(data.users);
      } catch (err) {
        toastError(err);
      }
    };

    getDeleted();
  }, []);

  useEffect(() => {
    const socket = openSocket({
      scope: "user",
      userId: loggedUser.id,
      component: "Users",
    });

    socket.on(`${loggedUser?.companyId}-user`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_USERS", payload: data.user });
        setDeletedUsers((prevState) => {
          const userIndex = prevState?.findIndex((u) => u.id === data.user.id);
          if (userIndex === -1) {
            return prevState || [];
          }
          prevState.splice(userIndex, 1);
          return [...prevState];
        });
      }

      if (data.action === "delete") {
        const userFind = users.filter((u) => u.id === +data.userId);
        userFind[0].deleted = true;
        setDeletedUsers([...deletedUsers, ...userFind]);
        dispatch({ type: "DELETE_USER", payload: +data.userId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [users, setDeletedUsers]);

  const handleOpenUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success(i18n.t("users.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingUser(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleRestore = async (userId) => {
    try {
      await api.put(`/users/restore/${userId}`);
      toast.success("Usuário restaurado com sucesso!");
    } catch (err) {
      toastError(err);
    }
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

  const showButton = () => {
    if (!loggedUser.email.includes(SUPER_USER_EMAIL)) return false;
    return true;
  };

  const blockAll = async () => {
    try {
      await api.patch(`/users/`);
      toast.success(i18n.t("users.toasts.blocked"));
    } catch (err) {
      toastError(err);
    }
  };

  const unblockAll = async () => {
    try {
      await api.patch(`/users-unblock`);
      toast.success(i18n.t("users.toasts.unblocked"));
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenTransferAllTicketModal = (e) => {
    setTransferAllTicketModalOpen(true);
  };

  const handleCloseTransferAllTicketModal = (cancel) => {
    if (cancel) {
      setTransferAllTicketModalOpen(false);
      return;
    }
    handleDeleteUser(deletingUser.id);
    setTransferAllTicketModalOpen(false);
  };

  const checkUserTickets = async (user) => {
    const { data } = await api.get(`/users/${user.id}`);
    const openTicket = data.tickets.find(
      (ticket) => ticket.status !== "closed"
    );
    if (openTicket) setTransferAllTicketModalOpen(true);
    else handleDeleteUser(user.id);
  };

  const checkIsOnline = (isOnline) => {
    if (isOnline) {
      return <span style={{ color: "green" }}>●</span>;
    }
    return <span style={{ color: "red" }}>●</span>;
  };

  const renderQueues = ({ queues }) => {
    const renderChip = (queue) => (
      <Chip
        key={queue.id}
        style={{ backgroundColor: queue.color }}
        variant="outlined"
        label={queue.name}
        className={classes.chip}
      />
    );

    const noQueuesChip = (
      <Chip
        key="no-queues"
        variant="outlined"
        label={"Nenhum setor atribuido"}
        className={classes.chip}
      />
    );

    if (!queues.length) {
      return noQueuesChip;
    }

    const moreChips = (
      <Chip
        key="more"
        variant="outlined"
        label={"..."}
        className={classes.chip}
      />
    );

    const chipsToRender = queues.slice(0, 3).map(renderChip);

    if (queues.length > 3) {
      chipsToRender.push(moreChips);
    }

    return chipsToRender;
  };

  const userStyledTableRow = (user) => {
    const translate = {
      admin: "Administrador",
      supervisor: "Supervisor",
      user: "Atendente",
    };

    return (
      <StyledTableRow key={user.id}>
        <StyledTableCell align="center">{user.id}</StyledTableCell>
        {!user.deleted && (
          <StyledTableCell align="center">
            {checkIsOnline(user.isOnline)}
          </StyledTableCell>
        )}
        <StyledTableCell align="center">{user.name}</StyledTableCell>
        <StyledTableCell align="center">{user.email}</StyledTableCell>
        <StyledTableCell align="center">
          {translate[user.profile] || user.profile}
        </StyledTableCell>
        <StyledTableCell align="center" className={classes.chips}>
          {renderQueues(user)}
        </StyledTableCell>
        <StyledTableCell align="center">
          {loggedUser.profile === "admin" &&
            (!user.deleted ? (
              <>
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => handleEditUser(user)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setConfirmModalOpen(true);
                      setDeletingUser(user);
                    }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Restaurar">
                <IconButton size="small" onClick={() => handleRestore(user.id)}>
                  <SettingsBackupRestore />
                </IconButton>
              </Tooltip>
            ))}
        </StyledTableCell>
      </StyledTableRow>
    );
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingUser &&
          `${i18n.t("users.confirmationModal.deleteTitle")} ${
            deletingUser.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => checkUserTickets(deletingUser)}
      >
        O usuário será excluido e ele não terá mais acesso a plataforma. Se o
        usuário tiver ticket em aberto será necessário transferir os tickets.
      </ConfirmationModal>
      <TransferAllTicketModal
        modalOpen={transferAllTicketModalOpen}
        onClose={handleCloseTransferAllTicketModal}
        deletingUser={deletingUser}
      />
      <UserModal
        open={userModalOpen}
        onClose={handleCloseUserModal}
        aria-labelledby="form-dialog-title"
        userId={selectedUser && selectedUser.id}
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
          <Title>{i18n.t("users.title")}</Title>
          <Title>Total: {users.length}</Title>
        </div>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
          {showButton() && (
            <>
              <Button variant="contained" color="primary" onClick={unblockAll}>
                {i18n.t("users.buttons.unblockAll")}
              </Button>
              <Button variant="contained" color="secondary" onClick={blockAll}>
                {i18n.t("users.buttons.blockAll")}
              </Button>
            </>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenUserModal}
          >
            {i18n.t("users.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center">ID</StyledTableCell>
              <StyledTableCell align="center">Status</StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("users.table.name")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("users.table.email")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("users.table.profile")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("users.table.whatsapp")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("users.table.actions")}
              </StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            <>
              {users.map((user) => {
                return userStyledTableRow(user);
              })}
              {loading && <TableRowSkeleton columns={6} />}
            </>
          </TableBody>
        </Table>
      </Paper>
      {loggedUser.email.includes(SUPER_USER_EMAIL) && (
        <Paper className={classes.mainPaper} variant="outlined">
          <Title>Usuários Excluidos</Title>
          <Table size="small">
            <TableHead>
              <StyledTableRow>
                <StyledTableCell align="center">ID</StyledTableCell>
                {/* <StyledTableCell align="center">Status</StyledTableCell> */}
                <StyledTableCell align="center">
                  {i18n.t("users.table.name")}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {i18n.t("users.table.email")}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {i18n.t("users.table.profile")}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {i18n.t("users.table.whatsapp")}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {i18n.t("users.table.actions")}
                </StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              <>
                {deletedUsers?.map((user) => {
                  return userStyledTableRow(user);
                })}
                {loading && <TableRowSkeleton columns={6} />}
              </>
            </TableBody>
          </Table>
        </Paper>
      )}
    </MainContainer>
  );
};

export default Users;
