import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Button,
  CircularProgress,
  ClickAwayListener,
  DialogActions,
  DialogContent,
  FormControlLabel,
  Hidden,
  IconButton,
  InputBase,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  Switch,
} from "@material-ui/core";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import CancelIcon from "@material-ui/icons/Cancel";
import FacebookIcon from "@material-ui/icons/Facebook";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import InstagramIcon from "@material-ui/icons/Instagram";
import MicIcon from "@material-ui/icons/Mic";
import MoodIcon from "@material-ui/icons/Mood";
import MoreVert from "@material-ui/icons/MoreVert";
import PauseCircleOutline from "@material-ui/icons/PauseCircleOutline";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import dayjs from "dayjs";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import MicRecorder from "mic-recorder-to-mp3";
import { toast } from "react-toastify";

import { useAuthContext } from "../../context/Auth/AuthContext";
import { useUsersContext } from "../../context/UsersContext";
import toastError from "../../errors/toastError";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ContactSelect from "../ContactSelect";
import CustomFileViewer from "../CustomFileViewer";
import DefaultWildCardsDisplay from "../DefaultWildCardsDisplay";
import RecordingTimer from "../MessageInput/RecordingTimer";
import QuickAnswerSelect from "../QuickAnswerSelect";
import SelectConnection from "../SelectConnection";
import { useStyles } from "./styles";
// import useMixpanel from "../../hooks/useMixpanel";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const selectMenuProps = {
  PaperProps: {
    style: { maxHeight: "400px" },
  },
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "left",
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "left",
  },
  getContentAnchorEl: null,
};

function ScheduleInput({ handleCloseModal, scheduleInfo, isCopy, ticket }) {
  const day = dayjs();
  const classes = useStyles();
  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);
  const { user, track } = useAuthContext();
  const { users, setUsersPageNumber, pageNumber } = useUsersContext();

  const signUserPattern = /\*.*?:\*\s*/;
  const contacts = scheduleInfo ? scheduleInfo?.contacts : [];
  const contactsSelected = ticket?.contactId ? [ticket.contact] : contacts;
  const ticketConnectionId = ticket?.metaId || ticket?.whatsappId;
  const scheduleConnectionId = scheduleInfo?.metaId || scheduleInfo?.whatsappId;
  const connectionId = ticketConnectionId || scheduleConnectionId || "";
  const queueId = ticket?.queueId || scheduleInfo?.queueId || "";
  const userId = ticket?.userId || scheduleInfo?.userId || user.id;
  const createTicketStatus = scheduleInfo?.createTicket ?? true;
  const [dateInfo, timeInfo] =
    scheduleInfo && !isCopy ? scheduleInfo?.date.split(" ") : [];
  const bodyInfo =
    scheduleInfo?.mediaType === "chat" &&
    scheduleInfo?.body.replace(signUserPattern, "");
  const isTypeChat = scheduleInfo?.mediaType === "chat";
  const isTypeAudio = scheduleInfo?.mediaType === "audio";
  const isTypeFile = scheduleInfo?.mediaType && !isTypeChat && !isTypeAudio;
  const scheduleChannel =
    ticket?.contact?.channel || scheduleInfo?.contacts[0]?.channel;
  const ticketConnection = scheduleChannel || "whatsapp";

  const [date, setDate] = useState(dateInfo || day.format("YYYY-MM-DD"));
  const [time, setTime] = useState(timeInfo || day.format("HH:mm"));
  const [selectedContacts, setSelectedContacts] = useState(contactsSelected);
  const [medias, setMedias] = useState();
  const [inputMessage, setInputMessage] = useState(bodyInfo || "");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [typeBar, setTypeBar] = useState(false);
  const inputRef = useRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(connectionId);
  const [selectedQueue, setSelectedQueue] = useState(queueId);
  const [selectedUser, setSelectedUser] = useState(userId);
  const [createTicket, setCreateTicket] = useState(createTicketStatus);
  const [audio, setAudio] = useState(null);
  const [isMedia, setIsMedia] = useState(isTypeFile);
  const [isAudio, setIsAudio] = useState(isTypeAudio);
  const [channel, setChannel] = useState(ticketConnection);
	const [cursorPosition, setCursorPosition] = useState(0)

  // const mixpanel = useMixpanel();
  const hasContent = inputMessage || recording || isMedia || isAudio;
  const userQueues = users?.find((u) => u.id === selectedUser)?.queues || [];
  const url = window.location.href;

  const handleChannel = (_e, newChannel) => {
    if (newChannel !== null) {
      setChannel(newChannel);
      setSelectedContacts([]);
      setSelectedConnection("");
    }
  };

  const translatedButtonMessage = useMemo(() => {
    switch (true) {
      case Boolean(isCopy):
        return "okCopy";
      case Boolean(scheduleInfo):
        return "okEdit";
      default:
        return "okAdd";
    }
  }, [isCopy, scheduleInfo]);

  const handleSetTime = (e) => {
    const arrayTime = e.target.value.split(":");
    let newHour = Number(arrayTime[0]);
    let newMinute = Number(arrayTime[1]);
    const nowHour = dayjs().get("hour");
    const nowMinute = dayjs().get("minute");

    if (date === day.format("YYYY-MM-DD")) {
      if (newHour < nowHour) {
        newHour = nowHour;
      }
      if (newHour === nowHour && newMinute < nowMinute) {
        newMinute = nowMinute;
      }
    }

    setTime(
      `${newHour < 10 ? "0" + newHour : newHour}:${
        newMinute < 10 ? "0" + newMinute : newMinute
      }`
    );
  };

  const handleChangeInput = useCallback(
    (e) => {
      const value = e.target.value;
      const isQuickAnswerSearch = value && value.indexOf("/") === 0;

      setInputMessage(value);

      if (!typeBar && isQuickAnswerSearch) {
        return setTypeBar(true);
      } else if (typeBar && !isQuickAnswerSearch) {
        return setTypeBar(false);
      }
    },
    [typeBar]
  );

  const handleQuickAnswersClick = useCallback(async (value) => {
    try {
      const { data } = await api.get(value.mediaUrl, {
        responseType: "blob",
      });
      const myFile = new File([data], value.mediaUrl);
      const selectedMedias = [myFile];
      setInputMessage(value.message);
      setMedias(selectedMedias);
      setTypeBar(false);
    } catch {
      setInputMessage(value.message);
      setTypeBar(false);
    }
  }, []);

  const handleAddEmoji = (e) => {
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
  };

  const handleCancelMedias = () => {
    setMedias();
    setIsMedia(false);
    setIsAudio(false);
  };

  const handleContactChange = (values) => {
    if (values.length > 10) {
      return toast.error("Limite de 10 contatos atingido!");
    }
    setSelectedContacts(values)
  }

  const handleChangeMedias = (e) => {
    if (!e.target.files) {
      return;
    }

    const selectedMedia = e.target.files[0];

    selectedMedia.nameMedia = e.target?.name;
    setMedias(selectedMedia);
    setIsMedia(true);
  };

  const handleInputPaste = (e) => {
    if (e.clipboardData.files[0]) {
      setMedias([e.clipboardData.files[0]]);
    }
  };

  const handleUploadMedia = useCallback(
    async (e) => {
      e.preventDefault();
      const body = inputMessage.trim() || medias?.name || scheduleInfo?.body;

      const formData = new FormData();
      formData.append("date", date);
      formData.append("time", time);
      selectedContacts.forEach((contact) =>
        formData.append("contacts", contact.id)
      );
      formData.append("queueId", selectedQueue);
      formData.append("userId", selectedUser);
      formData.append("createTicket", createTicket);
      formData.append("medias", medias);
      formData.append("body", body);
      switch (channel) {
        case "whatsapp":
          formData.append("whatsappId", selectedConnection);
          break;
        case "facebook":
        case "instagram":
          formData.append("metaId", selectedConnection);
          break;
        default:
          break;
      }

      if (scheduleInfo && !isCopy) {
        await api.put(`/schedule/${scheduleInfo.id}`, formData);
      } else {
        if (isCopy && !medias) {
          formData.append("mediaUrl", scheduleInfo?.mediaUrl);
          formData.append("mediaType", scheduleInfo?.mediaType);
        }
        await api.post("/schedule", formData);
        track(`Schedule Change`, {
          Origin: `${url.split("/")[3]}`,
          Action: "Create",
        });
      }
      setMedias();
    },
    [
      date,
      time,
      medias,
      selectedContacts,
      scheduleInfo,
      isCopy,
      selectedConnection,
      selectedQueue,
      selectedUser,
      createTicket,
      inputMessage,
      channel,
      track,
      url,
    ]
  );

  const handleAudioBlob = useCallback(async (action) => {
    const [, blob] = await Mp3Recorder.stop().getMp3();
    if (blob.size < 10000) {
      setIsAudio(false);
      setRecording(false);
      return;
    }

    switch (action) {
      case "get":
        return blob;
      default:
        return setAudio(blob);
    }
  }, []);

  const handleUploadAudio = useCallback(async () => {
    const blob = recording
      ? audio || (await handleAudioBlob("get"))
      : undefined;

    const formData = new FormData();
    const filename = `${new Date().getTime()}.mp3`;
    if (blob) {
      formData.append("medias", blob, filename);
      formData.append("body", filename);
    }
    formData.append("date", date);
    formData.append("time", time);
    selectedContacts.forEach((contact) =>
      formData.append("contacts", contact.id)
    );
    formData.append("queueId", selectedQueue);
    formData.append("userId", selectedUser);
    formData.append("createTicket", createTicket);
    switch (channel) {
      case "whatsapp":
        formData.append("whatsappId", selectedConnection);
        break;
      case "facebook":
      case "instagram":
        formData.append("metaId", selectedConnection);
        break;
      default:
        break;
    }

    if (scheduleInfo && !isCopy) {
      await api.put(`/schedule/${scheduleInfo.id}`, formData);
    } else {
      if (isCopy && !blob) {
        formData.append("body", scheduleInfo?.body);
        formData.append("mediaUrl", scheduleInfo?.mediaUrl);
        formData.append("mediaType", scheduleInfo?.mediaType);
      }
      await api.post("/schedule", formData);
      track(`Schedule Change`, {
        Origin: `${url.split("/")[3]}`,
        Action: "Create",
      });
    }
    setIsAudio(false);
    setRecording(false);
  }, [
    date,
    time,
    selectedContacts,
    scheduleInfo,
    isCopy,
    audio,
    recording,
    selectedConnection,
    selectedQueue,
    selectedUser,
    createTicket,
    handleAudioBlob,
    channel,
    track,
    url,
  ]);

  const handleSendMessage = useCallback(async () => {
    if (inputMessage.trim() === "") return;
    const signedUser = users?.find(({ id }) => id === selectedUser);

    const message = {
      date,
      time,
      createTicket,
      contacts: selectedContacts,
      queueId: selectedQueue,
      userId: selectedUser,
      body: signMessage
        ? `*${signedUser?.name}:*\n${inputMessage.trim()}`
        : inputMessage.trim(),
    };

    switch (channel) {
      case "whatsapp":
        message.whatsappId = selectedConnection;
        break;
      case "facebook":
      case "instagram":
        message.metaId = selectedConnection;
        break;
      default:
        break;
    }

    if (scheduleInfo && !isCopy) {
      message.mediaUrl = null;
      await api.put(`/schedule/${scheduleInfo.id}`, message);
    } else {
      await api.post("/schedule", message);
      track(`Schedule Change`, {
        Origin: `${url.split("/")[3]}`,
        Action: "Create",
      });
    }
    setInputMessage("");
    setShowEmoji(false);
  }, [
    date,
    time,
    signMessage,
    inputMessage,
    selectedContacts,
    scheduleInfo,
    isCopy,
    selectedConnection,
    selectedQueue,
    selectedUser,
    createTicket,
    users,
    channel,
    track,
    url,
  ]);

  const handleScheduleAction = useCallback(
    async (e) => {
      setLoading(true);
      try {
        switch (true) {
          case isMedia:
            await handleUploadMedia(e);
            break;
          case recording || isAudio:
            await handleUploadAudio();
            break;
          default:
            await handleSendMessage();
        }
        handleCloseModal();
        toast.success(i18n.t("scheduleModal.success"));
      } catch (err) {
        if (isAudio && recording) {
          setAudio(null);
          setIsAudio(false);
          setRecording(false);
        }
        console.error(err);
        toastError(err);
      }
      setLoading(false);
    },
    [
      handleUploadMedia,
      handleUploadAudio,
      handleSendMessage,
      recording,
      handleCloseModal,
      isAudio,
      isMedia,
    ]
  );

  const handleStartRecording = async () => {
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await Mp3Recorder.start();
      setIsAudio(true);
      setRecording(true);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleCancelAudio = async () => {
    try {
      await Mp3Recorder.stop();
      setIsAudio(false);
      setRecording(false);
      setAudio(null);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (!pageNumber) setUsersPageNumber(1);
  }, [pageNumber, setUsersPageNumber]);

  useEffect(() => {
    if (
      (scheduleInfo || scheduleInfo?.mediaType === "chat") &&
      inputRef.current
    ) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length
      );
    }
    return () => {
      Mp3Recorder.stop();
    };
  }, [ticket, scheduleInfo]);

  const mediaRender = useMemo(
    () => (
      <Paper elevation={0} square className={classes.viewMediaInputWrapper}>
        <IconButton
          aria-label="cancel-upload"
          component="span"
          onClick={handleCancelMedias}
        >
          <CancelIcon className={classes.sendMessageIcons} />
        </IconButton>

        {isMedia ? (
          <div style={{ width: "100%" }}>
            {scheduleInfo?.mediaUrl && (
              <CustomFileViewer
                imageUrl={scheduleInfo?.mediaUrl}
                previousMedia={true}
              />
            )}

            {medias && (
              <CustomFileViewer
                imageUrl={URL.createObjectURL(medias)}
                name={medias?.name}
              />
            )}
          </div>
        ) : (
          <audio controls>
            <source src={scheduleInfo?.mediaUrl} type="audio/mp3"></source>
          </audio>
        )}
      </Paper>
    ),
    [classes, medias, isMedia, scheduleInfo, URL]
  );

  const inputRender = useMemo(
    () => (
      <Paper square elevation={0} className={classes.mainWrapper}>
        <div className={classes.newMessageBox}>
          <Hidden only={["sm", "xs"]}>
            <IconButton
              aria-label="emojiPicker"
              component="span"
              disabled={loading || recording}
              onClick={(e) => setShowEmoji((prevState) => !prevState)}
            >
              <MoodIcon className={classes.sendMessageIcons} />
            </IconButton>
            {showEmoji ? (
              <div className={classes.emojiBox}>
                <ClickAwayListener onClickAway={() => setShowEmoji(false)}>
                  <Picker
                    perLine={16}
                    showPreview={false}
                    showSkinTones={false}
                    onSelect={handleAddEmoji}
                    style={{
                      boxShadow:
                        "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px",
                    }}
                  />
                </ClickAwayListener>
              </div>
            ) : null}

            <input
              type="file"
              id="upload-button"
              disabled={loading || recording}
              className={classes.uploadInput}
              onChange={handleChangeMedias}
            />
            <label htmlFor="upload-button">
              <IconButton
                aria-label="upload"
                component="span"
                disabled={loading || recording}
              >
                <AttachFileIcon className={classes.sendMessageIcons} />
              </IconButton>
            </label>
            <FormControlLabel
              style={{ marginRight: 7, color: "gray" }}
              label={i18n.t("messagesInput.signMessage")}
              labelPlacement="start"
              control={
                <Switch
                  size="small"
                  checked={signMessage}
                  onChange={(e) => {
                    setSignMessage(e.target.checked);
                  }}
                  name="showAllTickets"
                  color="primary"
                />
              }
            />
          </Hidden>
          <Hidden only={["md", "lg", "xl"]}>
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
                  component="span"
                  disabled={loading || recording}
                  onClick={(e) => setShowEmoji((prevState) => !prevState)}
                >
                  <MoodIcon className={classes.sendMessageIcons} />
                </IconButton>
              </MenuItem>
              <MenuItem onClick={handleMenuItemClick}>
                <input
                  type="file"
                  id="upload-button"
                  disabled={loading || recording}
                  className={classes.uploadInput}
                  onChange={handleChangeMedias}
                />
                <label htmlFor="upload-button">
                  <IconButton
                    aria-label="upload"
                    component="span"
                    disabled={loading || recording}
                  >
                    <AttachFileIcon className={classes.sendMessageIcons} />
                  </IconButton>
                </label>
              </MenuItem>
              <MenuItem onClick={handleMenuItemClick}>
                <FormControlLabel
                  style={{ marginRight: 7, color: "gray" }}
                  label={i18n.t("messagesInput.signMessage")}
                  labelPlacement="start"
                  control={
                    <Switch
                      size="small"
                      checked={signMessage}
                      onChange={(e) => {
                        setSignMessage(e.target.checked);
                      }}
                      name="showAllTickets"
                      color="primary"
                    />
                  }
                />
              </MenuItem>
            </Menu>
          </Hidden>
          <div className={classes.messageInputWrapper}>
            <InputBase
              inputRef={(input) => input && (inputRef.current = input)}
              className={classes.messageInput}
              placeholder={i18n.t("messagesInput.placeholderOpen")}
              multiline
              maxRows={5}
              value={inputMessage}
              onChange={handleChangeInput}
              disabled={recording || loading}
              onPaste={(e) => handleInputPaste(e)}
              onKeyUp={(e) => {
								setCursorPosition(e.target.selectionEnd)
                if (loading || e.shiftKey) return;
              }}
							onClick={(e) => {
								setCursorPosition(e.target.selectionEnd);
							}}
            />
            <QuickAnswerSelect
              handleClick={handleQuickAnswersClick}
              searchParam={inputMessage.substring(1)}
              isOpen={typeBar}
              height="240px"
            />
          </div>
          {inputMessage ? (
            <></>
          ) : recording || Boolean(audio) ? (
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

              {loading ? <></> : <RecordingTimer paused={Boolean(audio)} />}

              <IconButton
                aria-label="sendRecordedAudio"
                component="span"
                onClick={handleAudioBlob}
                disabled={loading || Boolean(audio)}
              >
                <PauseCircleOutline
                  disabled={loading || Boolean(audio)}
                  className={classes.sendAudioIcon}
                />
              </IconButton>
            </div>
          ) : (
            <IconButton
              aria-label="showRecorder"
              component="span"
              disabled={
                loading ||
                !selectedContacts.length ||
                !selectedConnection ||
                !selectedQueue ||
                !selectedUser
              }
              onClick={handleStartRecording}
            >
              <MicIcon
                disabled={
                  !selectedContacts.length ||
                  !selectedConnection ||
                  !selectedQueue ||
                  !selectedUser
                }
                className={classes.sendMessageIcons}
              />
            </IconButton>
          )}
        </div>
      </Paper>
    ),
    [
      showEmoji,
      loading,
      recording,
      typeBar,
      handleSendMessage,
      classes,
      anchorEl,
      handleChangeInput,
      inputMessage,
      selectedContacts,
      setSignMessage,
      signMessage,
      audio,
      handleAudioBlob,
      handleQuickAnswersClick,
      selectedQueue,
      selectedUser,
      selectedConnection,
    ]
  );

  return (
    <>
      <DialogContent dividers className={classes.schedulePickerWrapper}>
        <DefaultWildCardsDisplay />

        <ToggleButtonGroup
          value={channel}
          exclusive
          className={classes.toggleButtons}
          onChange={handleChannel}
          aria-label="schedule connection"
        >
          <ToggleButton value="whatsapp" aria-label="whatsapp connection">
            <WhatsAppIcon />
          </ToggleButton>
          <ToggleButton value="facebook" aria-label="facebook connection">
            <FacebookIcon />
          </ToggleButton>
          <ToggleButton value="instagram" aria-label="instagram connection">
            <InstagramIcon />
          </ToggleButton>
        </ToggleButtonGroup>

        <div className={classes.dateTimeWrapper}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={day.format("YYYY-MM-DD")}
          />

          <input
            type="time"
            value={time}
            onChange={handleSetTime}
            min={
              date === day.format("YYYY-MM-DD")
                ? dayjs().format("HH:mm")
                : undefined
            }
          />
        </div>

        <ContactSelect
          channel={channel}
          selectedContacts={selectedContacts}
          onChange={handleContactChange}
        />

        <Select
          fullWidth
          displayEmpty
          variant="outlined"
          value={selectedUser}
          onChange={(e) => {
            setSelectedUser(e.target.value);
            setSelectedQueue("");
            setSelectedConnection("");
          }}
          MenuProps={selectMenuProps}
          renderValue={() => {
            if (selectedUser === "") {
              return (
                <span style={{ color: "rgba(0, 0, 0, 0.54)" }}>
                  Selecione um usuário
                </span>
              );
            }
            const user = users?.find((u) => u.id === selectedUser);
            return user?.name;
          }}
        >
          <MenuItem dense value="">
            <ListItemText primary={"Sem usuário"} />
          </MenuItem>
          {users?.map((user, key) => (
            <MenuItem dense key={key} value={user.id}>
              <ListItemText primary={user?.name} />
            </MenuItem>
          ))}
          {users?.length === 0 && (
            <MenuItem dense disabled>
              <ListItemText primary={"Houve um erro ao buscar usuários"} />
            </MenuItem>
          )}
        </Select>

        <SelectConnection
          channel={channel}
          selectedConnection={selectedConnection}
          setSelectedConnection={setSelectedConnection}
          selectedUser={selectedUser}
        />

        <Select
          fullWidth
          displayEmpty
          variant="outlined"
          value={selectedQueue}
          onChange={(e) => setSelectedQueue(e.target.value)}
          MenuProps={selectMenuProps}
          renderValue={() => {
            if (selectedQueue === "") {
              return (
                <span style={{ color: "rgba(0, 0, 0, 0.54)" }}>
                  Selecione um setor
                </span>
              );
            }
            const queue = user.queues?.find((q) => q.id === selectedQueue);
            return queue?.name;
          }}
        >
          <MenuItem dense value="">
            <ListItemText primary={"Sem setor"} />
          </MenuItem>
          {userQueues?.map((queue, key) => (
            <MenuItem dense key={key} value={queue.id}>
              <ListItemText primary={queue.name} />
            </MenuItem>
          ))}
          {userQueues?.length === 0 && (
            <MenuItem dense disabled>
              <ListItemText primary={"Nenhum setor atribuído ao atendente"} />
            </MenuItem>
          )}
        </Select>

        <FormControlLabel
          style={{ alignSelf: "start" }}
          control={
            <Switch
              name="createTicket"
              checked={createTicket}
              onChange={(e) => setCreateTicket(e.target.checked)}
              inputProps={{ "aria-label": "controlled" }}
            />
          }
          label="Criar Ticket"
        />
        {isMedia || (isAudio && !recording) ? mediaRender : inputRender}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCloseModal} color="secondary" variant="outlined">
          {i18n.t("scheduleModal.buttons.cancel")}
        </Button>

        <Button
          type="button"
          color="primary"
          onClick={handleScheduleAction}
          disabled={
            loading ||
            !selectedContacts.length ||
            !hasContent ||
            !selectedConnection ||
            !selectedQueue ||
            !selectedUser
          }
          variant="contained"
        >
          {i18n.t(`scheduleModal.buttons.${translatedButtonMessage}`)}
          {loading && (
            <CircularProgress size={24} className={classes.circleLoading} />
          )}
        </Button>
      </DialogActions>
    </>
  );
}

export default ScheduleInput;
