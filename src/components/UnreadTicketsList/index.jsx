import React, { useState, useEffect, useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Paper from "@material-ui/core/Paper";

import TicketListItem from "../TicketListItem";
import TicketsListSkeleton from "../TicketsListSkeleton";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  ticketsListWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  ticketsList: {
    flex: 1,
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    borderTop: "2px solid rgba(0, 0, 0, 0.12)",
  },

  ticketsListHeader: {
    color: "rgb(67, 83, 105)",
    zIndex: 2,
    backgroundColor: "white",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  ticketsCount: {
    fontWeight: "normal",
    color: "rgb(104, 121, 146)",
    marginLeft: "8px",
    fontSize: "14px",
  },

  noTicketsText: {
    textAlign: "center",
    color: "rgb(104, 121, 146)",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  noTicketsTitle: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0px",
  },

  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const UnreadTicketsList = ({
  selectedQueueIds,
  selectedUsersIds,
  updateCount,
  style,
  tab,
  isActive,
	pendingCount
}) => {
  const classes = useStyles();
  const [tickets, setTickets] = useState([]);
  const [hasMore, setHasMore] = useState();
  const [page, setPage] = useState();
  const [loading, setLoading] = useState(false);
  const { user, connections, connectionsMeta } = useContext(AuthContext);
	const [selectedProfilesIdsWhatsapp, setSelectedProfilesIdsWhatsapp] =
	useState([]);
	const [selectedProfilesIdsMeta, setSelectedProfilesIdsMeta] = useState([]);

  useEffect(() => {
    async function init() {
      if (connections && connectionsMeta) {
        const { data } = await api.get(`/tickets-no-queue/`);
        setSelectedProfilesIdsWhatsapp(data.noQueueWhatsapp);
        setSelectedProfilesIdsMeta(data.noQueueMeta);
      }
    }

    if (
      selectedProfilesIdsMeta.length > 0 ||
      selectedProfilesIdsWhatsapp.length > 0
    ) {
      return;
    }

    const interval = setInterval(() => {

      init();
    }, 3000);

    return () => clearInterval(interval);
  }, [
    connections,
    connectionsMeta,
    user,
    selectedProfilesIdsMeta,
    selectedProfilesIdsWhatsapp,
  ]);

  useEffect(() => {
    const getTickets = async () => {
      try {
				if (selectedProfilesIdsMeta.length > 0 || selectedProfilesIdsWhatsapp.length > 0) {
					let { data } = await api.get("/marked-as-unread/", {
						params: {
							queueIds: JSON.stringify(selectedQueueIds),
							userIds: JSON.stringify(selectedUsersIds),
						},
					});
					data.tickets = data.tickets.filter((data) => {
						if (!data.queue) {
							return (
								selectedProfilesIdsWhatsapp.some(
									(e) => e.whatsappId === data.whatsappId && e.userId === user.id
								) ||
								selectedProfilesIdsMeta.some(
									(e) => e.metaId === data.metaId && e.userId === user.id
								)
							);
						} else {
							return true;
						}
					})
					if (typeof pendingCount === 'function') pendingCount(data.tickets.length);
					setTickets(data.tickets);
					setHasMore(data.hasMore);
					setPage(2);
				}
      } catch {
        console.log("Erro ao pegar chats");
      }
    };
    isActive && getTickets();
  }, [isActive, selectedQueueIds, selectedUsersIds, selectedProfilesIdsMeta, selectedProfilesIdsWhatsapp, user.id]);

  const loadMoreTickets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/marked-as-unread/?pageNumber=${page}`, {
        params: {
          queueIds: JSON.stringify(selectedQueueIds),
          userIds: JSON.stringify(selectedUsersIds),
        },
      });
			pendingCount((e) => e + data.tickets.length);
      setTickets((prevTickets) => [...prevTickets, ...data.tickets]);
      setHasMore(data.hasMore);
      const newPage = page + 1;
      setPage(newPage);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof updateCount === "function") {
      updateCount(tickets.length)
    }
  }, [tickets, updateCount])

  const handleScroll = async (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollTopMax } = e.target;

    if (scrollTop === scrollTopMax) {
      loadMoreTickets();
    }
  };

  const deleteTicketFromList = (id) => {
    const newList = tickets.filter((item) => item.id !== id);
    setTickets(newList);
  }

  return (
    <Paper className={classes.ticketsListWrapper} style={style}>
      <Paper
        square
        name="closed"
        elevation={0}
        className={classes.ticketsList}
        onScroll={handleScroll}
      >
        <List style={{ paddingTop: 0 }}>
          {tab !== "search" && tickets.length === 0 && !loading && (
            <div className={classes.noTicketsDiv}>
              <span className={classes.noTicketsTitle}>
                {i18n.t("ticketsList.noTicketsTitle")}
              </span>
              <p className={classes.noTicketsText}>
                {i18n.t("ticketsList.noTicketsMessage")}
              </p>
            </div>
          )}

          {tickets.length > 0 && (
            <>
              {tickets
                .filter((ticket) => {
                  const list =
                    user.profile !== "admin" && user.profile !== "supervisor"
                      ? ticket.userId === user.id || ticket.userId === null
                      : ticket;
                  return list;
                })
                .map((ticket) => (
                  <TicketListItem
                    ticket={ticket}
                    key={ticket.id}
                    unreadsList={tickets}
                    updateUnreadsList={(val) => setTickets(val)}
                    deleteTicketFromList={deleteTicketFromList}
                  />
                ))}
            </>
          )}

          {loading && <TicketsListSkeleton />}
        </List>
      </Paper>
    </Paper>
  );
};

export default UnreadTicketsList;
