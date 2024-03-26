/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef, useContext } from "react";
import api from "../../services/api";

import { useHistory, useParams } from "react-router-dom";
import { parseISO, format, isSameDay } from "date-fns";
import clsx from "clsx";

import { makeStyles } from "@material-ui/core/styles";
import { red, green } from "@material-ui/core/colors";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";

import pinIcon from "../../assets/pinIcon.png";

import { i18n } from "../../translate/i18n";

import MarkdownWrapper from "../MarkdownWrapper";
import {
  Tooltip,
  Button,
  useTheme,
  useMediaQuery,
  IconButton,
  CircularProgress,
} from "@material-ui/core";

import SwapHoriz from "@material-ui/icons/SwapHoriz";

import {
  Facebook,
  Instagram,
  WhatsApp,
  MoreVertOutlined,
} from "@material-ui/icons";
import WhatsAppBusinessIcon from "../../assets/WhatsAppBusinessIcon.png";
import QueueSelectModal from "../QueueSelectModal";
import toastError from "../../errors/toastError";
import TicketContextMenu from "../TicketContextMenu";
import { useAuthContext } from "../../context/Auth/AuthContext";
import useStyles from "./style";

const TicketListItem = (props) => {
  const {
    ticket,
    unreadsList,
    updateUnreadsList,
    column,
    setChangeIsFixed,
    innerRef,
		deleteTicketFromList = () => {},
    userCanSeePotential = () => {},
  } = props;
  const classes = useStyles();
  const history = useHistory();
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { user, users, timeoutUnqueued } = useAuthContext();
  const [userTicketName, setUserTicketName] = useState("");
  const [contactTags, setContactTags] = useState([]);
  const [onBot, setOnBot] = useState(false);
  const [valid, setValid] = useState(true);
  const [ticketTimeout, setTicketTimeout] = useState(null);

  const [queueSelectModalOpen, setQueueSelectModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [markedAsUnread, setMarkedAsUnread] = useState(false);
	const [disabled, setDisabled] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsRead = async () => {
    if (markedAsUnread === false) return;
    try {
      await api.patch("/tickets/unread", {
        markedAsUnread: false,
        ticketId: ticket.id,
      });

      setMarkedAsUnread(false);
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    setMarkedAsUnread(ticket.markedAsUnread);

    if (users.users && ticket) {
      const userName = users.users.find(
        (user) => Number(user.id) === Number(ticket.userId)
      )?.name;
      setUserTicketName(userName);
      const contactTags = ticket.contact.tags;
      setContactTags(contactTags);
    }
  }, [ticket, users]);
  useEffect(() => {
    clearTimeout(ticketTimeout);
    const timer = Number(timeoutUnqueued);
    const newDate = new Date();
    const actualDate = newDate.getTime() / 1000; // now date in seconds
    const ticketCreatedAt = Date.parse(ticket.createdAt) / 1000; // ticket create in seconds
    const ticketAge = actualDate - ticketCreatedAt; // ticket age in seconds
    const remainingTime = timer - ticketAge; // remaining time in seconds

    if (ticket.queue) {
      setOnBot(false)
      return;
    }
    if (
      ticketAge < timer &&
      timer !== 0 &&
      ticket.status === "pending" &&
      ticket.contact.userId !== user.id
    ) {
      setOnBot(true);

      const ticketTO = setTimeout(() => {
        setOnBot(false);
        setTicketTimeout(null);
      }, remainingTime * 1000);

      setTicketTimeout(ticketTO);
    } else if (
      timer === 0 &&
      user.profile !== "admin" &&
      ticket.contact.userId !== user.id &&
			!userCanSeePotential({
				ticket
			})
    ) {
      setOnBot(true);
    }
    else if (
      timer > 0 &&
      user.profile !== "admin" &&
      ticket.contact.userId !== user.id &&
			!userCanSeePotential({
				ticket
			})
    ) {
      setOnBot(true);
    }
		else {
      setOnBot(false);
    }
  }, [ticket, timeoutUnqueued, user, userCanSeePotential]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleAcepptTicket = async (id) => {
		deleteTicketFromList(id);

    setIsLoading(true);
    if (Boolean(unreadsList)) {
      const newList = unreadsList.filter((item) => item.id !== id);
      updateUnreadsList(newList);
    }
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
      });

      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    } catch (err) {
      toastError(err);
      setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }
    history.push(`/tickets/${id}`);
  };

  const handleTicketQueue = async () => {
    setQueueSelectModalOpen(true);
    setIsLoading(true);
  };

  const handleSelectTicket = async (id) => {
		if (disabled) return;
    if (Boolean(unreadsList)) {
      const newList = unreadsList.filter((item) => item.id !== id);
      updateUnreadsList(newList);
    }

    if (!Boolean(anchorEl)) {
      await handleMarkAsRead();
      history.push(`/tickets/${id}`);
    }
  };

  const handleOpenContextMenu = (e) => {
    e.preventDefault();
    if (Boolean(unreadsList)) return;
    setAnchorEl(e.currentTarget);
  };

  const handleCloseContextMenu = () => setAnchorEl(null);

  const handleMarkAsUnread = (bool) => setMarkedAsUnread(bool);

  const getMessageTypeIcon = (type, message) => {
    if (!type || type === null) return message;

    if (String(type).includes("chat")) {
      return message;
    } else if (String(type).includes("video")) {
      return (
        <Button variant="text" startIcon={"🎥"}>
          Vídeo
        </Button>
      );
    } else if (String(type).includes("audio")) {
      return (
        <Button variant="text" startIcon={"🎤"}>
          Áudio
        </Button>
      );
    } else if (String(type).includes("call_log")) {
      return (
        <Button variant="text" startIcon={"📞"}>
          Ligação
        </Button>
      );
    } else if (String(type).includes("template")) {
      return (
        <Button variant="text" startIcon={"🤖"}>
          Template
        </Button>
      );
    } else if (String(type).includes("image")) {
      return (
        <Button variant="text" startIcon={"📸"}>
          Imagem
        </Button>
      );
    } else {
      return (
        <Button variant="text" startIcon={"💾"}>
          Arquivo
        </Button>
      );
    }
  };

  return (
    <>
    {onBot ? null : (
      <div ref={innerRef}>
        <QueueSelectModal
          modalOpen={queueSelectModalOpen}
          onClose={() => setQueueSelectModalOpen(false)}
          ticket={ticket}
          unreadsList={unreadsList}
          updateUnreadsList={updateUnreadsList}
					deleteTicketFromList={deleteTicketFromList}
        />

        <div style={{ display: "flex", gap: "5px" }}>
          <ListItem
            dense
            button
            onClick={(e) => {
              if (ticket.status === "pending") return;
              handleSelectTicket(ticket.id);
            }}
            onContextMenu={(e) => {
              handleOpenContextMenu(e);
            }}
            selected={ticketId && +ticketId === ticket.id}
            className={clsx(classes.ticket, {
              [classes.pendingTicket]: ticket.status === "pending",
            })}
          >
            <TicketContextMenu
              ticket={ticket}
              anchorEl={anchorEl}
              onClose={handleCloseContextMenu}
              onMarkAsUnread={handleMarkAsUnread}
              isMarkedAsUnread={markedAsUnread}
              setChangeIsFixed={setChangeIsFixed}
							isMobile={isMobile}
							setDisabled={setDisabled}
							deleteTicketFromList={deleteTicketFromList}
            />

            <Tooltip
              arrow
              placement="right"
              title={ticket.queue?.name || "Sem Setor"}
            >
              <span
                style={{ backgroundColor: ticket.queue?.color || "#7C7C7C" }}
                className={classes.ticketQueueColor}
              ></span>
            </Tooltip>
            <ListItemAvatar>
              <div className={classes.avatarContainer}>
                <Avatar
                  variant="rounded"
                  style={{ width: 60, height: 60, marginTop: 10, zIndex: 0 }}
                  onError={() => setValid(false)}
                  src={valid ? ticket?.contact?.profilePicUrl : ""}
                />

                {ticket?.whatsapp &&
                  !ticket?.whatsapp?.isOficial &&
                  !["facebook", "instagram"].includes(
                    ticket?.contact?.channel
                  ) && (
                    <WhatsApp
                      style={{
                        fill: "#25D366",
                        fontSize: 18,
                        marginTop: -10,
                        zIndex: 1,
                        backgroundColor: "rgba(255,255,255,1)",
                        borderRadius: "50%",
                        filter: "drop-shadow(0px 0px 5px #00000070)",
                      }}
                    />
                  )}
                {ticket?.whatsapp &&
                  ticket?.whatsapp?.isOficial &&
                  !["facebook", "instagram"].includes(
                    ticket?.contact?.channel
                  ) && (
                    <img
                      src={WhatsAppBusinessIcon}
                      style={{
                        width: "20px",
                        height: "20px",
                        marginTop: "-10px",
                        zIndex: 1,
                        backgroundColor: "rgba(255,255,255,1)",
                        borderRadius: "50%",
                        filter: "drop-shadow(0px 0px 5px #00000070)",
                      }}
                      alt=""
                    />
                  )}
                {ticket?.contact?.channel === "instagram" && (
                  <Instagram
                    style={{
                      fill: "#E1706C",
                      fontSize: 18,
                      marginTop: -10,
                      zIndex: 1,
                      backgroundColor: "rgba(255,255,255,1)",
                      borderRadius: "5px",
                      filter: "drop-shadow(0px 0px 5px #00000070)",
                    }}
                  />
                )}
                {ticket?.contact?.channel === "facebook" && (
                  <Facebook
                    style={{
                      fill: "#4267B2",
                      fontSize: 18,
                      marginTop: -10,
                      zIndex: 1,
                      backgroundColor: "rgba(255,255,255,1)",
                      borderRadius: "3px",
                      filter: "drop-shadow(0px 0px 5px #00000070)",
                    }}
                  />
                )}
                {markedAsUnread && (
                  <Badge
                    overlap="rectangular"
                    badgeContent=""
                    classes={{ badge: classes.markedAsReadStyle }}
                  />
                )}
              </div>
            </ListItemAvatar>
            <ListItemText
              disableTypography
              primary={
                <span className={classes.contactNameWrapper}>
                  <Typography
                    noWrap
                    component="span"
                    variant="body2"
                    color="textPrimary"
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    {ticket.isFixed && (
                      <img
                        src={pinIcon}
                        alt="pinIcon"
                        className={classes.sizeIcons}
                      />
                    )}
                    <Typography
                      component="span"
                      style={{
                        color: "grey",
                        fontSize: "0.8em",
                        fontStyle: "italic",
                      }}
                    >{`#${ticket.id} - `}</Typography>
                    {ticket.contact?.name}
                  </Typography>
									{ticket.status === "closed" && (
                    <Badge
                      overlap="rectangular"
                      className={classes.closedBadge}
                      badgeContent={"Finalizado"}
                      color="error"
                    />
                  )}
                  {ticket.lastMessage && (
										<div
											className={classes.divLastMessage}
										>
											{ticket.isTransfered && (
												<SwapHoriz
													className={classes.sizeIcons}
												/>
											)}
										
											<Typography
												className={classes.lastMessageTime}
												component="span"
												variant="body2"
												color="textSecondary"
											>
												{isSameDay(
													parseISO(
														column === "lastMessageDate"
															? ticket.lastMessageDate
															: ticket.createdAt
													),
													new Date()
												) ? (
													<>
														{format(
															parseISO(
																column === "lastMessageDate"
																	? ticket.lastMessageDate
																	: ticket.createdAt
															),
															"HH:mm"
														)}
													</>
												) : (
													<>
														{format(
															parseISO(
																column === "lastMessageDate"
																	? ticket.lastMessageDate
																	: ticket.createdAt
															),
															"dd/MM/yyyy"
														)}
													</>
												)}
											</Typography>

										</div>
                  )}
                  {(ticket?.contact?.channel === "whatsapp" ||
                    !ticket?.contact?.channel) && (
                    <div
                      className={classes.userTagWhatsapp}
                      title={i18n.t("ticketsList.connectionTitle")}
                    >
                      {ticket?.whatsapp?.name}
                    </div>
                  )}
                  {(ticket?.contact?.channel === "whatsappApi" ||
                    ticket.whatsappApiId) && (
                    <div
                      className={classes.userTagWhatsapp}
                      title={i18n.t("ticketsList.connectionTitle")}
                    >
                      {ticket?.whatsappApi?.name}
                    </div>
                  )}
                  {ticket?.contact?.channel === "facebook" && (
                    <div
                      className={classes.userTagFacebook}
                      title={i18n.t("ticketsList.connectionTitle")}
                    >
                      {ticket?.meta?.name}
                    </div>
                  )}
                  {ticket?.contact?.channel === "instagram" && (
                    <div
                      className={classes.userTagInstagram}
                      title={i18n.t("ticketsList.connectionTitle")}
                    >
                      {ticket?.meta?.name}
                    </div>
                  )}
                </span>
              }
              secondary={
                <Tooltip title={ticket.lastMessage || ""}>
                  <span className={classes.contactNameWrapper}>
                    <Typography
                      className={classes.contactLastMessage}
                      noWrap
                      component="span"
                      variant="body2"
                      color="textSecondary"
                    >
                      {ticket.lastMessage &&
                      (ticket?.lastMessageType?.includes("chat") ||
                        !ticket?.lastMessageType) ? (
                        <MarkdownWrapper>{ticket.lastMessage}</MarkdownWrapper>
                      ) : (
                        getMessageTypeIcon(
                          ticket.lastMessageType,
                          ticket.lastMessage
                        )
                      )}
                    </Typography>

                    <Badge
                      overlap="rectangular"
                      className={classes.newMessagesCount}
                      badgeContent={ticket.unreadMessages}
                      classes={{
                        badge: classes.badgeStyle,
                      }}
                    />
                  </span>
                </Tooltip>
              }
            />
            {ticket.status === "pending" && (
              <Button
                color="primary"
                variant="contained"
                className={classes.acceptButton}
                size="small"
                onClick={() => {
                  ticket.queueId
                    ? handleAcepptTicket(ticket.id)
                    : handleTicketQueue();
                }}
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress
                    size={15}
                    style={{
                      color: "white",
                    }}
                  />
                ) : (
                  i18n.t("ticketsList.buttons.accept")
                )}
              </Button>
            )}
            {user.profile === "admin" && onBot ? (
              <p className={classes.ticketUserName}>Bot</p>
            ) : (
              <Tooltip title={userTicketName || ""}>
                <p className={classes.ticketUserName}>{userTicketName}</p>
              </Tooltip>
            )}
            <div className={classes.userTagsContainer}>
              {contactTags?.length > 0 &&
                contactTags.map((tag) => (
                  <Tooltip title={tag?.name || ""} key={tag.id}>
                    <Typography
                      // pop up com nome da tag
                      key={tag.id}
                      className={classes.userTags}
                      style={{
                        background: tag.color,
                        border: `1px solid ${tag.color}`,
                      }}
                      // title={i18n.t("ticketsList.connectionTitle")}
                    >
                      {tag?.name}
                    </Typography>
                  </Tooltip>
                ))}
            </div>
          </ListItem>

          {isMobile && (
            <IconButton
              style={{ padding: "0px" }}
              onClick={(e) => handleOpenContextMenu(e)}
            >
              <MoreVertOutlined />
            </IconButton>
          )}
        </div>
      </div>)}
    </>
  );
};

export default TicketListItem;
