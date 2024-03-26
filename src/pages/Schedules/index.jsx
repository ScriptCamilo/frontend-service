import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import {
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableHead,
  TextField,
} from "@material-ui/core";
import {
  AttachFileOutlined,
  Check,
  DeleteOutline,
  Edit,
  FileCopyOutlined,
  MicOutlined,
  ReportProblemOutlined,
  Search as SearchIcon,
  Send,
} from "@material-ui/icons";
import dayjs from "dayjs";
import { toast } from "react-toastify";

import ConfirmationModal from "../../components/ConfirmationModal";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import ScheduleModal from "../../components/ScheduleModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import { dataReducer } from "../../reducers/data";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import { i18n } from "../../translate/i18n";
import { StyledTableCell, StyledTableRow } from "../StyledTable";
import { useStyles } from "./styles";

const Schedules = () => {
  const classes = useStyles();

  const lastSchedule = useRef(null);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [schedules, dispatch] = useReducer(dataReducer, []);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isCopy, setIsCopy] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchSchedules = useCallback(async () => {
    try {
      const { data } = await api.get("/schedules", {
        params: { searchParam, pageNumber },
      });
      setHasMore(data.hasMore);
      dispatch({ type: "LOAD_DATA", payload: data.schedules });
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

  const searchSchedules = useCallback(async () => {
    try {
      const { data } = await api.get("/schedules", {
        params: { searchParam },
      });
      setHasMore(data.hasMore);
      dispatch({ type: "SEARCH_DATA", payload: data.schedules });
      setPageNumber(1);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleToggleScheduleModal = () => {
    setTimeout(() => {
      setSelectedSchedule(null);
      setIsCopy(false);
    }, 200);
    setScheduleModalOpen((isOpen) => !isOpen);
  };

  const handleCloseConfirmationModal = () => {
    setDeletingSchedule(null);
    setConfirmModalOpen(false);
  };

  const handleDeleteSchedule = async () => {
    const scheduleId = deletingSchedule?.id;
    try {
      await api.delete(`/schedule/${scheduleId}`);
      toast.success(i18n.t("schedules.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingSchedule(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleSendNow = async (schedule) => {
    const scheduleId = schedule.id;
    try {
      await api.post(`/schedule/send-now/${scheduleId}`);
      toast.success(i18n.t("schedules.toasts.sendNow"));
    } catch (err) {
      toastError(err);
    }
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleModalOpen(true);
  };

  const handleMessageCopy = (schedule) => {
    setSelectedSchedule(schedule);
    setIsCopy(true);
    setScheduleModalOpen(true);
  };

  const mediaTypeIcon = (type) => {
    switch (type) {
      case "audio":
        return <MicOutlined className={classes.icons} />;
      case "chat":
        return null;
      default:
        return <AttachFileOutlined className={classes.icons} />;
    }
  };

  useEffect(() => {
    if (hasMore && pageNumber > 1) {
      setLoading(true);
      fetchSchedules();
    }
  }, [pageNumber, hasMore, fetchSchedules]);

  useEffect(() => {
    dispatch({ type: "RESET_DATA" });
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      searchSchedules();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, searchSchedules]);

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPageNumber((prevPage) => prevPage + 1);
      }
    });
    if (lastSchedule.current) {
      intersectionObserver.observe(lastSchedule.current);
    }
    return () => intersectionObserver.disconnect();
  }, [schedules]);

  useEffect(() => {
    const socket = openSocket({
      scope: "schedules",
      userId: user.id,
      component: "Schedules",
    });

    socket.on(`${user?.companyId}-schedules`, (data) => {
      const isUserSchedule = data?.schedule?.userId === user.id;
      const isAdmin = ["admin", "supervisor"].includes(user.profile);
      const isActionValid = ["create", "update", "delete"].includes(
        data.action
      );

      if (!isActionValid || (!isAdmin && !isUserSchedule)) return;

      if (data.action !== "delete") {
        return dispatch({
          type: "UPDATE_DATA",
          payload: data.schedule,
          sort: "date",
        });
      }

      return dispatch({
        type: "DELETE_DATA",
        payload: +data.scheduleId,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <MainContainer>
      <ConfirmationModal
        title={`${i18n.t("schedules.confirmationModal.deleteTitle")}`}
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={handleDeleteSchedule}
      >
        {i18n.t("schedules.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <ScheduleModal
        open={scheduleModalOpen}
        scheduleInfo={selectedSchedule}
        isCopy={isCopy}
        onClose={handleToggleScheduleModal}
      />
      <MainHeader>
        <Title>{i18n.t("schedules.title")}</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("schedules.searchPlaceholder")}
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
          <Button
            variant="contained"
            color="primary"
            onClick={handleToggleScheduleModal}
          >
            {i18n.t("schedules.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell padding="none" />
              <StyledTableCell align="center">
                {i18n.t("schedules.table.message")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("schedules.table.user")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("schedules.table.date")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("schedules.table.status")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("schedules.table.actions")}
              </StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            <>
              {schedules.map((schedule, index, arr) => (
                <StyledTableRow
                  innerRef={
                    index === arr.length - 1 && hasMore
                      ? lastSchedule
                      : undefined
                  }
                  key={schedule.id}
                >
                  <StyledTableCell padding="none" style={{ width: 0 }}>
                    {mediaTypeIcon(schedule.mediaType)}
                  </StyledTableCell>
                  <StyledTableCell>{schedule.body}</StyledTableCell>
                  <StyledTableCell align="center">
                    {schedule.user?.name}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {dayjs(schedule.date).format(
                      i18n.t("schedules.date.format")
                    )}
                  </StyledTableCell>
                  <StyledTableCell
                    align="center"
                    className={classes[`status_${schedule.status}`]}
                  >
                    {i18n.t(`schedules.status.${schedule.status}`)}
                  </StyledTableCell>
                  <StyledTableCell style={{ width: "212px" }} align="center">
                    {schedule.status === "error" ? (
                      <IconButton
                        size="small"
                        className={classes[`status_${schedule.status}`]}
                        disabled
                      >
                        <ReportProblemOutlined style={{ opacity: 0.54 }} />
                      </IconButton>
                    ) : null}
                    <IconButton
                      size="small"
                      className={
                        schedule.status === "sent"
                          ? classes[`status_${schedule.status}`]
                          : undefined
                      }
                      disabled={schedule.status === "sent"}
                      onClick={() => handleEditSchedule(schedule)}
                    >
                      {schedule.status === "sent" ? (
                        <Check style={{ opacity: 0.54 }} />
                      ) : (
                        <Edit />
                      )}
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => handleMessageCopy(schedule)}
                    >
                      <FileCopyOutlined />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => {
                        setConfirmModalOpen(true);
                        setDeletingSchedule(schedule);
                      }}
                    >
                      <DeleteOutline />
                    </IconButton>

                    <IconButton
                      size="medium"
                      disabled={schedule.status === "sent"}
                      onClick={() => handleSendNow(schedule)}
                    >
                      <Send />
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {loading && (
                <TableRowSkeleton emptyColumnIndex={0} columns={5} />
              )}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Schedules;
