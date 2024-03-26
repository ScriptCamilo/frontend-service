import React, { useContext, useEffect, useState } from "react";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Box, makeStyles, IconButton, Divider } from "@material-ui/core";
import api from "../../services/api";
import { format, parseISO } from "date-fns";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import { useHistory } from "react-router-dom";

import { DeleteOutline } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  resendBtn: {
    // position: "absolute",
    // bottom: "20px",
    marginRight: "0px",
    padding: 0,
    backgroundColor: "transparent",
    borderRadius: "5px",
    border: "none",
    color: "red",
    cursor: "pointer",
    overflow: "hidden",
    fontSize: "0.7em",
    fontWeight: "bold",
  },

  resendAllBtn: {
    // position: "absolute",
    // bottom: "20px",
    width: "100%",
    marginRight: "0px",
    padding: 0,
    backgroundColor: "transparent",
    borderRadius: "5px",
    border: "none",
    color: "red",
    cursor: "pointer",
    overflow: "hidden",
    fontSize: "0.7em",
    fontWeight: "bold",
  },

  messageBox: {
    width: "20em",
    padding: 0,
    margin: 0,
    gap: "0.5em",
    cursor: "default",
  },

  messageHeader: {
    display: "flex",
    justifyContent: "space-between",
  },

  messageFooter: {
    display: "flex",
    justifyContent: "space-between",
  },

  messageBody: {
    fontSize: "0.8em",
    margin: 0,
    padding: 0,
  },

  messageType: {
    fontSize: "0.8em",
    margin: 0,
    padding: 0,
  },

  messageDate: {
    fontSize: "0.8em",
    margin: 0,
    padding: 0,
  },

  messageUser: {
    width: "50%",
    fontSize: "0.8em",
    margin: 0,
    padding: 0,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },

  messageProtocol: {
    fontSize: "0.8em",
    margin: 0,
    padding: 0,
    cursor: "pointer",
  },
}));

const ResendMessagesDropdown = ({ whatsappId }) => {
  const classes = useStyles();
  const [unsendedList, setUnsendedList] = useState([]);
  const [unsendedCount, setUnsendedCount] = useState(0);
  const { users, user } = useContext(AuthContext);
  const history = useHistory();

  const getUnsendedMessages = async () => {
    try {
      const { data } = await api.get("/unsended-messages/");
      setUnsendedList(data.messages);
      setUnsendedCount(
        data.messages.filter(
          (message) => message.ticket.whatsappId === whatsappId
        ).length
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUnsendedMessages();
  }, []);

  const formatMessageType = (arg) => {
    const types = {
      image: "Imagem",
      chat: "Texto",
      application: "PDF",
      audio: "Audio",
      video: "Video",
    };

    return types[arg];
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
          getUnsendedMessages();
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
          getUnsendedMessages();
        }
      } catch (err) {
        toastError(err);
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const messagesIds = [messageId];

      const { status } = await api.delete(
        `/messages-clock-delete/${messagesIds}`
      );
      if (status === 200) {
        getUnsendedMessages();
      }
    } catch (err) {
      toastError(err);
    }
  };

  const handleDeleteAllMessages = async () => {
    try {
      const { status } = await api.delete(`/messages-clock-delete/0`);
      if (status === 200) {
        getUnsendedMessages();
      }
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div style={{ width: "auto", marginTop: -4 }}>
      <FormControl fullWidth margin="dense">
        <Select
          style={{
            width: "auto",
            fontSize: "0.8em",
            marginTop: -4,
            display: "flex",
            alignItems: "center",
          }}
          displayEmpty
          multiple
          variant="outlined"
          defaultValue={unsendedList}
          MenuProps={{
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            getContentAnchorEl: null,
          }}
          renderValue={() => `Pendentes (${unsendedCount})`}
        >
          {unsendedList?.length > 0 &&
            unsendedList
              .filter((message) => message.ticket.whatsappId === whatsappId)
              .map((message) => (
                <MenuItem dense key={message.id} value={message.id}>
                  <Box className={classes.messageBox}>
                    <div className={classes.messageHeader}>
                      <p
                        className={classes.messageType}
                      >{`Tipo: ${formatMessageType(message.mediaType)}`}</p>
                      <p className={classes.messageDate}>
                        {format(
                          parseISO(message.createdAt),
                          "dd/MM/yyyy, hh:mm:ss aaaa"
                        )}
                      </p>
                    </div>
                    <p className={classes.messageBody}>
                      {message.mediaType === "chat" &&
                        `Mensagem: ${message.body}`}
                    </p>
                    <div className={classes.messageFooter}>
                      <p className={classes.messageUser}>{`Atendente: ${
                        users.users.find((user) => user.id === message.userId)
                          ?.name
                      }`}</p>
                      <button
                        className={classes.resendBtn}
                        onClick={() => handleSendMessage(message)}
                      >
                        Reenviar
                      </button>
                      <p
                        className={classes.messageProtocol}
                        onClick={() =>
                          history.push(`/tickets/${message.ticketId}`)
                        }
                      >{`Ticket: ${message.ticket.id}`}</p>
                    </div>
                  </Box>
                  <IconButton>
                    <DeleteOutline
                      onClick={() => handleDeleteMessage(message.id)}
                    />
                  </IconButton>
                </MenuItem>
              ))}
          <Divider />
          <button
            className={classes.resendAllBtn}
            onClick={() =>
              unsendedList.forEach((message) => handleSendMessage(message))
            }
          >
            Reenviar Todas
          </button>
          <Divider />
          <button
            className={classes.resendAllBtn}
            onClick={() => handleDeleteAllMessages()}
          >
            Deletar Todas
          </button>
        </Select>
      </FormControl>
    </div>
  );
};

export default ResendMessagesDropdown;
