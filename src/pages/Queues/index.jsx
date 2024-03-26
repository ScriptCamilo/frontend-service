import React, { useEffect, useReducer, useState } from "react";

import {
  Button,
  IconButton,
  makeStyles,
  Paper,
  Switch,
  Table,
  TableBody,
  TableHead,
} from "@material-ui/core";
import { DeleteOutline, Edit, SettingsBackupRestore } from "@material-ui/icons";
import { toast } from "react-toastify";

import ConfirmationModal from "../../components/ConfirmationModal";
import DistributionModal from "../../components/DistributionModal";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import QueueModal from "../../components/QueueModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { useAuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import { i18n } from "../../translate/i18n";
import { getSuperUserEmail } from "../../config";
import TransferQueueModal from "../../components/TransferQueueModal";
import { StyledTableCell, StyledTableRow } from "../StyledTable";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customStyledTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  allowedUsersDropdown: {
    width: "400px",
    padding: "0 1em",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },

  switch_track: {
    backgroundColor: "#afafaf",
  },
  switch_base: {
    color: "#ffffff",
    "&.Mui-disabled": {
      color: "#828282",
    },
    "&.Mui-checked": {
      color: "#27ff52",
    },
    "&.Mui-checked + .MuiSwitch-track": {
      backgroundColor: "#049d23",
    },
  },
  switch_primary: {
    "&.Mui-checked": {
      color: "#2576d2",
    },
    "&.Mui-checked + .MuiSwitch-track": {
      backgroundColor: "#2576d2",
    },
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_QUEUES") {
    const queues = action.payload;
    const newQueues = [];

    queues.forEach((queue) => {
      const queueIndex = state.findIndex((q) => q.id === queue.id);
      if (queueIndex !== -1) {
        state[queueIndex] = queue;
      } else {
        newQueues.push(queue);
      }
    });

    return [...state, ...newQueues];
  }

  if (action.type === "UPDATE_QUEUES") {
    const queue = action.payload;
    const queueIndex = state.findIndex((u) => u.id === queue.id);

    if (queueIndex !== -1) {
      state[queueIndex] = queue;
      return [...state];
    } else {
      return [queue, ...state];
    }
  }

  if (action.type === "DELETE_QUEUE") {
    const queueId = action.payload;
    const queueIndex = state.findIndex((q) => q.id === queueId);
    if (queueIndex !== -1) {
      state.splice(queueIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Queues = () => {
  const ADMIN_EMAIL = getSuperUserEmail();

  const classes = useStyles();
  const [queues, dispatch] = useReducer(reducer, []);
  const { users, user, getQueues } = useAuthContext();

  const [loading, setLoading] = useState(false);
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [queueTransferModalOpen, setQueueTransferModalOpen] = useState(false);
  const [distributionModalOpen, setDistributionModalOpen] = useState(false);
  const [deletedQueueId, setDeletedQueueId] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [distributionOn, setDistributionOn] = useState([]);
  const [deletedQueues, setDeletedQueues] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [queuesCount, setQueuesCount] = useState(0);

  const handleOpenQueueModal = () => {
    setQueueModalOpen(true);
    setSelectedQueue(null);
  };

  const handleCloseQueueModal = () => {
    setQueueModalOpen(false);
    setSelectedQueue(null);
  };

  const handleCloseDistributionModal = () => {
    setDistributionModalOpen(false);
    setSelectedDistribution(null);
  };

  const handleEditQueue = (queue) => {
    setSelectedQueue(queue);
    setQueueModalOpen(true);
  };

  const handleEditDistribution = (distribution, queue) => {
    setSelectedDistribution(distribution);
    setDistributionModalOpen(true);
    setSelectedQueue(queue);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedQueue(null);
  };

  const handleDeleteQueue = async (queueId) => {
    try {
      const { data } = await api.get(`/all-tickets?queueId=${queueId}`);
      if (data.tickets !== 0) {
        setQueueTransferModalOpen(true);
      } else {
        await api.delete(`/queue/${queueId}`);
        toast.success(i18n.t("queues.notifications.queueDeleted"));
      }
      setRefresh((prev) => prev + 1);
      setQueuesCount((prevState) => prevState - 1);
    } catch (err) {
      toastError(err);
    }
    setSelectedQueue(null);
  };

  const handleCloseQueueTransferModal = (cancel) => {
    if (cancel) {
      setQueueTransferModalOpen(false);
      setDeletedQueueId(null);
      return;
    }
    setDeletedQueueId(null);
    setQueueTransferModalOpen(false);
  };

  const handleRestore = async (queueId) => {
    try {
      await api.put(`/queue/restore/${queueId}`);
      toast.success("Setor restaurado com sucesso!");
      setRefresh((prev) => prev + 1);
    } catch (err) {
      toastError(err);
    }
  };

  const handleDistributionOn = async (distributionId) => {
    try {
      const distribution = distributionOn.find(
        (distribution) => distribution.id === distributionId
      );

      await api.put(`/distributions/${distributionId}`, {
        status: !distribution.status,
      });

      const filteredDistributions = distributionOn.filter(
        (distribution) => distribution.id !== distributionId
      );
      setDistributionOn([
        ...filteredDistributions,
        { ...distribution, status: !distribution.status },
      ]);
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { distributions },
        } = await api.get("/distributions/");

        setDistributionOn(distributions);
      } catch (err) {
        toastError(err);
      }
    })();
  }, [distributionModalOpen]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/queue");
        dispatch({ type: "LOAD_QUEUES", payload: data });
        setQueuesCount(data.length);
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, [refresh]);

  useEffect(() => {
    const getDeleted = async () => {
      try {
        const { data } = await api.get("/queue/deleted");
        setDeletedQueues(data);
      } catch (err) {
        toastError(err);
      }
    };

    getDeleted();
  }, [refresh]);

  useEffect(() => {
    const socket = openSocket({
      scope: "queues",
      userId: user.id,
      component: "Queues",
    });

    socket.on(`${user?.companyId}-queue`, (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_QUEUES", payload: data.queue });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_QUEUE", payload: data.queueId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          selectedQueue &&
          `${i18n.t("queues.confirmationModal.deleteTitle")} ${
            selectedQueue?.name
          }?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeleteQueue(selectedQueue.id)}
      >
        {i18n.t("queues.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <TransferQueueModal
        modalOpen={queueTransferModalOpen}
        onClose={handleCloseQueueTransferModal}
        queueId={deletedQueueId}
      />
      <QueueModal
        open={queueModalOpen}
        onClose={handleCloseQueueModal}
        queueId={selectedQueue?.id}
        setQueuesCount={setQueuesCount}
      />
      <DistributionModal
        open={distributionModalOpen}
        onClose={handleCloseDistributionModal}
        distribution={selectedDistribution}
        setDistribution={setSelectedDistribution}
        queueId={selectedQueue?.id}
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
          <Title>{i18n.t("queues.title")}</Title>
          <Title>Total: {queuesCount}</Title>
        </div>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenQueueModal}
          >
            {i18n.t("queues.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center">ID</StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("queues.table.name")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("queues.table.color")}
              </StyledTableCell>
              <StyledTableCell align="center">Distribuição</StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("queues.table.actions")}
              </StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            <>
              {queues.map((queue) => {
                const distribution = distributionOn?.find(
                  (distribution) => distribution.queueId === queue.id
                );
                const distributionUserIds = distribution?.userIds
                  ? JSON.parse(distribution?.userIds)
                  : [];
                const distributionStatus = distribution?.status || false;

                return (
                  <StyledTableRow key={queue.id}>
                    <StyledTableCell align="center">{queue.id}</StyledTableCell>
                    <StyledTableCell align="center">
                      {queue?.name}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <div className={classes.customStyledTableCell}>
                        <span
                          style={{
                            backgroundColor: queue.color,
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            alignSelf: "center",
                          }}
                        />
                      </div>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleEditDistribution(distribution, queue)
                        }
                      >
                        <Edit />
                      </IconButton>
                      <i style={{ fontSize: "0.75em", color: "#777777" }}>
                        {distribution?.userIds?.length
                          ? distributionUserIds?.length
                          : "0"}
                        /
                        {
                          users?.users?.filter((user) => {
                            return user.queues?.find(
                              (queue) => queue.id === distribution?.queueId
                            );
                          }).length
                        }
                      </i>

                      <Switch
                        classes={{
                          track: classes.switch_track,
                          switchBase: classes.switch_base,
                          colorPrimary: classes.switch_primary,
                        }}
                        disabled={
                          distributionUserIds?.length !== 0 ? false : true
                        }
                        checked={distributionStatus}
                        onChange={() => handleDistributionOn(distribution.id)}
                        inputProps={{ "aria-label": "controlled" }}
                      />
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {user.profile === "admin" && (
                        <>
                          <IconButton
                            size="small"
                            onClick={() => handleEditQueue(queue)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedQueue(queue);
                              setDeletedQueueId(queue.id);
                              setConfirmModalOpen(true);
                            }}
                          >
                            <DeleteOutline />
                          </IconButton>
                        </>
                      )}
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })}
              {loading && <TableRowSkeleton columns={5} />}
            </>
          </TableBody>
        </Table>
      </Paper>
      {user.email.includes(ADMIN_EMAIL) && (
        <>
          <Title>Setores excluídos</Title>
          <Paper className={classes.mainPaper} variant="outlined">
            <Table size="small">
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell align="center">ID</StyledTableCell>
                  <StyledTableCell align="center">
                    {i18n.t("queues.table.name")}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {i18n.t("queues.table.color")}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {i18n.t("queues.table.actions")}
                  </StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                <>
                  {deletedQueues.map((queue) => (
                    <StyledTableRow key={queue.id}>
                      <StyledTableCell align="center">
                        {queue.id}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {queue?.name}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <div className={classes.customStyledTableCell}>
                          <span
                            style={{
                              backgroundColor: queue.color,
                              borderRadius: "50%",
                              width: 20,
                              height: 20,
                              alignSelf: "center",
                            }}
                          />
                        </div>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleRestore(queue.id)}
                          // onClick={() => {
                          //   setSelectedQueue(queue);
                          //   setConfirmModalOpen(true);
                          // }}
                        >
                          <SettingsBackupRestore />
                        </IconButton>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                  {loading && <TableRowSkeleton columns={4} />}
                </>
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </MainContainer>
  );
};

export default Queues;
