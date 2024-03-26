import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import {
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Tooltip,
} from "@material-ui/core";
import {
  AccessTime,
  ArrowDownward,
  Block,
  Done,
  DoneAll,
  ExpandMore,
  GetApp,
} from "@material-ui/icons";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import clsx from "clsx";
import { format, isSameDay, parseISO } from "date-fns";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import LocationPreview from "../LocationPreview";
import MarkdownWrapper from "../MarkdownWrapper";
import MessageOptionsMenu from "../MessageOptionsMenu";
import ModalImageCors from "../ModalImageCors";
import NewTicketMenu from "../NewTicketMenu";
import TemplatePreview from "../TemplatePreview";
import VcardPreview from "../VcardPreview";
import { useStyles } from "./styles";

const reducer = (state, action) => {
  if (action.type === "LOAD_MESSAGES") {
    const messages = action.payload;
    const newMessages = [];

    messages.forEach((message) => {
      const messageIndex = state.findIndex((m) => m.id === message.id);
      if (messageIndex !== -1) {
        state[messageIndex] = message;
      } else {
        newMessages.push(message);
      }
    });

    return [...newMessages, ...state];
  }

  if (action.type === "ADD_MESSAGE") {
    const newMessage = action.payload;
    const messageIndex = state.findIndex((m) => m.id === newMessage.id);

    if (messageIndex !== -1) {
      state[messageIndex] = newMessage;
    } else {
      state.push(newMessage);
    }

    return [...state];
  }

  if (action.type === "UPDATE_MESSAGE") {
    const messageToUpdate = action.payload;
    const messageIndex = state.findIndex((m) => m.id === messageToUpdate.id);

    if (messageIndex !== -1) {
      state[messageIndex] = messageToUpdate;
    }

    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const MessagesList = ({ ticketId, isGroup, contactModalOpen }) => {
  const classes = useStyles();

  const [messagesList, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const lastMessageRef = useRef();

  const [selectedMessage, setSelectedMessage] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const messageOptionsMenuOpen = Boolean(anchorEl);
  const [newTicket, setNewTicket] = useState(false);
  const [usersDeleted, setUsersDeleted] = useState([]);
  const currentTicketId = useRef(ticketId);
  const { users, user } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      try {
        const {
          data: { users },
        } = await api.get("/users/deleted");

        setUsersDeleted(users);
      } catch (error) {
        console.log("error", error);
      }
    })();
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);

    currentTicketId.current = ticketId;
  }, [ticketId]);

  useEffect(() => {
    setLoading(true);
    const fetchMessages = async () => {
      try {
        const { data } = await api.get("/messages/" + ticketId, {
          params: { pageNumber },
        });

        if (currentTicketId.current === ticketId) {
          dispatch({ type: "LOAD_MESSAGES", payload: data.messages });
          setHasMore(data.hasMore);
          setLoading(false);
        }

        if (pageNumber === 1 && data.messages.length > 1) {
          scrollToBottom();
        }

        setIsVisible(false);
      } catch (err) {
        setLoading(false);
        toastError(err);
      }
    };
    fetchMessages();
  }, [pageNumber, ticketId]);

  useEffect(() => {
    const socket = openSocket({
      userId: user.id,
      scope: "messages",
      component: "MessagesList",
    });

    socket.on(`connect`, () => socket.emit("joinChatBox", ticketId));

    socket.on(`${user?.companyId}-appMessage`, (data) => {
      if (data.ticket.id !== Number(ticketId)) return;
      if (data.action === "create") {
        dispatch({ type: "ADD_MESSAGE", payload: { ...data.message, ticket: data.ticket, contact: data.contact } });
        scrollToBottom();
      }

      if (data.action === "update") {
        dispatch({ type: "UPDATE_MESSAGE", payload: data.message });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId]);

  const loadMore = () => {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  };

  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({});
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight } = e.currentTarget;

    if (scrollTop < scrollHeight - 1400) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }

    if (!hasMore) return;

    if (scrollTop === 0) {
      document.getElementById("messagesList").scrollTop = 1;
    }

    if (loading) {
      return;
    }

    if (scrollTop < 50) {
      loadMore();
    }
  };

  const handleNewTicket = (e, message) => {
    setAnchorEl(e.currentTarget);
    setNewTicket(true);
    setSelectedMessage(message);
  };

  const handleCloseNewTicket = () => {
    setNewTicket(false);
    setAnchorEl(null);
  };

  const handleOpenMessageOptionsMenu = (e, message) => {
    setAnchorEl(e.currentTarget);
    setSelectedMessage(message);
  };

  const handleCloseMessageOptionsMenu = (e) => {
    setAnchorEl(null);
  };

  const checkMessageMedia = (message) => {
		const mediaUrl = message?.mediaUrl?.replaceAll(" ", "%20");
    if (
      message.mediaType === "location" &&
      message.body.split("|").length >= 2
    ) {
      let locationParts = message.body.split("|");
      let imageLocation = locationParts[0];
      let linkLocation = locationParts[1];

      let descriptionLocation = null;

      if (locationParts.length > 2)
        descriptionLocation = message.body.split("|")[2];

      return (
        <LocationPreview
          image={imageLocation}
          link={linkLocation}
          description={descriptionLocation}
        />
      );
    } else if (message.mediaType === "vcard") {
      let array = message.body.split("\n");
      let number = '';
      let name = '';

      array.forEach((item) => {
        if (item.includes('FN:')) {
          name = item.replace('FN:', '');
        } else if (item.includes('waid=')) {
          number = item.split('waid=')[1].split(':')[0];
        }
      });

      return <VcardPreview name={name} number={number} />;
    } else if (message.mediaType === "multi_vcard") {
      if (message.body !== null && message.body !== "") {
        let newBody = JSON.parse(message.body);
        return (
          <>
            {newBody.map((v) => (
              <VcardPreview name={v.name} number={v.number} />
            ))}
          </>
        );
      } else return <></>;
    } else if (message.mediaType === "template") {
      if (message.body !== null && message.body !== "") {
        let newBody = JSON.parse(message.body);
        return (
          <>
            <TemplatePreview body={newBody} />
          </>
        );
      }
    } else if (
      [
        "image",
        "story_mention_image",
        "story_reply_image",
        "share_image",
        "share_carousel_album",
      ].includes(message.mediaType)
    ) {
      const channel = message?.contact?.channel;
      if (channel === "facebook" || channel === "instagram") {
        return <ModalImageCors imageUrl={mediaUrl} proxy={true} />;
      } else {
        return <ModalImageCors imageUrl={mediaUrl} proxy={true} />;
      }
    } else if (message.mediaType === "story_mention_video") {
      return (
        <video
          className={classes.messageMedia}
          src={mediaUrl}
          controls
        />
      );
    } else if (
      ["story_reply_video", "share_video"].includes(message.mediaType)
    ) {
      return (
        <video
          className={classes.messageMedia}
          src={message?.mediaUrl}
          controls
        />
      );
    } else if (message.mediaType === "audio") {
      const channel = message?.contact?.channel;
      if (channel === "facebook" || channel === "instagram") {
        return (
          <audio controls>
            <source src={message?.mediaUrl} type="audio/mp3"></source>
          </audio>
        );
      }
      return (
        <>
          <audio controls>
            <source src={message.mediaUrl} type="audio/mp3"></source>
          </audio>
        </>
      );
    } else if (message.mediaType === "video") {
      const channel = message?.contact?.channel;
      if (channel === "facebook" || channel === "instagram") {
        return (
          <video
            className={classes.messageMedia}
            src={message?.mediaUrl}
            controls
          />
        );
      }
      return (
        <video
          className={classes.messageMedia}
          src={message.mediaUrl}
          controls
        />
      );
    } else if (message.mediaType === "comment") {
      return <div>teste comentário</div>;
    } else {
      return (
        <>
          <div className={classes.downloadMedia}>
            <Button
              startIcon={<GetApp />}
              color="primary"
              variant="outlined"
              target="_blank"
              href={message.mediaUrl}
            >
              Download
            </Button>
          </div>
          <Divider />
        </>
      );
    }
  };

  const renderMessageAck = (message) => {
    if (message.ack === 0) {
      return <AccessTime fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 1) {
      return <Done fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 2) {
      return <DoneAll fontSize="small" className={classes.ackIcons} />;
    }
    if (message.ack === 3 || message.ack === 4) {
      return <DoneAll fontSize="small" className={classes.ackDoneAllIcon} />;
    }
  };

  const renderDailyTimestamps = (message, index) => {
    if (index === 0) {
      return (
        <span
          className={classes.dailyTimestamp}
          key={`timestamp-${message.id}`}
        >
          <div className={classes.dailyTimestampText}>
            {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
          </div>
        </span>
      );
    }
    if (index < messagesList.length - 1) {
      let messageDay = parseISO(messagesList[index].createdAt);
      let previousMessageDay = parseISO(messagesList[index - 1].createdAt);

      if (!isSameDay(messageDay, previousMessageDay)) {
        return (
          <span
            className={classes.dailyTimestamp}
            key={`timestamp-${message.id}`}
          >
            <div className={classes.dailyTimestampText}>
              {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
            </div>
          </span>
        );
      }
    }
    if (index === messagesList.length - 1) {
      let messageDay = parseISO(messagesList[index].createdAt);
      let previousMessageDay = parseISO(messagesList[index - 1].createdAt);

      if (!isSameDay(messageDay, previousMessageDay)) {
        return (
          <>
            <span
              className={classes.dailyTimestamp}
              key={`timestamp-${message.id}`}
            >
              <div className={classes.dailyTimestampText}>
                {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
              </div>
            </span>

            <div
              key={`ref-${message.createdAt}`}
              ref={lastMessageRef}
              style={{ float: "left", clear: "both" }}
            />
          </>
        );
      } else {
        return (
          <div
            key={`ref-${message.createdAt}`}
            ref={lastMessageRef}
            style={{ float: "left", clear: "both" }}
          />
        );
      }
    }
  };

  const renderNumberTicket = (message, index, isEdited) => {
    if (index < messagesList.length && index > 0 && !isEdited) {
      let messageTicket = message.ticketId;
      let previousMessageTicket = messagesList[index - 1].ticketId;

      if (messageTicket !== previousMessageTicket) {
        return (
					<div className={classes.comment}>
						<i>
							<strong>Ticket #{messageTicket}</strong>
						</i>
					</div>
        );
      }
    }
  };

  const renderMessageDivider = (message, index) => {
    if (index < messagesList.length && index > 0) {
      let messageUser = messagesList[index].fromMe;
      let previousMessageUser = messagesList[index - 1].fromMe;

      if (messageUser !== previousMessageUser) {
        return (
          <span style={{ marginTop: 16 }} key={`divider-${message.id}`}></span>
        );
      }
    }
  };

  const renderQuotedMessage = (message) => {
    return (
      <div
        className={clsx(classes.quotedContainerLeft, {
          [classes.quotedContainerRight]: message.fromMe,
        })}
      >
        <span
          className={clsx(classes.quotedSideColorLeft, {
            [classes.quotedSideColorRight]: message.quotedMsg?.fromMe,
          })}
        ></span>
        <div className={classes.quotedMsg}>
          {!message.quotedMsg?.fromMe && (
            <span className={classes.messageContactName}>
              {message.quotedMsg?.contact?.name}
            </span>
          )}

          {message.quotedMsg.mediaType === "chat" ||
          message.quotedMsg.mediaType === null
            ? message.quotedMsg.body
            : checkMessageMedia(message.quotedMsg)}
        </div>
      </div>
    );
  };

	const parserStyle = (message, isEdited, side) => {
		if (message.isEdited && !isEdited) {
			return { 
				backgroundColor: '#d5d08f',
				marginBottom: '0px',
				borderTopLeftRadius: side === 'left' ? '0px' : '8px',
				borderTopRightRadius: '8px',
				borderBottomLeftRadius: '0px',
				borderBottomRightRadius: '0px',
			}
		} else if (isEdited) {
			return { 
				marginTop: '0px',
				borderBottom: '0px',
				borderTopLeftRadius: '0px',
				borderTopRightRadius: '0px',
				borderBottomLeftRadius: '8px',
				borderBottomRightRadius: side === 'left' ? '8px' : '0px',
			}
		} else {
			return {}
		}
	}

	const renderNormalMessage = (message, index, side, isEdited) => {
		return (
			<>
				<React.Fragment key={message.id}>
					{renderDailyTimestamps(message, index)}
					{message.isEdited && !isEdited && renderMessageDivider(message, index)}
					{renderNumberTicket(message, index, isEdited)}

					<div
						className={side === 'rigth' ? `${classes.messageRight} ${
							message.isDeleted ? classes.isDelMsg : ""
						}` : clsx(classes.messageLeft, {
							[classes.cipheredMessage]: message.mediaType === "ciphertext",
							[classes.isDelMsg]: message.isDeleted,
						})}
						style={parserStyle(message, isEdited, side)}
					>
						{message.ack === 0 && (
							<button
								className={classes.resendBtn}
								onClick={() => handleSendMessage(message)}
							>
								Reenviar
							</button>
						)}

						{["facebook", "instagram"].includes(
							message?.contact?.channel
						) === false && (message.isEdited ? isEdited : true) && (
							<IconButton
								variant="contained"
								size="small"
								id="messageActionsButton"
								disabled={message.isDeleted}
								className={classes.messageActionsButton}
								onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
							>
								<ExpandMore />
							</IconButton>
						)}

						{(message.mediaUrl ||
							message.mediaType === "location" ||
							message.mediaType === "vcard" ||
							message.mediaType === "multi_vcard" ||
							message.mediaType === "comment" ||
							message.mediaType === "template") &&
							checkMessageMedia(message)}
						<Tooltip title={renderSubTitle(message)}>
							<div
								className={clsx(classes.textContentItem, {
									[classes.textContentItemDeleted]: message.isDeleted,
								})}
							>
								{message.isDeleted && (
									<Block
										color="disabled"
										fontSize="small"
										className={classes.deletedIcon}
									/>
								)}
								{message?.mediaType?.includes("story_mention") && (
									<MarkdownWrapper>{`*@Você mencionou no story*`}</MarkdownWrapper>
								)}
								{message?.mediaType?.includes("share_carousel_album") && (
									<MarkdownWrapper>
										{`*@Você compartilhou várias postagens*`}
									</MarkdownWrapper>
								)}
								{["share_image", "share_video"].includes(
									message?.mediaType
								) && (
									<MarkdownWrapper>
										{`*@Você compatilhou uma postagem*`}
									</MarkdownWrapper>
								)}
								{message?.mediaType?.includes("story_reply") && (
									<div>
										<MarkdownWrapper>{`*@Você respondeu ao story:*`}</MarkdownWrapper>
									</div>
								)}
								{message.quotedMsg && renderQuotedMessage(message)}
								{message.thumbnail && (
									<a
										target="_blank"
										href={message.link}
										className={classes.linkMain}
									>
										<img
											className={classes.linkImage}
											src={`data:image/jpeg;base64,${message.thumbnail}`}
										/>
										<div className={classes.linkContainer}>
											<p className={classes.linkTitle}>{message.title}</p>
											<p className={classes.linkDescription}>
												{message.description}
											</p>
										</div>
									</a>
								)}
								<MarkdownWrapper>{message.body}</MarkdownWrapper>
								{(isEdited || !message.isEdited) && (
									<span className={classes.timestamp}>
										{message.isEdited && 'Editado '}
										{format(parseISO(message.createdAt), "HH:mm")}
										{renderMessageAck(message)}
									</span>
								)}
							</div>
						</Tooltip>
						<IconButton
							className={clsx(classes.scrollButton, {
								[classes.scrollButtonVisible]: isVisible,
								[classes.scrollButtonModalOpen]: contactModalOpen,
							})}
							onClick={scrollToBottom}
						>
							<ArrowDownward />
						</IconButton>
					</div>
				</React.Fragment>

				{!isEdited && message.isEdited ? renderNormalMessage({...message, body: message.bodyEdited}, index, side, true) : null}
			</>
		)
	}

  const parserAck = (ack) => {
    switch (ack) {
      case 1:
        return "Enviado";
      case 2:
        return "Entregue em";
      case 3:
        return "Lida em";
      default:
        return "Não enviado";
    }
  };

  const findUser = (userId) => {
    const user = users.users?.find((user) => user.id === userId);

    if (user) return user.name;

    const userDeleted = usersDeleted.find((user) => user.id === userId);

    if (userDeleted) return "Usuário deletado";
  };

  const renderSubTitle = (message) => {
    if (message.ack === 0) return "Não enviado";

    const messageDefault = message.userId
      ? findUser(message.userId) || "Admin"
      : "Mensagem enviada pelo celular ou pelo sistema";

    return ` ${messageDefault} | ${parserAck(message.ack)} ${format(
      parseISO(message.updatedAt),
      "dd/MM/YYY - HH:mm"
    )}`;
  };

  const handleSendMessage = async (message) => {
    if (message.body.trim() === "") return;

    const messageResend = {
      read: 1,
      fromMe: true,
      body: message.body,
      quotedMsg: message.quotedMsg,
      userId: user.id,
      messageId: message.id,
    };

    if (message.mediaUrl) {
      messageResend.mediaType = message.mediaType;
      messageResend.mediaUrl = message.mediaUrl;
    }

    if (message.mediaType !== "chat") {
      messageResend.fileName = message.body;
      messageResend.messageId = message.id;

      try {
        const { status } = await api.post(
          `/messages-send-media/${message.ticketId}`,
          messageResend
        );
        if (status === 200) {
          try {
            const { data } = await api.get("/messages/" + ticketId, {
              params: { pageNumber },
            });

            if (currentTicketId.current === ticketId) {
              dispatch({ type: "LOAD_MESSAGES", payload: data.messages });
              setHasMore(data.hasMore);
              setLoading(false);
            }

            if (pageNumber === 1 && data.messages.length > 1) {
              scrollToBottom();
            }
          } catch (err) {
            setLoading(false);
            toastError(err);
          }
        }
      } catch (err) {
        toastError(err);
      }
    } else {
      try {
        const { status } = await api.post(
          `/messages/${message.ticketId}`,
          messageResend
        );
        if (status === 200) {
          try {
            const { data } = await api.get("/messages/" + ticketId, {
              params: { pageNumber },
            });

            if (currentTicketId.current === ticketId) {
              dispatch({ type: "LOAD_MESSAGES", payload: data.messages });
              setHasMore(data.hasMore);
              setLoading(false);
            }

            if (pageNumber === 1 && data.messages.length > 1) {
              scrollToBottom();
            }
          } catch (err) {
            setLoading(false);
            toastError(err);
          }
        }
      } catch (err) {
        toastError(err);
      }
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await api.delete(`/messages/${id}`);
    } catch (err) {
      toastError(err);
    }
  };

  const getDeletePermission = (message) => {
    if (
      user.id === message.userId ||
      user.profile === "admin" ||
      user.profile === "supervisor"
    ) {
      return false;
    }
    return true;
  };

  const renderMessages = () => {
    if (messagesList.length > 0) {
      const viewMessagesList = messagesList.map((message, index) => {
        if (message.mediaType === "comment") {
          if (message.isDeleted === false) {
            return (
              <Paper elevation={0} className={classes.noteContainer}>
                <div className={classes.noteHeader}>
                  <span>
                    {
                      users?.users?.find((user) => user.id === message.userId)
                        ?.name
                    }
                  </span>
                  <IconButton
                    size="small"
                    disabled={getDeletePermission(message)}
                    onClick={() => handleDeleteComment(message.id)}
                    className={classes.noteDeleteIcon}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </div>
                <div className={classes.noteText}>
                  <blockquote>{message.body}</blockquote>
                </div>
                <div className={classes.noteFooter}>
                  <span>{format(parseISO(message.createdAt), "HH:mm")}</span>
                </div>
              </Paper>
            );
          } else {
            return null;
          }
        }
        if (message.mediaType === "call_log") {
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderMessageDivider(message, index)}
              <div className={classes.messageCenter}>
                {["facebook", "instagram"].includes(
                  message?.contact?.channel
                ) === false && (
                  <IconButton
                    variant="contained"
                    size="small"
                    id="messageActionsButton"
                    disabled={message.isDeleted}
                    className={classes.messageActionsButton}
                    onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                  >
                    <ExpandMore />
                  </IconButton>
                )}

                {isGroup && (
                  <span className={classes.messageContactName}>
                    {message.contact?.name}
                  </span>
                )}
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 17"
                    width="20"
                    height="17"
                  >
                    <path
                      fill="#df3333"
                      d="M18.2 12.1c-1.5-1.8-5-2.7-8.2-2.7s-6.7 1-8.2 2.7c-.7.8-.3 2.3.2 2.8.2.2.3.3.5.3 1.4 0 3.6-.7 3.6-.7.5-.2.8-.5.8-1v-1.3c.7-1.2 5.4-1.2 6.4-.1l.1.1v1.3c0 .2.1.4.2.6.1.2.3.3.5.4 0 0 2.2.7 3.6.7.2 0 1.4-2 .5-3.1zM5.4 3.2l4.7 4.6 5.8-5.7-.9-.8L10.1 6 6.4 2.3h2.5V1H4.1v4.8h1.3V3.2z"
                    ></path>
                  </svg>{" "}
                  <span>
                    Chamada de voz/vídeo perdida às{" "}
                    {format(parseISO(message.createdAt), "HH:mm")}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        }
        if (!message.fromMe) {
          return (
						<>
							{renderNormalMessage(message, index, 'left', false)}
						</>
          );
        } else {
          return (
						<>
							{renderNormalMessage(message, index, 'rigth', false)}
						</>
          );
        }
      });
      return viewMessagesList;
    } else {
      return <div>Say hello to your new contact!</div>;
    }
  };

  return (
    <div className={classes.messagesListWrapper}>
      {/* <CSVLink style={{ textDecoration:'none'}} separator=";" filename={'conversariochat.csv'} data={messagesList.map((message) => ({ body: message.body, id: message.id, fromMe: message.fromMe, quoted : message.quotedMsg, isDel: message.isDeleted, mediaUrl : message.mediaUrl, type: message.mediaType, created : message.createdAt}))}>
      <Button
        variant="contained"
        color="primary">
          EXPORTAR CONVERSAS
        </Button>
      </CSVLink>​ */}
      <MessageOptionsMenu
        message={selectedMessage}
        anchorEl={anchorEl}
        menuOpen={messageOptionsMenuOpen}
        handleClose={handleCloseMessageOptionsMenu}
      />
      <NewTicketMenu
        message={selectedMessage}
        anchorEl={anchorEl}
        menuOpen={newTicket}
        handleClose={handleCloseNewTicket}
      />
      <div
        id="messagesList"
        className={classes.messagesList}
        onScroll={handleScroll}
      >
        {messagesList.length > 0 ? renderMessages() : []}
      </div>
      {loading && (
        <div>
          <CircularProgress className={classes.circleLoading} />
        </div>
      )}
    </div>
  );
};

export default MessagesList;
