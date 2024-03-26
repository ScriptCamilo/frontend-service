import { makeStyles } from "@material-ui/core";
import { green, red } from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
  ticketUserName: {
    color: "rgb(104, 121, 146)",
    position: "absolute",
    bottom: "18px",
    right: -20,
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
    width: "25%",
    textAlign: "end",
    paddingRight: "28px",
    fontSize: "0.8em",
    // fontWeight: "900",
  },

  ticket: {
    backgroundColor: "#fff",
    width: "98%",
    height: "80px",
    margin: "auto",
    marginTop: "5px",
    position: "relative",
    // paddingBottom: "20px",
    borderRadius: "4px",
    boxShadow: "0px 0px 2px 0px rgba(0,0,0,0.3)",
    overflow: "hidden",
  },

  pendingTicket: {
    cursor: "unset",
  },

  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
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

  contactNameWrapper: {
    marginLeft: 10,
    display: "flex",
    justifyContent: "space-between",
  },

  lastMessageTime: {
    justifySelf: "flex-end",
    marginRight: -4,
    fontSize: "0.8em",
  },

  closedBadge: {
    alignSelf: "center",
    justifySelf: "flex-end",
    marginRight: 40,
    marginLeft: "auto",
  },

  contactLastMessage: {
    paddingRight: 20,
    paddingBottom: 30,
    width: "80%",
    fontSize: "0.9em",
  },

  newMessagesCount: {
    position: "absolute",
    marginLeft: -10,
    marginTop: -13,
    fontSize: "1em",
    padding: 0,
    // alignSelf: "center",
    // marginRight: 8,
    // marginLeft: "auto",
  },

  badgeStyle: {
    color: "white",
    backgroundColor: red[500],
    fontSize: "0.8em",
    padding: 10,
    margin: 0,
    minWidth: "0px",
    width: "15px",
    height: "15px",

    "&:before": {
      content: '""',
      position: "absolute",
      width: 15,
      height: 15,
      padding: 10,
      top: "0",
      left: "0",
      // transform: "translate(-50%, -50%)",
      borderRadius: "50%",
      backgroundColor: red[500],
      opacity: 0,
      animation: "$rippleEffect 1s linear infinite",
    },
  },

  "@keyframes rippleEffect": {
    "0%": {
      opacity: 0.5,
    },
    "100%": {
      opacity: 0,
      transform: "scale(2)",
    },
  },

  markedAsReadStyle: {
    alignSelf: "center",
    backgroundColor: red[500],
    color: green[500],
    marginTop: -63,
    marginRight: -42,
  },

  acceptButton: {
    position: "absolute",
    left: "50%",
    // width: "100%",
    // height: "100%",
    zIndex: 1,
    // opacity: 0,
  },

  ticketQueueColor: {
    flex: "none",
    width: "8px",
    height: "100%",
    position: "absolute",
    top: "0%",
    left: "0%",
  },

  userTag: {
    position: "absolute",
    marginRight: 5,
    right: 5,
    bottom: 5,
    background: "#2576D2",
    color: "#ffffff",
    border: "1px solid #CCC",
    padding: 1,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 10,
    fontSize: "0.9em",
  },

  userTagFacebook: {
    position: "absolute",
    marginRight: 5,
    right: 5,
    bottom: 5,
    background: "#2576D2",
    color: "#ffffff",
    border: "1px solid #CCC",
    padding: 1,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 10,
    fontSize: "0.9em",
  },

  userTagWhatsapp: {
    position: "absolute",
    marginRight: 5,
    right: 5,
    bottom: 5,
    background: "#25D366",
    color: "#ffffff",
    border: "1px solid #CCC",
    padding: 1,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 10,
    fontSize: "0.9em",
  },

  userTagInstagram: {
    position: "absolute",
    marginRight: 5,
    right: 5,
    bottom: 5,
    background: "#E1306C",
    color: "#ffffff",
    border: "1px solid #CCC",
    padding: 1,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 10,
    fontSize: "0.9em",
  },

  userTagsContainer: {
    position: "absolute",
    display: "flex",
    gap: "2px",
    bottom: 12,
    left: 85,
    width: "60%",
    heigth: "20px",
    alignItems: "center",
    overflow: "hidden",
  },

  userTags: {
    color: "#ffffff",
    padding: 0.3,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
    fontSize: "0.7em",
    fontWeight: "900",
    textShadow: "0 0 2px rgba(0, 0, 0, 0.8)",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    maxWidth: "100px",
  },

	sizeIcons: {
		width: 20, 
		height: 20
	},

	divLastMessage: {
		display: "flex",
		columnGap: '5px',
	}
}));

export default useStyles;
