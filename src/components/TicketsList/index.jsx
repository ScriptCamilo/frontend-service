import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import { List, Paper } from "@material-ui/core";

import { useAuthContext } from "../../context/Auth/AuthContext";
import { useSettingsContext } from "../../context/SettingsContext";
import useTickets from "../../hooks/useTickets";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import { i18n } from "../../translate/i18n";
import TicketListItem from "../TicketListItem";
import TicketsListSkeleton from "../TicketsListSkeleton";
import { useStyles } from "./styles";

const ticketOrder = (ticket, state) => {
  if (ticket.order.order === "ASC" && ticket.order.column) {
    state = state.sort((a, b) => {
      const dateA = new Date(a[ticket.order.column]).getTime();
      const dateB = new Date(b[ticket.order.column]).getTime();
      if (ticket.order.order === "ASC" && ticket.order.column) {
        state = state.sort((a, b) => {
          const dateA = new Date(a[ticket.order.column]).getTime();
          const dateB = new Date(b[ticket.order.column]).getTime();

          if (a.isFixed && !b.isFixed) {
            return -1; // 'a' comes before 'b'
          }
          if (!a.isFixed && b.isFixed) {
            return 1; // 'b' comes before 'a'
          }
          if (a.isFixed && !b.isFixed) {
            return -1; // 'a' comes before 'b'
          }
          if (!a.isFixed && b.isFixed) {
            return 1; // 'b' comes before 'a'
          }

          if (dateA < dateB) {
            return -1;
          }
          if (dateA > dateB) {
            return 1;
          }
          return 0;
        });
      }
      if (dateA < dateB) {
        return -1;
      }
      if (dateA > dateB) {
        return 1;
      }
      return 0;
    });
  }

  if (ticket.order.order === "DESC" && ticket.order.column) {
    state = state.sort((a, b) => {
      const dateA = new Date(a[ticket.order.column]).getTime();
      const dateB = new Date(b[ticket.order.column]).getTime();
      if (ticket.order.order === "DESC" && ticket.order.column) {
        state = state.sort((a, b) => {
          const dateA = new Date(a[ticket.order.column]).getTime();
          const dateB = new Date(b[ticket.order.column]).getTime();

          if (a.isFixed && !b.isFixed) {
            return -1; // 'a' comes before 'b'
          }
          if (!a.isFixed && b.isFixed) {
            return 1; // 'b' comes before 'a'
          }
          if (a.isFixed && !b.isFixed) {
            return -1; // 'a' comes before 'b'
          }
          if (!a.isFixed && b.isFixed) {
            return 1; // 'b' comes before 'a'
          }

          if (dateA > dateB) {
            return -1;
          }
          if (dateA < dateB) {
            return 1;
          }
          return 0;
        });
      }
      if (dateA > dateB) {
        return -1;
      }
      if (dateA < dateB) {
        return 1;
      }
      return 0;
    });
  }

  return state;
};

const Reducer = (state, action) => {
  if (action.type === "LOAD_TICKETS") {
    const newTickets = action.payload.tickets;
    newTickets.forEach((ticket) => {
      const ticketIndex = state.findIndex((t) => t.id === ticket.id);
      if (ticketIndex !== -1) {
        state[ticketIndex] = ticket;
      } else {
        state.push(ticket);
      }
    });

    state = ticketOrder({ ...action.payload }, state);
    return [...state];
  }

  if (action.type === "RESET_UNREAD") {
    const ticketId = action.payload;

    const ticketIndex = state.findIndex((t) => t.id === ticketId);
    if (ticketIndex !== -1) {
      state[ticketIndex].unreadMessages = 0;
    }

    return [...state];
  }

  if (action.type === "UPDATE_TICKET") {
    const ticket = action.payload;

    const ticketIndex = state.findIndex((t) => t.id === ticket.id);
    if (ticketIndex !== -1) {
      state[ticketIndex] = ticket;
    } else {
      state.unshift(ticket);
    }

    state = ticketOrder(ticket, state);
    return [...state];
  }

  if (action.type === "UPDATE_TICKET_UNREAD_MESSAGES") {
    const ticket = action.payload;

    const ticketIndex = state.findIndex((t) => t.id === ticket.id);
    if (ticketIndex !== -1) {
      state[ticketIndex] = ticket;
      state.unshift(state.splice(ticketIndex, 1)[0]);
    } else {
      state.unshift(ticket);
    }

    state = ticketOrder(ticket, state);

    return [...state];
  }

  if (action.type === "UPDATE_TICKET_CONTACT") {
    const contact = action.payload;
    const ticketIndex = state.findIndex((t) => t.contactId === contact.id);
    if (ticketIndex !== -1) {
      state[ticketIndex].contact = contact;
    }
    return [...state];
  }

  if (action.type === "DELETE_TICKET") {
    const ticketId = action.payload;
    const ticketIndex = state.findIndex((t) => t.id === ticketId);
    if (ticketIndex !== -1) {
      state.splice(ticketIndex, 1);
    }

    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const TicketsList = (props) => {
  const {
    status,
    searchParam,
    subTabSearchParam,
    anchorEl,
    filters,
    showAll,
    selectedQueueIds,
    selectedUsersIds,
    updateCount,
    style,
    tab,
    searchClicked,
    arrowAnswering,
    arrowWaiting,
		setFunctionsDeleteTicketObject
  } = props;

  const classes = useStyles();
  const [ticketsList, dispatch] = useReducer(Reducer, []);
  const lastTicket = useRef(null);
  const ticketsTop = useRef(null);
  const { getSettingValue } = useSettingsContext();
  const {
    user,
    onlineUsers,
    timeoutUnqueued,
    connections,
    connectionsMeta,
    ticketsNoQueue,
  } = useAuthContext();

  const [pageNumber, setPageNumber] = useState(1);
  const [lastIdTagged, setLastIdTagged] = useState({
    ticketId: 0,
    userTicketId: 0,
  });
  const [searchedList, setSearchedList] = useState([]);
  const [ticketTimeouts, setTicketTimeouts] = useState([]);
  const [selectedProfilesIdsWhatsapp, setSelectedProfilesIdsWhatsapp] =
    useState([]);
  const [selectedProfilesIdsWhatsappApi, setSelectedProfilesIdsWhatsappApi] =
    useState([]);
  const [selectedProfilesIdsMeta, setSelectedProfilesIdsMeta] = useState([]);

  const [changeIsFixed, setChangeIsFixed] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

	const [hasMoreSearch, setHasMoreSearch] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const { tickets, hasMore, loading } = useTickets({
    pageNumber,
    status,
    showAll,
    queueIds: JSON.stringify(selectedQueueIds),
    userIds: JSON.stringify(selectedUsersIds),
    tab,
    order: arrowAnswering || arrowWaiting,
    column: getSettingValue("ticketOrder"),
    selectedUsersIds: JSON.stringify(selectedUsersIds),
    changeIsFixed,
  });

  useEffect(() => {
    async function init() {
      if (connections && connectionsMeta) {
        setSelectedProfilesIdsWhatsapp(ticketsNoQueue.noQueueWhatsapp || []);
        setSelectedProfilesIdsMeta(ticketsNoQueue.noQueueMeta || []);
        setSelectedProfilesIdsWhatsappApi(
          ticketsNoQueue.noQueueWhatsappApi || []
        );
      }
    }

    if (
      selectedProfilesIdsMeta?.length > 0 ||
      selectedProfilesIdsWhatsapp?.length > 0 ||
      selectedProfilesIdsWhatsappApi?.length > 0
    ) {
      return;
    }
    init();
  }, [
    connections,
    connectionsMeta,
    user,
    selectedProfilesIdsMeta,
    selectedProfilesIdsWhatsapp,
  ]);

  useEffect(() => {
    const ids = onlineUsers
      .filter((user) => user.profile !== "admin")
      .map((user) => user.id);
    if (lastIdTagged.userTicketId === 0) {
      setLastIdTagged({ ticketId: 0, userTicketId: ids[0] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlineUsers]);

  useEffect(() => {
    setPageNumber(1);
  }, [
    searchClicked,
    subTabSearchParam,
    showAll,
    selectedQueueIds,
    selectedUsersIds,
  ]);

  useEffect(() => {
    if (pageNumber && showAll && filters) {
      const getSearchedList = async () => {
        const { data } = await api.get("/filtered-tickets", {
          params: {
            pageNumber,
            searchParam: subTabSearchParam ?? searchParam,
            showAll,
            filters,
          },
        });

				setHasMoreSearch(data.hasMore)
        setTimeout(() => {
          if (pageNumber !== 1) {
            setSearchedList([...searchedList, ...data.tickets]);
            updateCount(searchedList.length + data.tickets.length)
          } else {
            setSearchedList(data.tickets);
            updateCount(data.tickets.length);
          }
        }, 500);
      };

      getSearchedList();

      // const interval = setInterval(() => {
      //   getSearchedList();
      // }, 3000);

      // return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchClicked, pageNumber, showAll, tab, setHasMoreSearch]);

  useEffect(() => {
    if (!status && !searchParam && tab !== "search") return;

    if (anchorEl) {
      return;
    }

    if (pageNumber === 1) {
      dispatch({ type: "RESET" });
    }

    const order = {
      order: arrowAnswering || arrowWaiting,
      column: ticketOrder,
    };

    dispatch({
      type: "LOAD_TICKETS",
      payload: { tickets, order },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets, status, filters]);

  const userCanSeePotential = useCallback(
    (data) => {
      if (!data.ticket.queue) {
        return (
          selectedProfilesIdsWhatsapp.some(
            (e) =>
              e.whatsappId === data.ticket.whatsappId && e.userId === user.id
          ) ||
          selectedProfilesIdsMeta.some(
            (e) => e.metaId === data.ticket.metaId && e.userId === user.id
          ) ||
          selectedProfilesIdsWhatsappApi.some(
            (e) =>
              e.whatsappApiId === data.ticket.whatsappApiId &&
              e.userId === user.id
          )
        );
      } else {
        return true;
      }
    },
    [
      selectedProfilesIdsMeta,
      selectedProfilesIdsWhatsapp,
      selectedProfilesIdsWhatsappApi,
      user.id,
    ]
  );

  useEffect(() => {
    const socketTimeout = setTimeout(() => {
      const socket = openSocket({
        scope: `tickets-${status || "notification"}`,
        userId: user.id,
        component: `TicketsList-${status || "notification"}`,
      });

      const shouldUpdateTicket = (ticket) =>
        (!ticket.userId ||
          ticket.userId === user?.id ||
          selectedUsersIds?.some((id) => id === ticket.userId)) &&
        (!ticket.userId ||
          ticket.userId === user?.id ||
          selectedUsersIds?.some((id) => id === ticket.userId)) &&
        (!ticket.queueId || selectedQueueIds?.indexOf(ticket.queueId) > -1);

      const notBelongsToUserQueues = (ticket) =>
        ticket.queueId && selectedQueueIds?.indexOf(ticket.queueId) === -1;

      socket.on("connect", () => {
        if (status) {
          socket.emit("joinTickets", status);
        } else {
          socket.emit("joinNotification");
        }
      });

      socket.on(`${user?.companyId}-ticket`, (data) => {
        if (data.action === "updateUnread") {
          dispatch({
            type: "RESET_UNREAD",
            payload: data.ticketId,
          });
        }

        if (data.action === "autoFinish") {
          dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
        }

        if (
          data.action === "update" &&
          userCanSeePotential(data) &&
          (notBelongsToUserQueues(data.ticket) ||
            (data.ticket.userId &&
              data.ticket.userId !== user?.id &&
              !selectedUsersIds?.some((id) => id === data.ticket.userId)))
        ) {
          dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
        }

        if (
          data.action === "update" &&
          userCanSeePotential(data) &&
          shouldUpdateTicket(data.ticket) &&
          !anchorEl
        ) {
          const payload = data.ticket;
          payload.order = {
            order: arrowAnswering || arrowWaiting,
            column: ticketOrder,
          };
          dispatch({
            type: "UPDATE_TICKET",
            payload,
          });
        }

        if (data.action === "delete") {
          dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
        }
      });

      socket.on(`${user?.companyId}-appMessage`, (data) => {
        if (status !== data.ticket.status) return;
        if (
          data.action === "create" &&
          (userCanSeePotential(data) ||
            data.ticket.status === "open" ||
            data.ticket.status === "groups") &&
          shouldUpdateTicket(data.ticket) &&
          !anchorEl
        ) {
          const payload = data.ticket;
          payload.order = {
            order: arrowAnswering || arrowWaiting,
            column: ticketOrder,
          };
          payload.order = {
            order: arrowAnswering || arrowWaiting,
            column: ticketOrder,
          };
          dispatch({
            type: "UPDATE_TICKET_UNREAD_MESSAGES",
            payload,
          });
        }
      });

      socket.on(`${user?.companyId}-contact`, (data) => {
        if (data.action === "update") {
          dispatch({
            type: "UPDATE_TICKET_CONTACT",
            payload: data.contact,
          });
        }
      });

      return () => {
        console.log("disconnecting tickets list");
        socket.disconnect();
      };
    }, 2000);

    return () => clearTimeout(socketTimeout);
  }, [
    status,
    showAll,
    user,
    selectedQueueIds,
    selectedUsersIds,
    arrowAnswering,
    arrowWaiting,
    anchorEl,
    userCanSeePotential,
  ]);

  const deleteTicketFromList = useCallback((ticketId) => {
		if (filters) {
      setSearchedList((prev) => prev.filter((ticket) => ticket.id !== ticketId));
    }
    dispatch({ type: "DELETE_TICKET", payload: ticketId });
  }, []);

	useEffect(() => {
		setFunctionsDeleteTicketObject((prev) => ({
			...prev,
			[status]: deleteTicketFromList
		}));
	}, [status])

  useEffect(() => {
    let visibleTicketsList = ticketsList;

    ticketsList.forEach((ticket) => {
      const newDate = new Date();
      const actualDate = newDate.getTime() / 1000; // now date in seconds
      const ticketCreatedAt = Date.parse(ticket.createdAt) / 1000; // ticket create in seconds
      const ticketAge = actualDate - ticketCreatedAt; // ticket age in seconds
      const remainingTime = timeoutUnqueued - ticketAge; // remaining time in seconds

      if (remainingTime > 0 && !ticket.queueId) {
        visibleTicketsList = ticketsList.filter((t) => t.id !== ticket.id);

        updateCount(visibleTicketsList.length);

        if (!ticketTimeouts.includes(ticket.id)) {
          setTicketTimeouts((prevState) => [...prevState, ticket.id]);

          setTimeout(() => {
            setTicketTimeouts((prevState) =>
              prevState.filter((id) => id !== ticket.id)
            );
            visibleTicketsList = visibleTicketsList.push(ticket);

            updateCount(visibleTicketsList.length);
          }, remainingTime * 1000);
        }
      }
    });

    if (typeof updateCount === "function") {
      updateCount(
        visibleTicketsList?.filter(
          (ticket) =>
            (ticket.userId === user.id || !ticket.userId) &&
            ((ticket.status === "open" && ticket.unreadMessages > 0) ||
              ticket.status === "pending")
        )?.length
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketsList, ticketTimeouts]);

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setPageNumber((prevPage) => prevPage + 1);
      }
    });

    if (lastTicket.current) {
      intersectionObserver.observe(lastTicket.current);
    }

    return () => intersectionObserver.disconnect();
  }, [ticketsList, setPageNumber]);

  useEffect(() => {
    if (ticketsTop.current && !isMobile) {
      ticketsTop.current.scrollIntoView({});
    }
  }, [filters, showAll, selectedQueueIds, selectedUsersIds, isMobile]);

  return (
    <Paper className={classes.ticketsListWrapper} style={{ ...style }}>
      <Paper square name="closed" elevation={0} className={classes.ticketsList}>
        <List
          style={{
            paddingTop: 0,
            paddingBottom: 100,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div ref={ticketsTop}></div>
          {tab !== "search" &&
            ticketsList?.length === 0 &&
            !anchorEl &&
            !loading && (
              <div className={classes.noTicketsDiv}>
                <span className={classes.noTicketsTitle}>
                  {i18n.t("ticketsList.noTicketsTitle")}
                </span>
                <p className={classes.noTicketsText}>
                  {i18n.t("ticketsList.noTicketsMessage")}
                </p>
              </div>
            )}

          {tab !== "search" &&
            searchedList.length === 0 &&
            anchorEl &&
            !loading && (
              <div className={classes.noTicketsDiv}>
                <span className={classes.noTicketsTitle}>
                  {i18n.t("ticketsList.noTicketsTitle")}
                </span>
                <p className={classes.noTicketsText}>
                  {i18n.t("ticketsList.noTicketsMessage")}
                </p>
              </div>
            )}

          {tab === "search" && searchedList.length === 0 && !loading && (
            <div className={classes.noTicketsDiv}>
              <span className={classes.noTicketsTitle}>
                {i18n.t("ticketsList.noTicketsTitle")}
              </span>
              <p className={classes.noTicketsText}>
                {i18n.t("ticketsList.noTicketsMessage")}
              </p>
            </div>
          )}

          {tab !== "search" && (
            <>
              {ticketsList
                ?.filter((ticket) => {
                  const list =
                    user.profile !== "admin" && user.profile !== "supervisor"
                      ? ticket.userId === user.id || ticket.userId === null
                      : ticket;
                  return list;
                })
                .map((ticket, index, arr) => (
                  <TicketListItem
                    ticket={ticket}
                    key={ticket.id}
                    column={getSettingValue("ticketOrder")}
                    innerRef={
                      index === arr.length - 1 && hasMore
                        ? lastTicket
                        : undefined
                    }
                    setChangeIsFixed={setChangeIsFixed}
                    deleteTicketFromList={deleteTicketFromList}
                    userCanSeePotential={userCanSeePotential}
                  />
                ))}
            </>
          )}
          {(tab === "search" || anchorEl) && (
            <>
              {searchedList?.map((ticket, index, arr) => (
                <TicketListItem
                  ticket={ticket}
                  key={ticket.id}
                  column={getSettingValue("ticketOrder")}
                  innerRef={
                    index === arr.length - 1 && hasMore ? lastTicket : undefined
                  }
									deleteTicketFromList={deleteTicketFromList}
                  userCanSeePotential={userCanSeePotential}
                />
              ))}
            </>
          )}
          {((hasMore && !filters) || (hasMoreSearch && filters)) && <TicketsListSkeleton />}
        </List>
      </Paper>
    </Paper>
  );
};

export default TicketsList;
