import React, {
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
import { AttachFile, DeleteOutline, Edit } from "@material-ui/icons";
import SearchIcon from "@material-ui/icons/Search";
import { toast } from "react-toastify";

import ConfirmationModal from "../../components/ConfirmationModal";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import QuickAnswersModal from "../../components/QuickAnswersModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import { i18n } from "../../translate/i18n";
import { dataReducer } from "../../reducers/data";
import { useStyles } from "./styles";
import { StyledTableCell, StyledTableRow } from "../StyledTable";

const QuickAnswers = () => {
  const classes = useStyles();

  const lastQuickAnswer = useRef(null);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [quickAnswers, dispatch] = useReducer(dataReducer, []);
  const [selectedQuickAnswers, setSelectedQuickAnswers] = useState(null);
  const [quickAnswersModalOpen, setQuickAnswersModalOpen] = useState(false);
  const [deletingQuickAnswers, setDeletingQuickAnswers] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [quickAnswersCount, setQuickAnswersCount] = useState(0);

  const fetchQuickAnswers = async (isLoad) => {
    let data;
    try {
      if (isLoad) {
        const response = await api.get("/quickAnswers", {
          params: { searchParam, pageNumber },
        });
        data = response.data;
        setQuickAnswersCount(data.count);
        setHasMore(data.hasMore);
        dispatch({ type: "LOAD_DATA", payload: data.quickAnswers });
      } else {
        const response = await api.get("/quickAnswers", {
          params: { searchParam },
        });
        data = response.data;
        setQuickAnswersCount(data.count);
        setHasMore(data.hasMore);
        dispatch({ type: "SEARCH_DATA", payload: data.quickAnswers });
        setPageNumber(1);
      }

      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenQuickAnswersModal = () => {
    setSelectedQuickAnswers(null);
    setQuickAnswersModalOpen(true);
  };

  const handleCloseQuickAnswersModal = () => {
    setSelectedQuickAnswers(null);
    setQuickAnswersModalOpen(false);
  };

  const handleEditQuickAnswers = (quickAnswer) => {
    setSelectedQuickAnswers(quickAnswer);
    setQuickAnswersModalOpen(true);
  };

  const handleDeleteQuickAnswers = async (quickAnswerId) => {
    try {
      await api.delete(`/quickAnswers/${quickAnswerId}`);
      toast.success(i18n.t("quickAnswers.toasts.deleted"));
      setQuickAnswersCount((prevCount) => prevCount - 1);
    } catch (err) {
      toastError(err);
    }
    setDeletingQuickAnswers(null);
    setSearchParam("");
    setPageNumber(1);
  };

  useEffect(() => {
    if (hasMore && pageNumber > 1) {
      setLoading(true);
      fetchQuickAnswers(true);
    }
  }, [pageNumber]);

  useEffect(() => {
    dispatch({ type: "RESET_DATA" });
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchQuickAnswers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam]);

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPageNumber((prevPage) => prevPage + 1);
      }
    });
    if (lastQuickAnswer.current) {
      intersectionObserver.observe(lastQuickAnswer.current);
    }
    return () => intersectionObserver.disconnect();
  }, [quickAnswers]);

  useEffect(() => {
    const socket = openSocket({
      scope: "quickAnswer",
      userId: user.id,
      component: "QuickAnswers",
    });

    socket.on(`${user?.companyId}-quickAnswer`, (data) => {
      const isAdmin = ["admin", "supervisor"].includes(user.profile);
      const isActionValid = ["create", "update", "delete"].includes(
        data.action
      );
      const isUserQuickAnswer = data?.quickAnswer?.users.find(
        (userData) => userData.id === user.id
      );

      if (!isActionValid || (!isAdmin && !isUserQuickAnswer)) return;

      if (data.action !== "delete") {
        return dispatch({
          type: "UPDATE_DATA",
          payload: data.quickAnswer,
        });
      }

      return dispatch({
        type: "DELETE_DATA",
        payload: +data.quickAnswerId,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingQuickAnswers &&
          `${i18n.t("quickAnswers.confirmationModal.deleteTitle")} ${
            deletingQuickAnswers.shortcut
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteQuickAnswers(deletingQuickAnswers.id)}
      >
        {i18n.t("quickAnswers.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <QuickAnswersModal
        open={quickAnswersModalOpen}
        onClose={handleCloseQuickAnswersModal}
        aria-labelledby="form-dialog-title"
        quickAnswerInfo={selectedQuickAnswers}
        setQuickAnswersCount={setQuickAnswersCount}
      ></QuickAnswersModal>
      <MainHeader>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Title>{i18n.t("quickAnswers.title")}</Title>
          <Title>Total: {quickAnswersCount}</Title>
        </div>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("quickAnswers.searchPlaceholder")}
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
            onClick={handleOpenQuickAnswersModal}
          >
            {i18n.t("quickAnswers.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center">
                {i18n.t("quickAnswers.table.shortcut")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("quickAnswers.table.message")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("quickAnswers.table.actions")}
              </StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            <>
              {quickAnswers?.map((quickAnswer, index, arr) => (
                <StyledTableRow
                  innerRef={
                    index === arr.length - 1 && hasMore
                      ? lastQuickAnswer
                      : undefined
                  }
                  key={quickAnswer.id}
                >
                  <StyledTableCell align="center">
                    {quickAnswer.shortcut}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {quickAnswer.message}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditQuickAnswers(quickAnswer)}
                    >
                      {quickAnswer.mediaUrl && <AttachFile />}
                      <Edit />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingQuickAnswers(quickAnswer);
                      }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              {loading && <TableRowSkeleton columns={3} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default QuickAnswers;
