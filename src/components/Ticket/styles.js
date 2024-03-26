import { makeStyles } from "@material-ui/core/styles";

const drawerWidth = 400;

export const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "100%",
    position: "relative",
    overflow: "hidden",
  },

  ticketInfo: {
    maxWidth: "50%",
    flexBasis: "50%",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "80%",
      flexBasis: "80%",
			height: "100px",
			overflow: "scroll",
			marginLeft: "-4%"
    },
  },
  ticketActionButtons: {
    maxWidth: "50%",
    flexBasis: "50%",
    display: "flex",
    [theme.breakpoints.down("sm")]: {
			justifyContent: "flex-end",
			flexDirection: "column",
			width: "auto",
			flexBasis: "0%"
    },
  },

  mainWrapper: {
    flex: 1,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderLeft: "0",
    marginRight: -drawerWidth,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },

  mainWrapperShift: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  },

  userTagsContainer: {
    position: "absolute",
    display: "flex",
    gap: "2px",
    top: 76,
    padding: "2px",
    // width: "80%",
    flexWrap: "wrap",
    // heigth: "10px",
    // overflow: "scroll",
    zIndex: "5",
    [theme.breakpoints.down("sm")]: {
      position: "absolute",
      top: 100,
      left: 0,
    },
  },

  userTags: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    padding: 0.3,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
    fontSize: "0.9em",
    fontWeight: "900",
    textShadow: "0 0 2px rgba(0, 0, 0, 0.7)",
    cursor: "pointer",
    boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)",
  },

  addTagButton: {
    marginLeft: "0.5em",
    fontSize: "1.1em",
    width: "20px",
    height: "20px",
    fontWeight: 900,
    border: "none",
    backgroundColor: "white",
    boxShadow: "0 0 3px 2px rgba(0, 0, 0, 0.2)",
    borderRadius: "9999px",
    cursor: "pointer",
    padding: "0px",
		boxSizing: "border-box",
  },

  tagsDropdown: {
    height: "80vh",
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    borderRadius: "5px",
    overflowY: "auto",
    gap: "1px",
    [theme.breakpoints.down("xs")]: {
			height: "50vh",
			left: '50%',
		}
  },

  buttonDropdown: {
    padding: "0.5em 1em",
    border: "none",
    color: "#ffffff",
    textShadow: "0 0 2px black",
    fontSize: "0.7em",
    fontWeight: "900",
    cursor: "pointer",
  },
  copy: {
    fontSize: "0.8em",
    position: "relative",
    top: 10,
    right: 120,
    zIndex: 10,
    width: "100%",
  },
}));
