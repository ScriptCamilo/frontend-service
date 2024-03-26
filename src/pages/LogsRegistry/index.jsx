import React, { useState, useEffect, useReducer } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import Paper from "@material-ui/core/Paper";

import api from "../../services/api";

import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { TableContainer } from "@material-ui/core";

import UserActionDetails from "../../components/UserActionDetails";
import getFormattedTimestamp from "../../helpers/getFormattedTimestamp";
import getActionMessage from "../../components/UserActionDetails/getActionMessage";
import { StyledTableCell, StyledTableRow } from "../StyledTable";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_ACTIONS") {
    const actions = action.payload;
    const newActions = [];

    actions.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newActions.push(contact);
      }
    });

    return [...state, ...newActions];
  }
};

const getActionOrigin = (userAction) => {
  if (!userAction.fromUser) {
    // return userAction.contactId ? "Cliente" : "Sistema";
    return "Sistema";
  }
  return userAction.fromUser;
};

const LogsRegistry = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");

  const [userActions, dispatch] = useReducer(reducer, []);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUserActions = async () => {
        try {
          const { data } = await api.get("/user-actions", {
            params: { pageNumber },
          });
          dispatch({ type: "LOAD_ACTIONS", payload: data.userActions });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchUserActions();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [pageNumber]);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
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

  return (
    <MainContainer className={classes.mainContainer}>
      <MainHeader>
        <Title>Registro de Auditoria</Title>

        {/* <MainHeaderButtonsWrapper>
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
        </MainHeaderButtonsWrapper> */}
      </MainHeader>
      <TableContainer
        style={{ height: "90vh", overflow: "scroll" }}
        component={Paper}
        onScroll={handleScroll}
      >
        <Table size="medium" onScroll={handleScroll}>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="right">Origem</StyledTableCell>
              <StyledTableCell align="center">Ação</StyledTableCell>
              <StyledTableCell align="left">Data</StyledTableCell>
              <StyledTableCell align="left">Horário</StyledTableCell>
            </StyledTableRow>
          </TableHead>

          <TableBody>
            {userActions.length > 0 && (
              <>
                {userActions.map((userAction) => {
                  const timestamp = getFormattedTimestamp(userAction.createdAt);
                  const actionMessage = getActionMessage(userAction);

                  if (actionMessage === null) return;

                  return (
                    <StyledTableRow key={userAction.id}>
                      <StyledTableCell align="right">
                        {getActionOrigin(userAction)}
                      </StyledTableCell>
                      <StyledTableCell>
                        <UserActionDetails userAction={userAction} />
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        {timestamp.date}
                      </StyledTableCell>
                      <StyledTableCell align="left">{`${timestamp.time}h`}</StyledTableCell>
                    </StyledTableRow>
                  );
                })}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainContainer>
  );
};

export default LogsRegistry;
