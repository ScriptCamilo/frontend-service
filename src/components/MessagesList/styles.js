import { makeStyles } from "@material-ui/core";
import { blue } from "@material-ui/core/colors";
import whatsBackground from "../../assets/wa-background.png";

export const useStyles = makeStyles((theme) => ({
  resendBtn: {
    position: "absolute",
    bottom: "20px",
    right: "6px",
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
  scrollButton: {
    position: "fixed",
    bottom: 80,
    right: 10,
    zIndex: 1000,
    width: 45,
    height: 45,
    borderRadius: 99999,
    border: "none",
    background: "#fff",
    cursor: "pointer",
    display: "none",
    transition: "0.5s ease",
    "&:hover": {
      background: "#f0f0f0",
    },
    "@media (max-width: 768px)": {
      bottom: 150,
      right: 10,
    },
  },
  scrollButtonModalOpen: {
    bottom: 80,
    right: 415,

    "@media (max-width: 915px)": {
      display: "none",
    },
  },
  scrollButtonVisible: {
    display: "block",
  },
  signature: {
    fontSize: "0.7em",
    margin: "0",
    color: "red",
  },
  messageCenter: {
    marginTop: 5,
    alignItems: "center",
    verticalAlign: "center",
    alignContent: "center",
    backgroundColor: "#E1F5FEEB",
    fontSize: "12px",
    minWidth: 100,
    maxWidth: 270,
    color: "#272727",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 0,
    boxShadow: "0 1px 1px #b3b3b3",
  },
  messagesListWrapper: {
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    ticketNunber: {
      color: "#808888",
      padding: 8,
    },

    //if mobile
    [theme.breakpoints.down("xs")]: {
      paddingBottom: 40,
      marginBottom: "30px",
    },
  },

  messagesList: {
    backgroundImage: `url(${whatsBackground})`,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    padding: "20px 20px 20px 20px",
    overflowY: "scroll",
    [theme.breakpoints.down("sm")]: {
      paddingBottom: "90px",
    },
    ...theme.scrollbarStyles,
  },

  circleLoading: {
    color: blue[500],
    position: "absolute",
    opacity: "70%",
    top: 0,
    left: "50%",
    marginTop: 12,
  },

  messageLeft: {
    marginRight: 20,
    marginTop: 5,
    minWidth: 50,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },

    whiteSpace: "pre-wrap",
    backgroundColor: "#ffffff",
    color: "#303030",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    boxShadow: "0 1px 1px #b3b3b3",
  },

  quotedContainerLeft: {
    margin: "-3px -80px 6px -6px",
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
    width: "100%",
  },

  quotedMsg: {
    padding: 10,
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },

  quotedSideColorLeft: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },

  messageRight: {
    marginLeft: 20,
    marginTop: 5,
    minWidth: 50,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },

    whiteSpace: "pre-wrap",
    backgroundColor: "#dcf8c6",
    color: "#303030",
    alignSelf: "flex-end",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    boxShadow: "0 1px 1px #b3b3b3",
  },

  isDelMsg: {
    backgroundColor: "#ccc",
  },

  noteContainer: {
    margin: "10px auto",
    width: "80%",
    position: "relative",
    padding: "15px",
    backgroundColor: "#eeeeeee0",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
    borderRadius: "10px",
  },

  noteHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontWeight: "bold",
  },

  noteText: {
    marginBottom: "10px",
    whiteSpace: "pre-wrap",
    width: "auto",
    lineBreak: "anywhere",
  },

  noteFooter: {
    display: "flex",
    justifyContent: "flex-end",
    color: "#000",
    fontSize: "0.8rem",
  },

  noteDeleteIcon: {
    color: "red",
  },

  quotedContainerRight: {
    margin: "-3px -80px 6px -6px",
    overflowY: "hidden",
    backgroundColor: "#cfe9ba",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
    width: "100%",
  },

  quotedMsgRight: {
    padding: 10,
    maxWidth: 300,
    height: "auto",
    whiteSpace: "pre-wrap",
  },

  quotedSideColorRight: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },

  messageActionsButton: {
    display: "none",
    position: "relative",
    color: "#999",
    zIndex: 1,
    backgroundColor: "inherit",
    opacity: "90%",
    "&:hover, &.Mui-focusVisible": { backgroundColor: "inherit" },
  },

  messageContactName: {
    display: "flex",
    color: "#6bcbef",
    fontWeight: 500,
  },

  textContentItem: {
    overflowWrap: "break-word",
    padding: "5px 0px 20px 0px",
    minWidth: 150,
  },

  textContentItemDeleted: {
    fontStyle: "italic",
    color: "rgba(0, 0, 0, 0.36)",
    overflowWrap: "break-word",
    padding: "3px 80px 6px 6px",
  },

  messageMedia: {
    objectFit: "contain",
    width: 250,
    height: 200,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },

  timestamp: {
    fontSize: 11,
    position: "absolute",
    bottom: 0,
    right: 5,
    color: "#999",
  },

  dailyTimestamp: {
    alignItems: "center",
    textAlign: "center",
    alignSelf: "center",
    width: "110px",
    backgroundColor: "#e1f3fb",
    margin: "10px",
    borderRadius: "10px",
    boxShadow: "0 1px 1px #b3b3b3",
  },

  dailyTimestampText: {
    color: "#808888",
    padding: 8,
    alignSelf: "center",
    marginLeft: "0px",
  },

  ackIcons: {
    fontSize: 18,
    verticalAlign: "middle",
    marginLeft: 4,
  },

  deletedIcon: {
    fontSize: 18,
    verticalAlign: "middle",
    marginRight: 4,
  },

  ackDoneAllIcon: {
    color: blue[500],
    fontSize: 18,
    verticalAlign: "middle",
    marginLeft: 4,
  },

  downloadMedia: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "inherit",
    padding: 10,
  },
  linkContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
    height: "90px",
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
  linkMain: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: "7.5px",
    textDecoration: "none",
    border: "1px solid #e0e0e0",
  },
  linkImage: {
    width: "90px",
    height: "90px",
    objectFit: "cover",
  },
  linkTitle: {
    color: "#000",
    fontWeight: 900,
    fontSize: "12px",
    margin: "0px 0px 5px 0px",
    overflow: "visible",
  },
  linkDescription: {
    color: "#999",
    fontSize: "10px",
    margin: "0px 0px 5px 0px",
    overflow: "hidden",
  },
  comment: {
    margin: "1px auto",
    width: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#eeeeee88",
    padding: "16px 16px 16px 16px",
    borderRadius: "5px",
    boxShadow: "0 0 5px 0px rgb(0, 0, 0, 0.1)",
		marginBottom: "10px",
  },
}));
