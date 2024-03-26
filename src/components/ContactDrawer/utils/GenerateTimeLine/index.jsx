import React, { useCallback, useEffect, useRef, useState } from 'react';

import CircularProgress from "@material-ui/core/CircularProgress";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../../../../services/api";
import { useStyles } from '../../styles';

export default function GenerateTimeline({ isTicketActions, contactId, open }) {
  const classes = useStyles();
  const { ticketId } = useParams();
  const lastUserAction = useRef(null);

  const [userActions, setUserActions] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const addZero = useCallback((number) => {
    if (number.length < 2) {
      number = "0" + number;
    }
    return number;
  }, []);

  const defOrigin = useCallback((action) => {
    if (action && action.fromUser === "ChatBot") {
      return "Potencial";
    } else if (action && action.action === "create" && action.fromUser) {
      return "Ativo";
    } else if (action && action.action === "create" && !action.fromUser) {
      return "Reativo";
    }
  }, []);

  const getUserActions = useCallback(async () => {
    try {
      const params = {
        pageNumber
      }

      if (isTicketActions) params.ticketId = ticketId;

      const { data } = await api.get(`/user-actions/${contactId}`, { params });
      setHasMore(data.hasMore);
      setUserActions((prevState) => [...prevState, ...data.userActions]
      );
    } catch (error) {
      toast.error('Houve um erro ao buscar o histórico do contato');
    }
  }, [contactId, pageNumber, setHasMore, setUserActions]);

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPageNumber(prevPage => prevPage + 1);
      }
    });

    if (lastUserAction.current) {
      intersectionObserver.observe(lastUserAction.current);
    }
    return () => intersectionObserver.disconnect();
  }, [userActions, setPageNumber]);

  useEffect(() => {
    if (open) getUserActions();
  }, [open, getUserActions]);

  const actions = userActions
    .map((action, index, array) => {
      const isLastIndex = array.length - 1 === index;
      const utcDate = action.createdAt;
      const origin = defOrigin(action);
      const localDate =
        addZero(new Date(utcDate).getDate().toString()) +
        "/" +
        addZero((new Date(utcDate).getMonth() + 1).toString()) +
        "/" +
        addZero(new Date(utcDate).getFullYear().toString()) +
        " - " +
        addZero(new Date(utcDate).getHours().toString()) +
        ":" +
        addZero(new Date(utcDate).getMinutes().toString());

      if (action.action.includes("mass closing")) {
        return (
          <div
            ref={isLastIndex && hasMore ? lastUserAction : undefined}
            className={classes.actionArea}
            key={index}
          >
            <p className={classes.actionTicket}>
              {`Ação em massa - tickets:  ${action.massActions
              .filter(
                (massAction) => massAction.ticket.contactId === contactId
              )
              .map((massAction) => {
                return ` ${massAction.ticketId}`;
              })}`}
            </p>
            <p className={classes.actionAct}>
              {`Ticket finalizado em massa por ${action.fromUser}`}{" "}
            </p>
            <i className={classes.actionDate}>{localDate}</i>
            <i className={classes.actionDate}>{}</i>
          </div>
        );
      }
      if (action.action.includes("ramal")) {
        return (
          <div
            ref={isLastIndex && hasMore ? lastUserAction : undefined}
            className={classes.actionArea}
            key={index}
          >
            <p className={classes.actionTicket}>{`ticket ${action.ticketId}`}</p>
            <p className={classes.actionAct}>
              {`Ticket transferido via RAMAL para ${action.toUser}`}{" "}
            </p>
            <i className={classes.actionDate}>{localDate}</i>
            <i className={classes.actionDate}>{}</i>
          </div>
        );
      }
      if (action.action.includes("pending -> open")) {
        return (
          <div
            ref={isLastIndex && hasMore ? lastUserAction : undefined}
            className={classes.actionArea}
            key={index}
          >
            <p className={classes.actionTicket}>{`ticket ${action.ticketId}`}</p>
            <p className={classes.actionAct}>
              {`Ticket obtido por ${action.toUser}`}{" "}
            </p>
            <i className={classes.actionDate}>{localDate}</i>
            <i className={classes.actionDate}>{}</i>
          </div>
        );
      }
      if (!action.toUser && action.action.includes("open -> pending")) {
        return (
          <div
            ref={isLastIndex && hasMore ? lastUserAction : undefined}
            className={classes.actionArea}
            key={index}
          >
            <p className={classes.actionTicket}>{`ticket ${action.ticketId}`}</p>
            <p className={classes.actionAct}>
              {`Ticket devolvido por ${action.fromUser}`}{" "}
            </p>
            <i className={classes.actionDate}>{localDate}</i>
          </div>
        );
      }
      if (action.action.includes("closed -> open") && action.fromUser) {
        return (
          <div
            ref={isLastIndex && hasMore ? lastUserAction : undefined}
            className={classes.actionArea}
            key={index}
          >
            <p className={classes.actionTicket}>{`ticket ${action.ticketId}`}</p>
            <p className={classes.actionAct}>
              {`Ticket reaberto por ${action.fromUser}`}{" "}
            </p>
            <i className={classes.actionDate}>{localDate}</i>
          </div>
        );
      }
      if (action.action.includes("-> closed") && action.fromUser) {
        return (
          <div
            ref={isLastIndex && hasMore ? lastUserAction : undefined}
            className={classes.actionArea}
            key={index}
          >
            <p className={classes.actionTicket}>{`ticket ${action.ticketId}`}</p>
            <p className={classes.actionAct}>
              {`Ticket fechado por ${action.fromUser}`}{" "}
            </p>
            <i className={classes.actionDate}>{localDate}</i>
          </div>
        );
      }
      if (
        action.action.includes("update") &&
        action.fromUser &&
        action.fromUser !== action.toUser
      ) {
        return (
          <div
            ref={isLastIndex && hasMore ? lastUserAction : undefined}
            className={classes.actionArea}
            key={index}
          >
            <p className={classes.actionTicket}>{`ticket ${action.ticketId}`}</p>
            <p className={classes.actionAct}>
              {`Transferência ${action.fromUser} -> ${action.toUser}`}{" "}
            </p>
            <i className={classes.actionDate}>{localDate}</i>
          </div>
        );
      }
      if (action.action === "create" && action.fromUser) {
        return (
          <div
            ref={isLastIndex && hasMore ? lastUserAction : undefined}
            className={classes.actionArea}
            key={index}
          >
            <p className={classes.actionTicket}>
              {`ticket ${action.ticketId}`}
            </p>
            <p className={classes.actionAct}>
              {`Ticket criado por ${action.fromUser}`}{" "}
            </p>
            <div className={classes.actionFooter}>
              <i className={classes.actionDate}>{localDate}</i>
              <i className={classes.actionDate}>{origin}</i>
            </div>
          </div>
        );
      }
      if (action.action === "create" && !action.fromUser) {
        return (
          <div
            ref={isLastIndex && hasMore ? lastUserAction : undefined}
            className={classes.actionArea}
            key={index}
          >
            <p className={classes.actionTicket}>{`ticket ${action.ticketId}`}</p>
            <p className={classes.actionAct}>
              {`Ticket criado pelo cliente`}{" "}
            </p>
            <div className={classes.actionFooter}>
              <i className={classes.actionDate}>{localDate}</i>
              <i className={classes.actionDate}>{origin}</i>
            </div>
          </div>
        );
      }
      if (action.action === "system create" && !action.fromUser) {
        return (
          <div
            ref={isLastIndex && hasMore ? lastUserAction : undefined}
            className={classes.actionArea}
            key={index}
          >
            <p className={classes.actionTicket}>{`ticket ${action.ticketId}`}</p>
            <p className={classes.actionAct}>
              {`Ticket criado pelo sistema`}{" "}
            </p>
            <div className={classes.actionFooter}>
              <i className={classes.actionDate}>{localDate}</i>
              <i className={classes.actionDate}>{origin}</i>
            </div>
          </div>
        );
      }
      if (action.action === "phone create" && !action.fromUser) {
        return (
          <div
            ref={isLastIndex && hasMore ? lastUserAction : undefined}
            className={classes.actionArea}
            key={index}
          >
            <p className={classes.actionTicket}>{`ticket ${action.ticketId}`}</p>
            <p className={classes.actionAct}>
              {`Ticket criado pelo celular`}{" "}
            </p>
            <div className={classes.actionFooter}>
              <i className={classes.actionDate}>{localDate}</i>
              <i className={classes.actionDate}>{origin}</i>
            </div>
          </div>
        );
      }
      if (action.action === "delete") {
        return (
          <div
            ref={isLastIndex && hasMore ? lastUserAction : undefined}
            className={classes.actionArea}
            key={index}
          >
            <p className={classes.actionTicket}>{`ticket ${action.ticketId}`}</p>
            <p className={classes.actionAct}>
              {`Ticket deletado por ${action.fromUser}`}{" "}
            </p>
            <i className={classes.actionDate}>{localDate}</i>
          </div>
        );
      }
      if (action.action === "preview") {
        return (
          <div
            ref={isLastIndex && hasMore ? lastUserAction : undefined}
            className={classes.actionArea}
            key={index}
          >
            <p className={classes.actionTicket}>{`ticket ${action.ticketId}`}</p>
            <p className={classes.actionAct}>
              {`Ticket visualizado por ${action.fromUser}`}{" "}
            </p>
            <i className={classes.actionDate}>{localDate}</i>
          </div>
        );
      }
      return <div style={{ background: 'red' }} ref={isLastIndex && hasMore ? lastUserAction : undefined} />;
    });

  return (
    <>
      {actions}
      {hasMore && <CircularProgress style={{ alignSelf: 'center', margin: '8px 0'}} />}
    </>
  );
};
