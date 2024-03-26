import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";

import whatsBackground from "../../assets/wa-background.png";

export const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    // background: "#eee",
    backgroundImage: `url(${whatsBackground})`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    // borderTop: "1px solid rgba(0, 0, 0, 0.12)",
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      bottom: 0,
      paddingBottom: 40,
      width: "100%",
    },
  },

  avatar: {
    width: "30px",
    height: "30px",
    borderRadius: "25%",
  },

  dropInfo: {
    background: "#eee",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    padding: 15,
    left: 0,
    right: 0,
  },

  downloadMedia: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "inherit",
    padding: 10,
  },

  dropInfoOut: {
    display: "none",
  },

  gridFiles: {
    maxHeight: "100%",
    overflow: "scroll",
  },

  inputContainer: {
    border: "1px solid #ccc",
    borderRadius: 10,
    width: "96%",
    padding: 10,
    height: 90,
  },

  newMessageBox: {
    // background: "#eee",
    width: "100%",
    display: "flex",
    padding: "7px",
    alignItems: "center",
    [theme.breakpoints.down("xs")]: {
      marginBottom: "20px",
    },
  },

  messageInputWrapper: {
    padding: 6,
    marginRight: 7,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    display: "flex",
    borderRadius: 20,
    flex: 1,
    position: "relative",
  },

  commentInputWrapper: {
    padding: 6,
    marginRight: 7,
    backgroundColor: "#f8f27c",
    display: "flex",
    // flexDirection: "column",
    borderRadius: 20,
    flex: 1,
    position: "relative",

    // transition for background white to yellow

    transition: "background-color 0.5s ease-in-out",
  },

  inputText: {
    width: "10%",
  },

  inputOptions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  messageInput: {
    paddingLeft: 10,
    flex: 1,
    border: "none",
  },

  sendMessageIcons: {
    color: "grey",
  },

  messageOptions: {
    // if screen is mobile
    display: "flex",
    flexDirection: "column",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  activatedButton: {
    borderRadius: "50px",
    padding: "1px 0px",
    fontSize: "0.6rem",
    backgroundColor: "#42722c",
    color: "white",
    minWidth: 0,
    width: 70,
    border: 0,
  },

  deactivatedButton: {
    backgroundColor: "#fff",
    borderRadius: "50px",
    padding: "1px 0px",
    fontSize: "0.6rem",
    // backgroundColor: "#42722c",
    color: "#42722c",
    minWidth: 0,
    width: 70,
    border: 0,
  },

  initAudioIcon: {
    color: "white",
    backgroundColor: "#42722c",
    borderRadius: "50%",
    border: "2px solid #42722c",
    outline: "8px solid #42722c",
    boxShadow: "0 0 0 5px #42722c",
  },

  uploadInput: {
    display: "none",
  },

  viewMediaInputWrapper: {
    maxHeight: "80%",
    display: "flex",
    padding: "10px 13px",
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eee",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  },

  emojiBox: {
    position: "absolute",
    bottom: 63,
    width: 40,
    borderTop: "1px solid #e8e8e8",
  },

  emojiBoxMobile: {
    position: "absolute",
    bottom: 100,
    borderTop: "1px solid #e8e8e8",
    zIndex: 9999,
  },

  menuItemIconButton: {
    display: "flex",
    justifyContent: "flex-start",
    width: "100%",
    borderRadius: 0,
  },

  circleLoading: {
    color: green[500],
    opacity: "70%",
    position: "absolute",
    top: "20%",
    left: "50%",
    marginLeft: -12,
  },

  audioLoading: {
    color: green[500],
    opacity: "70%",
  },

  recorderWrapper: {
    display: "flex",
    alignItems: "center",
    alignContent: "middle",
    zIndex: 999999,
    backgroundColor: "#FFFFFF99",
  },

  recorderOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "#00000099",
    zIndex: 99999,
    backdropFilter: "blur(0.6px)",
  },

  cancelAudioIcon: {
    color: "red",
  },

  sendAudioIcon: {
    color: "green",
  },

  replyingMsgWrapper: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingLeft: 73,
    paddingRight: 7,
  },

  replyingMsgContainer: {
    flex: 1,
    marginRight: 5,
    overflowY: "hidden",
    // backgroundColor: "rgba(0, 0, 0, 0.05)",
    backgroundColor: "#e2e2e2",
    boxShadow: "0 0 3px 3px rgba(0, 0, 0, 0.06)",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },

  replyingMsgBody: {
    padding: 10,
    maxHeight: "200px",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },

  replyingContactMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },

  replyingSelfMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },

  messageContactName: {
    display: "flex",
    color: "#6bcbef",
    fontWeight: 500,
  },

  iconsWrapper: {
    display: "flex",
    alignItems: "center",
    paddingRight: "4px",
  },
  customToast: {
    color: "black",
    fontWeight: "bold",
  },
}));
