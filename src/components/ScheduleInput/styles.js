import { green } from "@material-ui/core/colors";
import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    background: "#eee",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
    overflow: "visible",
  },

  newMessageBox: {
    background: "#eee",
    width: "100%",
    display: "flex",
    padding: "7px",
    alignItems: "center",
  },

  messageInputWrapper: {
    padding: 6,
    marginRight: 7,
    background: "#fff",
    display: "flex",
    borderRadius: 20,
    flex: 1,
    position: "relative",
  },

  messageInput: {
    paddingLeft: 10,
    flex: 1,
    border: "none",
  },

  sendMessageIcons: {
    color: "gray",
    '&[disabled]': {
      opacity: 0.3,
    },
  },

  uploadInput: {
    display: "none",
  },

  viewMediaInputWrapper: {
    display: "flex",
    padding: "10px 13px",
    position: "relative",
    alignItems: "center",
    backgroundColor: "#ddd",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  },

  emojiBox: {
    position: "absolute",
    bottom: 124,
    zIndex: 9999,
    width: "max-content",
    height: "max-content"
  },

  circleLoading: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },

  sendAudioIcon: {
    color: "green",
    '&[disabled]': {
      color: "gray",
      opacity: 0.3,
    },
  },

  recorderWrapper: {
    display: "flex",
    alignItems: "center",
    alignContent: "middle",
  },

  cancelAudioIcon: {
    color: "red",
  },

  schedulePickerWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  dateTimeWrapper: {
    display: "flex",
    gap: "12px",
  },

  toggleButtons: {
    justifyContent: "center",
  }
}));
