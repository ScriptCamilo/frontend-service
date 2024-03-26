import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Avatar,
  Button,
  FormControlLabel,
  Hidden,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Switch,
  Typography,
  useMediaQuery,
  useTheme
} from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import Paper from "@material-ui/core/Paper";
import { Delete, GetApp } from "@material-ui/icons";
import AppsTemplate from "@material-ui/icons/Apps";
import CalendarToday from "@material-ui/icons/CalendarToday";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import ClearIcon from "@material-ui/icons/Clear";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import MicIcon from "@material-ui/icons/Mic";
import MoodIcon from "@material-ui/icons/Mood";
import MoreVert from "@material-ui/icons/MoreVert";
import SendIcon from "@material-ui/icons/Send";
import clsx from "clsx";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import MicRecorder from "mic-recorder-to-mp3";
import path from "path";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { getAWSUrl } from "../../config";
import { useAuthContext } from "../../context/Auth/AuthContext";
import { useReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import { useSettingsContext } from "../../context/SettingsContext";
import toastError from "../../errors/toastError";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import QuickAnswerSelect from "../QuickAnswerSelect";
import QuickMentionSelect from "../QuickMentionSelect";
import TemplatesModal from "../TemplatesModal";
import TicketShareMenu from "../TicketShareMenu";
import RecordingTimer from "./RecordingTimer";
import { useStyles } from "./styles";
// import useMixpanel from "../../hooks/useMixpanel";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

function MessageInput({ ticket, handleOpenScheduleModal }) {
  const inputRef = useRef();
  const classes = useStyles();
  const { ticketId } = useParams();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));
  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);
  const { user, track } = useAuthContext();
  const { setReplyingMessage, replyingMessage } = useReplyMessageContext();
  const { getSettingValue } = useSettingsContext();

  const isScheduleEnable = getSettingValue("showSchedulePage") === "true";
  const isForcedSignatureEnable =
    getSettingValue("forcedSignature") === "true" && user.profile === "user";

  const [medias, setMedias] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [typeBar, setTypeBar] = useState(false);
  const [onDragEnter, setOnDragEnter] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [integrants, setIntegrants] = useState([]);
  const [integrantsFiltered, setIntegrantsFiltered] = useState([]);
  const [isComment, setIsComment] = useState(false);

  const numberOfGroup = history.location.pathname.split("/")[2];

  const toastMoreThan24Hours = useCallback(() => {
    toast.info(
      `Você está respondendo um
			ticket que não teve interação nas últimas 24 horas. Por isso, envie um template antes.`,
      {
        autoClose: 10000,
      }
    );
  }, []);

  const toastAwaitAnswer = useCallback(() => {
    toast.info(`O cliente ainda nao respondeu o seu template, aguarde.`);
  }, []);

  const verifiedTimeTheLastMessage = async () => {
    if (!ticket.whatsappApiId) return false;

    if (
      (new Date() - new Date(ticket.lastMessageDate)) / (1000 * 60 * 60) > 24 &&
      ticket.whatsappApiId
    ) {
      toastMoreThan24Hours();
      setShowTemplates(true);
      return true;
    }

    if (
      ticket.lastMessageDateNotFromMe &&
      (new Date() - new Date(ticket.lastMessageDateNotFromMe)) /
        (1000 * 60 * 60) <
        24 &&
      ticket.whatsappApiId
    ) {
      return false;
    }

    try {
      const { data } = await api.get(
        `/messages/lastMessageNotFromMe/${ticket.contactId}`
      );

      if (!data) {
        toastAwaitAnswer();
        return true;
      }

      if (
        data &&
        (new Date() - new Date(ticket.createdAt)) / (1000 * 60 * 60) > 24 &&
        ticket.whatsappApiId
      ) {
        toastAwaitAnswer();
        return true;
      }

      return false;
    } catch (error) {
      toast.error("Erro ao verificar tempo da ultima mensagem");
      return true;
    }
  };

  const getContactName = useCallback(
    async (value) => {
      const arraySeparateFromAt = value.split("@");
      const lastString = arraySeparateFromAt[arraySeparateFromAt.length - 2];

      if (value === "") {
        setIntegrantsFiltered([]);
      } else if (
        (integrants.length > 1 &&
          lastString &&
          lastString[lastString.length - 1] === " ") ||
        value === "@"
      ) {
        setIntegrantsFiltered(
          integrants.filter(
            (e) =>
              e.contact?.name
                .toLowerCase()
                .startsWith(
                  arraySeparateFromAt[
                    arraySeparateFromAt.length - 1
                  ].toLowerCase()
                ) ||
              e.contact.number
                .toLowerCase()
                .startsWith(
                  arraySeparateFromAt[
                    arraySeparateFromAt.length - 1
                  ].toLowerCase()
                )
          )
        );
      } else {
        setIntegrantsFiltered([]);
      }
    },
    [integrants]
  );

  const handleChangeInput = useCallback(
    (e) => {
      let value = e.target.value;
      const isQuickAnswerSearch = value && value.indexOf("/") === 0;

      if (value === "@") value = " @";

      setInputMessage(value);

      getContactName(value);

      if (!typeBar && isQuickAnswerSearch) {
        return setTypeBar(true);
      } else if (typeBar && !isQuickAnswerSearch) {
        return setTypeBar(false);
      }
    },
    [getContactName, typeBar]
  );

  const handleQuickAnswersClick = useCallback(async (value) => {
    try {
      if (value.mediaUrl) {
        const { data } = await api.get(`public/${value.mediaUrl}`, {
          responseType: "blob",
        });
        const myFile = new File([data], value.mediaUrl);
        const selectedMedias = [myFile];
        setMedias(selectedMedias);
      }
      setInputMessage(value.message);
      setTypeBar(false);
      track("Quick Answer Use");
    } catch (e) {
      if (value.mediaUrl) {
        const fileExtension = value?.mediaUrl.split(".").pop().toLowerCase();
        const mimeTypes = {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          gif: "image/gif",
          mp3: "audio/mpeg",
          mp4: "video/mp4",
          ogg: "audio/ogg",
          webm: "video/webm",
          pdf: "application/pdf",
          doc: "application/msword",
          docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          xls: "application/vnd.ms-excel",
          xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ppt: "application/vnd.ms-powerpoint",
          pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          txt: "text/plain",
        };

        const mimeType = mimeTypes[fileExtension];
        if (mimeType) {
          const response = await fetch(`${getAWSUrl() + value.mediaUrl}`);

          if (response.ok) {
            const blob = await response.blob();
            const myFile = new File([blob], value.mediaUrl, { type: mimeType });
            const selectedMedias = [myFile];
            setMedias(selectedMedias);
          }
        }
      }

      setInputMessage(value.message);
      setTypeBar(false);
      track("Quick Answer Use");
    }
  }, []);

  const handleQuickMentionClick = useCallback(
    (value) => {
      const stringSepareLastAt = inputMessage.split("@");
      delete stringSepareLastAt[stringSepareLastAt.length - 1];
      const message = stringSepareLastAt.join("@");

      setInputMessage(message + value);
      getContactName("");
    },
    [getContactName, inputMessage]
  );

  const handleAddEmoji = useCallback(
    (e) => {
      let emoji = e.native;
      setInputMessage((prevState) => {
        const cursor = cursorPosition;
        const start = prevState.substring(0, cursor);
        if (cursor === prevState.length) {
          return start + emoji;
        }
        const end = prevState.substring(cursor);
        return start + emoji + end;
      });
    },
    [cursorPosition]
  );

  const handleChangeMedias = useCallback((e) => {
    if (!e.target.files) {
      return;
    }
    const selectedMedias = Array.from(e.target.files);
    setMedias(selectedMedias);
  }, []);

  const handleInputPaste = useCallback((e) => {
    if (e.clipboardData.files[0]) {
      const selectedMedias = Array.from(e.clipboardData.files);
      setMedias(selectedMedias);
    }
  }, []);

  const handleInputDrop = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) {
      const selectedMedias = Array.from(e.dataTransfer.files);
      setMedias(selectedMedias);
    }
  }, []);

  const sendMessage = useCallback(
    async (e) => {
      setLoading(true);
      if (e) e.preventDefault();

      const timeLastMessage = await verifiedTimeTheLastMessage();
      if (timeLastMessage) return setLoading(false);

      let isMediaTooLarge = false;
      let invalidExtension = false;

      medias.forEach((media) => {
        if (!media?.name) return;
        const extension = path.extname(media.name);
        if (!extension) invalidExtension = true;
        if (media.size > 15 * 1024 * 1024) isMediaTooLarge = true;
      });

      if (invalidExtension) {
        toast.warn(
          "Arquivo sem extensão, por favor adicione um arquivo valido.",
          {
            className: classes.customToast,
          }
        );
        return setLoading(false);
      }

      if (isMediaTooLarge) {
        toast.warn(
          "Arquivo maior que 15MB não será possível enviar. Reduza o tamanho do arquivo.",
          {
            className: classes.customToast,
          }
        );
        return setLoading(false);
      }

      if (medias.length > 0) {
        const formData = new FormData();
        formData.append("fromMe", true);

        if (inputMessage.trim()) {
          const media = medias[0];
          formData.append("medias", media);
          formData.append("body", media.name);
          formData.append("caption", inputMessage.trim());

          removeMedia(0);
        } else {
          medias.forEach((media) => {
            formData.append("medias", media);
          });
          setMedias([]);
        }

        if (replyingMessage) {
          formData.append("quotedMsg", JSON.stringify(replyingMessage));
        }

        try {
          await api.post(`/messages/${ticketId}`, formData);
        } catch (err) {
          toastError(err);
        }
      } else {
        if (inputMessage.trim() === "") return setLoading(false);

        const message = {
          read: 1,
          fromMe: true,
          body:
            isForcedSignatureEnable || signMessage
              ? `*${user?.name}:*\n${inputMessage.trim()}`
              : inputMessage.trim(),
          quotedMsg: replyingMessage,
          userId: user.id,
          mediaUrl: isComment ? "comment" : "",
          mediaType: isComment ? "comment" : "",
        };

        try {
          await api.post(`/messages/${ticketId}`, message);
        } catch (err) {
          toast.error(err.response.data.error.toLowerCase());
        }
      }

      setInputMessage("");
      setShowEmoji(false);
      setLoading(false);
      setReplyingMessage(null);
    },
    [
      medias,
      ticketId,
      classes,
      inputMessage,
      replyingMessage,
      user,
      isComment,
      signMessage,
      verifiedTimeTheLastMessage,
      isForcedSignatureEnable,
    ]
  );

  const handleStartRecording = useCallback(async () => {
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await Mp3Recorder.start();
      setRecording(true);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  }, []);

  const handleUploadAudio = useCallback(async () => {
    setLoading(true);
    if (await verifiedTimeTheLastMessage()) {
      await Mp3Recorder.stop();
      setRecording(false);
      return setLoading(false);
    }
    try {
      const [, blob] = await Mp3Recorder.stop().getMp3();

      const timeLastMessage = await verifiedTimeTheLastMessage();

      if (blob.size < 10000 || timeLastMessage) {
        setLoading(false);
        setRecording(false);
        return;
      }

      const formData = new FormData();
      const filename = `${new Date().getTime()}.mp3`;
      formData.append("medias", blob, filename);
      formData.append("body", filename);
      formData.append("fromMe", true);

      if (replyingMessage) {
        formData.append("quotedMsg", JSON.stringify(replyingMessage));
      }

      await api.post(`/messages/${ticketId}`, formData);
      track("Audio Use", {
        Action: "Sent",
      });
    } catch (err) {
      toastError(err);
    }

    setRecording(false);
    setLoading(false);
    setInputMessage("");
    setShowEmoji(false);
    setReplyingMessage(null);
  }, [ticketId, verifiedTimeTheLastMessage, track]);

  const handleCancelAudio = useCallback(async () => {
    try {
      await Mp3Recorder.stop();
      setRecording(false);
    } catch (err) {
      toastError(err);
    }
  }, []);

  const handleOpenMenuClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuItemClick = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const removeMedia = (index) => {
    const updatedMedias = [...medias];
    updatedMedias.splice(index, 1);
    setMedias(updatedMedias);
  };

  useEffect(() => {
    if (!isMobile) {
      inputRef.current.focus();
      return () => {
        Mp3Recorder.stop();
      };
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) {
      inputRef.current.focus();
    }
  }, [replyingMessage, isMobile]);

  useEffect(() => {
    if (onDragEnter) {
      setTimeout(() => {
        setOnDragEnter(false);
      }, 3000);
    }
  }, [onDragEnter]);

  useEffect(() => {
    async function init() {
      if (ticket.whatsappId && ticket.isGroup) {
        const {
          data: { listContacts },
        } = await api.get(`/group/${ticket.contact.number}@g.us`, {
          params: {
            profilePicUrl: "true",
            whatsappId: ticket.whatsappId,
          },
        });
        setIntegrants(listContacts || []);
      }
    }
    init();
  }, [ticket]);

  const renderBodyReplyMessage = (message) => {
    switch (message.mediaType) {
      case "image":
        return <img src={message.mediaUrl} />;
      case "video":
        return <video src={message.mediaUrl} controls />;
      case "document":
        return (
          <div className={classes.downloadMedia}>
            <Button
              startIcon={<GetApp />}
              color="primary"
              variant="outlined"
              target="_blank"
            >
              Download
            </Button>
          </div>
        );
      default:
        return <p>{message.body}</p>;
    }
  };

  const renderReplyingMessage = useCallback(
    (message) => {
      return (
        <div className={classes.replyingMsgWrapper}>
          <div className={classes.replyingMsgContainer}>
            <span
              className={clsx(classes.replyingContactMsgSideColor, {
                [classes.replyingSelfMsgSideColor]: !message.fromMe,
              })}
            ></span>
            <div className={classes.replyingMsgBody}>
              {!message.fromMe && (
                <span className={classes.messageContactName}>
                  {message.contact?.name}
                </span>
              )}
              {renderBodyReplyMessage(message)}
            </div>
          </div>
          <IconButton
            aria-label="showRecorder"
            disabled={loading || ticket?.status === "closed"}
            onClick={() => setReplyingMessage(null)}
          >
            <ClearIcon className={classes.sendMessageIcons} />
          </IconButton>
        </div>
      );
    },
    [classes, loading, setReplyingMessage, ticket]
  );

  const inputRender = useMemo(
    () => (
      <Paper
        square
        elevation={0}
        className={classes.mainWrapper}
        onDragEnter={() => setOnDragEnter(true)}
        onDrop={(e) => handleInputDrop(e)}
      >
        {medias.length > 0 && (
          <List
            style={{
              width: "100%",
              height: "130px",
              overflowY: "auto",
              background: "#3f622f",
              borderRadius: "5px",
            }}
          >
            {medias?.map((value, index) => {
              return (
                <>
                  <ListItem
                    key={index}
                    style={{
                      height: "50px",
                      background: "#00000036",
                      width: "auto",
                      borderRadius: "10px",
                      margin: "5px",
                    }}
                  >
                    <IconButton onClick={() => removeMedia(index)}>
                      <Delete className={classes.initAudioIcon} />
                    </IconButton>
                    <ListItemAvatar>
                      <Avatar
                        className={classes.avatar}
                        alt={value?.name}
                        src={value?.name ? URL.createObjectURL(value) : value}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography style={{ color: "white" }}>
                          {`${value?.name || value}`}
                        </Typography>
                      }
                      secondary={
                        <Typography style={{ color: "whitesmoke" }}>
                          {value.size
                            ? `${parseInt(value?.size / 1024)} kB`
                            : ""}
                        </Typography>
                      }
                    />
                  </ListItem>
                </>
              );
            })}
          </List>
        )}

        <TemplatesModal
          isOpen={showTemplates}
          onClose={() => setShowTemplates(false)}
          ticketId={ticket.id}
          whatsappApiId={ticket.whatsappApiId}
          userId={user.id}
        />

        <div className={onDragEnter ? classes.dropInfo : classes.dropInfoOut}>
          <span role="img" aria-label="down-icon">
            ⬇️
          </span>
          {i18n.t("uploads.titles.titleUploadMsgDragDrop")}
          <span role="img" aria-label="down-icon">
            ⬇️
          </span>
        </div>

        {replyingMessage && renderReplyingMessage(replyingMessage)}
        {integrantsFiltered.length > 0 && (
          <QuickMentionSelect
            handleClick={handleQuickMentionClick}
            integrantsFiltered={integrantsFiltered}
          />
        )}
        <div className={classes.newMessageBox}>
          <Hidden only={["md", "lg", "xl"]}>
            {showEmoji ? (
              <div className={classes.emojiBoxMobile}>
                <ClickAwayListener onClickAway={(e) => setShowEmoji(false)}>
                  <Picker
                    perLine={9}
                    showPreview={false}
                    showSkinTones={false}
                    onSelect={handleAddEmoji}
                  />
                </ClickAwayListener>
              </div>
            ) : null}
            <IconButton
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={handleOpenMenuClick}
            >
              <MoreVert></MoreVert>
            </IconButton>
            <Menu
              id="simple-menu"
              keepMounted
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuItemClick}
            >
              <MenuItem onClick={handleMenuItemClick}>
                <IconButton
                  aria-label="emojiPicker"
                  className={classes.menuItemIconButton}
                  disabled={loading || recording || ticket?.status === "closed"}
                  onClick={(e) => setShowEmoji((prevState) => !prevState)}
                >
                  <MoodIcon className={classes.sendMessageIcons} />
                </IconButton>
              </MenuItem>
              <MenuItem onClick={handleMenuItemClick}>
                <input
                  multiple
                  type="file"
                  id="upload-button"
                  disabled={loading || recording || ticket?.status === "closed"}
                  className={classes.uploadInput}
                  onChange={handleChangeMedias}
                />
                <TicketShareMenu
                  channel={ticket.contact?.channel}
                  ticketId={ticketId}
                  isOficial={ticket.whatsappApiId}
                  whatsappId={ticket?.whatsappId}
                  className={classes.menuItemIconButton}
                  isMobile={isMobile}
                />
              </MenuItem>

              {isScheduleEnable && (
                <MenuItem onClick={handleMenuItemClick}>
                  <IconButton
                    className={classes.menuItemIconButton}
                    aria-label="emojiPicker"
                    disabled={loading || recording || ticket?.status !== "open"}
                    onClick={handleOpenScheduleModal}
                  >
                    <CalendarToday className={classes.sendMessageIcons} />
                  </IconButton>
                </MenuItem>
              )}

              <MenuItem onClick={handleMenuItemClick}>
                <FormControlLabel
                  style={{ marginRight: 7, color: "gray" }}
                  label={i18n.t("messagesInput.signMessage")}
                  labelPlacement="start"
                  control={
                    <Switch
                      size="small"
                      checked={signMessage}
                      onChange={(e) => setSignMessage(e.target.checked)}
                      name="showAllTickets"
                      color="primary"
                    />
                  }
                />
              </MenuItem>

              <MenuItem onClick={handleMenuItemClick}>
                <FormControlLabel
                  style={{ marginRight: 7, color: "gray" }}
                  label="Anotar"
                  labelPlacement="start"
                  control={
                    <Switch
                      size="small"
                      checked={isComment}
                      onChange={() => setIsComment(!isComment)}
                      color="primary"
                    />
                  }
                />
              </MenuItem>
            </Menu>
          </Hidden>
          <div
            className={
              isComment === false
                ? classes.messageInputWrapper
                : classes.commentInputWrapper
            }
          >
            <InputBase
              inputRef={(input) => {
                if (!isMobile) {
                  input && input.focus();
                  input && (inputRef.current = input);
                } else if (isMobile && input) {
                  if (inputRef.current) input.blur();
                  inputRef.current = undefined;
                }
              }}
              className={classes.messageInput}
              placeholder={
                ticket?.status === "open" || "groups"
                  ? i18n.t("messagesInput.placeholderOpen")
                  : i18n.t("messagesInput.placeholderClosed")
              }
              multiline
              maxRows={5}
              value={inputMessage}
              onChange={handleChangeInput}
              disabled={recording || loading || ticket?.status === "closed"}
              onPaste={(e) => {
                (ticket?.status === "open" || ticket?.status === "groups") &&
                  handleInputPaste(e);
              }}
              onKeyDown={(e) => {
                setCursorPosition(e.target.selectionEnd);
                if (loading || e.shiftKey) return;
                else if (e.key === "Enter" && !isMobile) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              onClick={(e) => {
                setCursorPosition(e.target.selectionEnd);
              }}
            />

            <Hidden only={["sm", "xs"]} className={classes.inputOptions}>
              {showEmoji ? (
                <div className={classes.emojiBox}>
                  <ClickAwayListener onClickAway={(e) => setShowEmoji(false)}>
                    <Picker
                      perLine={16}
                      showPreview={false}
                      showSkinTones={false}
                      onSelect={handleAddEmoji}
                    />
                  </ClickAwayListener>
                </div>
              ) : null}

              <div className={classes.iconsWrapper}>
                {!ticket.whatsapp && ticket.whatsappApi && (
                  <IconButton
                    component="span"
                    size="small"
                    disabled={
                      loading || recording || ticket?.status === "closed"
                    }
                    onClick={() => setShowTemplates(!showTemplates)}
                  >
                    <AppsTemplate />
                  </IconButton>
                )}

                <IconButton
                  aria-label="emojiPicker"
                  size="small"
                  disabled={loading || recording || ticket?.status === "closed"}
                  onClick={(e) => setShowEmoji((prevState) => !prevState)}
                >
                  <MoodIcon className={classes.sendMessageIcons} />
                </IconButton>

                <input
                  multiple
                  type="file"
                  id="upload-button"
                  disabled={loading || recording || ticket?.status === "closed"}
                  className={classes.uploadInput}
                  onChange={handleChangeMedias}
                />

                <TicketShareMenu
                  channel={ticket.contact?.channel}
                  ticketId={ticketId}
                  isOficial={ticket.whatsappApiId}
                  whatsappId={ticket?.whatsappId}
                />

                {isScheduleEnable && (
                  <IconButton
                    aria-label="emojiPicker"
                    size="small"
                    disabled={loading || recording || ticket?.status !== "open"}
                    onClick={handleOpenScheduleModal}
                  >
                    <CalendarToday className={classes.sendMessageIcons} />
                  </IconButton>
                )}
              </div>

              <div className={classes.messageOptions}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={isForcedSignatureEnable}
                  className={
                    signMessage
                      ? classes.activatedButton
                      : classes.deactivatedButton
                  }
                  onClick={() => setSignMessage(!signMessage)}
                >
                  {isForcedSignatureEnable ? (
                    <>
                      <LockOutlinedIcon fontSize="small" />
                      <span>Assinar</span>
                    </>
                  ) : (
                    <span>Assinar</span>
                  )}
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  className={
                    isComment
                      ? classes.activatedButton
                      : classes.deactivatedButton
                  }
                  onClick={(e) => setIsComment(!isComment)}
                >
                  Anotar
                </Button>
              </div>
            </Hidden>

            <QuickAnswerSelect
              handleClick={handleQuickAnswersClick}
              searchParam={inputMessage.substring(1)}
              isOpen={typeBar}
            />
          </div>
          {inputMessage || medias.length > 0 ? (
            <IconButton
              aria-label="sendMessage"
              onClick={sendMessage}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={28} />
              ) : (
                <SendIcon className={classes.sendMessageIcons} />
              )}
            </IconButton>
          ) : recording ? (
            <>
              <div className={classes.recorderOverlay} />
              <div className={classes.recorderWrapper}>
                <IconButton
                  aria-label="cancelRecording"
                  component="span"
                  fontSize="large"
                  disabled={loading}
                  onClick={handleCancelAudio}
                >
                  <HighlightOffIcon className={classes.cancelAudioIcon} />
                </IconButton>
                {loading ? (
                  <div>
                    <CircularProgress className={classes.audioLoading} />
                  </div>
                ) : (
                  <RecordingTimer />
                )}

                <IconButton
                  aria-label="sendRecordedAudio"
                  component="span"
                  onClick={handleUploadAudio}
                  disabled={loading}
                >
                  <CheckCircleOutlineIcon className={classes.sendAudioIcon} />
                </IconButton>
              </div>
            </>
          ) : (
            <IconButton
              aria-label="showRecorder"
              disabled={loading || ticket?.status === "closed"}
              onClick={handleStartRecording}
            >
              <MicIcon className={classes.initAudioIcon} />
            </IconButton>
          )}
        </div>
      </Paper>
    ),
    [
      classes,
      onDragEnter,
      handleInputDrop,
      replyingMessage,
      showEmoji,
      anchorEl,
      loading,
      handleChangeMedias,
      inputMessage,
      handleChangeInput,
      handleInputPaste,
      sendMessage,
      isComment,
      handleQuickAnswersClick,
      recording,
      handleCancelAudio,
      handleUploadAudio,
      handleStartRecording,
      handleOpenScheduleModal,
      integrantsFiltered,
      isScheduleEnable,
      renderReplyingMessage,
      setSignMessage,
      signMessage,
      ticket,
      ticketId,
      typeBar,
      handleQuickMentionClick,
      showTemplates,
      user,
      isForcedSignatureEnable,
      handleAddEmoji,
      handleMenuItemClick,
      handleOpenMenuClick,
      isMobile,
      setCursorPosition,
    ]
  );

  return inputRender;
}

export default MessageInput;
