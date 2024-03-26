import React, { useState, useRef, useEffect, useContext } from "react";

import { useHistory } from "react-router-dom";
import { format } from "date-fns";
import openSocket from "../../services/socket-io";
import useSound from "use-sound";

import Popover from "@material-ui/core/Popover";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";

import TicketListItem from "../TicketListItem";
import { i18n } from "../../translate/i18n";
import useTickets from "../../hooks/useTickets";
import alertSound from "../../assets/sound.mp3";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
  tabContainer: {
    overflowY: "auto",
    maxHeight: 350,
    ...theme.scrollbarStyles,
  },
  popoverPaper: {
    width: "100%",
    maxWidth: 350,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      maxWidth: 270,
    },
  },
  noShadow: {
    boxShadow: "none !important",
  },
}));

const NotificationsPopOver = () => {
  const classes = useStyles();

  const history = useHistory();
  const { user, setIsSocketConnected, timeoutUnqueued } =
    useContext(AuthContext);
  const ticketIdUrl = +history.location.pathname.split("/")[2];
  const ticketIdRef = useRef(ticketIdUrl);
  const anchorEl = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { profile, queues } = user;
  const [messageTimeouts, setMessageTimeouts] = useState([]);

  const [, setDesktopNotifications] = useState([]);

  // const { tickets } = useTickets({ withUnreadMessages: "true" });

  const [tickets, setTickets] = useState([]);

  const [play] = useSound(alertSound);
  const soundAlertRef = useRef();

  const historyRef = useRef(history);

  const openTickets = useTickets({
    withUnreadMessages: "true",
    showAll: "false",
    status: "open",
    pageNumber: 1,
    userIds: "[8]",
    queueIds: "[1]",
  }).tickets;

  const pendingTickets = useTickets({
    status: "pending",
    showAll: "false",
    pageNumber: 1,
    userIds: "[8]",
    queueIds: "[1]",
  }).tickets;

  useEffect(() => {
    setTickets(
      [...openTickets, ...pendingTickets].filter(
        (ticket) => ticket?.withUnreadMessages
      )
    );
  }, [openTickets, pendingTickets]);

  useEffect(() => {
    soundAlertRef.current = play;

    if (!("Notification" in window)) {
      console.log("This browser doesn't support notifications");
    } else {
      Notification.requestPermission();
    }
  }, [play]);

  useEffect(() => {
    const queueIds = queues?.map((q) => q.id);
    const filteredTickets = tickets.filter(
      (t) => queueIds.indexOf(t.queueId) > -1
    );

    if (profile === "user") {
      setNotifications(
        filteredTickets.filter((ticket) => ticket?.withUnreadMessages)
      );
    } else {
      setNotifications(tickets.filter((ticket) => ticket?.withUnreadMessages));
    }
  }, [tickets, queues, profile]);

  useEffect(() => {
    ticketIdRef.current = ticketIdUrl;
  }, [ticketIdUrl]);

  useEffect(() => {
    const socket = openSocket({
      scope: "notifications",
      userId: user.id,
      component: "NotificationsPopOver",
    });

    const queueIds = queues?.map((q) => q.id);

    socket.on("customDisconnectEvent", () => {
      setIsSocketConnected(false);
    });

    socket.on(`connect`, () => socket.emit("joinNotification"));

    socket.on(`${user?.companyId}-ticket`, (data) => {
      if (
        data.action === "update" &&
        data.ticket?.withUnreadMessages &&
        data.ticket.queueId &&
        messageTimeouts.find((m) => m.id === data.ticket.id)
      ) {
        setNotifications((prevState) => {
          const ticketIndex = prevState.findIndex(
            (t) => t.id === data.ticket.id
          );
          if (ticketIndex !== -1) {
            prevState[ticketIndex] = data.ticket;
            return [...prevState];
          }
          return [data.ticket, ...prevState];
        });

        const messageTimeouted = messageTimeouts.find(
          (m) => m.id === data.ticket.id
        );

        const shouldNotNotificate =
          (messageTimeouted.data.message.ticketId === ticketIdRef.current &&
            document.visibilityState === "visible") ||
          (data.ticket.userId && data.ticket.userId !== user?.id) ||
          data.ticket.isGroup ||
          data.ticket.chatbot;

        if (shouldNotNotificate) return;

        clearTimeout(messageTimeouted.messageTimeout);
        setMessageTimeouts((prevState) => {
          return prevState.filter((m) => m.id !== data.ticket.id);
        });

        handleNotifications(messageTimeouted.data);
      }

      if (
        (data.action === "updateUnread" && data.ticket?.withUnreadMessages) ||
        data.action === "delete"
      ) {
        setNotifications((prevState) => {
          const ticketIndex = prevState.findIndex(
            (t) => t.id === data.ticketId
          );
          if (ticketIndex !== -1) {
            prevState.splice(ticketIndex, 1);
            return [...prevState];
          }
          return prevState;
        });

        setDesktopNotifications((prevState) => {
          const notfiticationIndex = prevState.findIndex(
            (n) => n.tag === String(data.ticketId)
          );
          if (notfiticationIndex !== -1) {
            prevState[notfiticationIndex].close();
            prevState.splice(notfiticationIndex, 1);
            return [...prevState];
          }
          return prevState;
        });
      }
    });

    socket.on(`${user?.companyId}-appMessage`, (data) => {
      const newDate = new Date();
      const actualDate = newDate.getTime() / 1000; // now date in seconds
      const ticketCreatedAt = Date.parse(data.ticket.createdAt) / 1000; // ticket create in seconds
      const ticketAge = actualDate - ticketCreatedAt; // ticket age in seconds
      const remainingTime = timeoutUnqueued - ticketAge; // remaining time in seconds

      const UserQueues = user.queues.findIndex(
        (users) => users.id === data.ticket.queueId
      );

      if (
        data.action === "create" &&
        // data.ticket?.withUnreadMessages &&
        !data.message.read &&
        (data.ticket.userId === user?.id || !data.ticket.userId) &&
        (UserQueues !== -1 || !data.ticket.queueId)
      ) {
        if (
          profile === "user" &&
          (queueIds.indexOf(data.ticket.queue?.id) === -1 ||
            data.ticket.queue === null)
        ) {
          return;
        }

        const messageTimeout = setTimeout(() => {
          setNotifications((prevState) => {
            const ticketIndex = prevState.findIndex(
              (t) => t.id === data.ticket.id
            );
            if (ticketIndex !== -1) {
              prevState[ticketIndex] = data.ticket;
              return [...prevState];
            }
            return [data.ticket, ...prevState];
          });

          const shouldNotNotificate =
            (data.message.ticketId === ticketIdRef.current &&
              document.visibilityState === "visible") ||
            (data.ticket.userId && data.ticket.userId !== user?.id) ||
            data.ticket.isGroup ||
            data.ticket.chatbot;

          if (shouldNotNotificate) return;

          handleNotifications(data);
        }, remainingTime * 1000);

        setMessageTimeouts((prevState) => {
          return [...prevState, { id: data.ticket.id, messageTimeout, data }];
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, profile, queues, timeoutUnqueued, messageTimeouts]);

  const handleNotifications = (data) => {
    const { message, contact, ticket } = data;

    // const profilePic = contact?.profilePic || '';

    const options = {
      body: `${message.body} - ${format(new Date(), "HH:mm")}`,
      icon: contact.profilePicUrl,
      // icon: profilePic,
      tag: ticket.id,
      renotify: true,
    };

    if (ticket.status === "open") {
      options.body = `${message.body} - ${format(new Date(), "HH:mm")}`;
    } else if (ticket.status === "pending") {
      options.body = `Há um novo ticket pendente - ${format(
        new Date(),
        "HH:mm"
      )}`;
    }

    const notification = new Notification(
      `${i18n.t("tickets.notification.message")} ${contact.name}`,
      options
    );

    notification.onclick = (e) => {
      e.preventDefault();
      window.focus();
      historyRef.current.push(`/tickets/${ticket.id}`);
    };

    setDesktopNotifications((prevState) => {
      const notfiticationIndex = prevState.findIndex(
        (n) => n.tag === notification.tag
      );
      if (notfiticationIndex !== -1) {
        prevState[notfiticationIndex] = notification;
        return [...prevState];
      }
      return [notification, ...prevState];
    });

    soundAlertRef.current();
  };

  const handleClick = () => {
    setIsOpen((prevState) => !prevState);
  };

  const handleClickAway = () => {
    setIsOpen(false);
  };

  const NotificationTicket = ({ children }) => {
    return <div onClick={handleClickAway}>{children}</div>;
  };

  return (
    <>
      {/* <IconButton
        onClick={handleClick}
        ref={anchorEl}
        aria-label="Open Notifications"
        color="inherit"
      >
        <Badge
          overlap="rectangular"
          badgeContent={
            notifications.filter(
              (ticket) => ticket.userId === user.id || !ticket.userId
            ).length
          }
          color="secondary"
        >
          <ChatIcon />
        </Badge>
      </IconButton> */}
      <Popover
        disableScrollLock
        open={isOpen}
        anchorEl={anchorEl.current}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        classes={{ paper: classes.popoverPaper }}
        onClose={handleClickAway}
      >
        <List dense className={classes.tabContainer}>
          {notifications.filter(
            (ticket) => ticket.userId === user.id && ticket?.withUnreadMessages
          ).length === 0 ? (
            <ListItem>
              <ListItemText>{i18n.t("notifications.noTickets")}</ListItemText>
            </ListItem>
          ) : (
            notifications
              .filter(
                (ticket) =>
                  ticket.userId === user.id && ticket?.withUnreadMessages
              )
              ?.map((ticket) => (
                <NotificationTicket key={ticket.id}>
                  <TicketListItem ticket={ticket} />
                </NotificationTicket>
              ))
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationsPopOver;
