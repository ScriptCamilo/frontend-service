import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    alignItems: "center",
    width: 300,
  },

  contactCard: {
    position: "relative",
    margin: "1em 0.5em 0 0.5em",
    alignItems: "center",
    display: "flex",
    boxShadow: "0 0px 8px 2px rgba(0, 0, 0, 0.2)",
  },

  details: {
    width: "60%",
    display: "flex",
    flexDirection: "column",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    flex: "1 0 auto",
    overflow: "hidden",
  },
  cover: {
    height: 150,
    width: 150,
    objectFit: "cover",
    boxShadow: "-1px 0px 13px 7px rgba(0, 0, 0, 0.4)",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },

  drawer: {
    width: "400px",
    flexShrink: 0,
  },

  ticketsView: {
    overflowY: "scroll",
    maxHeight: "300px",
  },

  drawerPaper: {
    width: "400px",
    display: "flex",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
    borderRight: "1px solid rgba(0, 0, 0, 0.12)",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    [theme.breakpoints.down("xs")]: {
      width: "100%",
    },
    // backgroundColor: "#f5f5f5",
  },
  header: {
    display: "flex",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    backgroundColor: "#eee",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    minHeight: "73px",
    justifyContent: "flex-start",
    [theme.breakpoints.down("xs")]: {
      position: "fixed",
      zIndex: 100,
      width: "100%",
    },
  },
  content: {
    // backgroundColor: "#eee",
    backgroundColor: "#f5f5f5",
    minHeight: "110vh",
    [theme.breakpoints.down("xs")]: {
      marginTop: "100px",
    },
  },

  contactDetails: {
    backgroundColor: "#f5f5f5",
    // marginTop: 8,
    padding: 8,
    display: "flex",
    flexDirection: "column",
    marginBottom: "10em",
    paddingBottom: "10em",
  },

  actionsDiv: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    margin: 0,
    padding: "0.3em",
    border: "1px solid rgba(0, 0, 0, 0.12)",
    borderRadius: "5px",
    backgroundColor: "#fff",
    height: "500px",
    overflowY: "scroll",
  },

  actionsBox: {
    width: "100%",
    // marginTop: "2em",
    display: "flex",
    flexDirection: "column",
  },

  actionArea: {
    backgroundColor: "#eee",
    padding: "0.6em 1em",
    borderRadius: "5px",
    boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.3)",
    marginBottom: "0.7rem"
  },

  ticketHistoryTitle: {
    fontWeight: 600,
    textTransform: "uppercase",
    textAlign: "center",
  },

  actionTicket: {
    fontSize: "0.7rem",
    color: "grey",
    border: "none",
    margin: 0,
    padding: 0,
  },

  actionAct: {
    fontSize: "0.8rem",
    border: "none",
    margin: 0,
    padding: 0,
  },

  actionDate: {
    marginTop: "1em",
    color: "grey",
    fontSize: "0.7rem",
    border: "none",
    margin: 0,
    padding: 0,
  },

  actionFooter: {
    display: "flex",
    justifyContent: "space-between",
  },

  bottomNav: {
    width: "400px",
    height: "80px",
    bottom: 0,
    position: "fixed",
    padding: "15px",
    boxShadow: "0px -2px 4px -1px rgba(0,0,0,0.2)",
  },

  extraInfoBlock: {
    display: "flex",
    flexDirection: "column",
  },

  extraInfoName: {
    fontWeight: 600,
  },

  extraInfoDivider: {
    marginBottom: "1em",
    marginTop: "1em",
  },
}));
