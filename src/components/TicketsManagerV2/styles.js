import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  tabsHeader: {
    flex: "none",
    backgroundColor: "#eee",
  },

  settingsIcon: {
    alignSelf: "center",
    marginLeft: "auto",
    padding: 8,
  },

  tab: {
    minWidth: 120,
    width: 120,
  },

  unreadsTab: {
    maxWidth: 60,
    minWidth: 60,
    width: 60,
  },

  subTab: {
    fontSize: "0.8rem",
    minWidth: 100,
    width: 100,
  },

  tabSearchButton: {
    position: "absolute",
    right: -20,
    width: "1.5em",
    height: "1.5em",
    // left: 38,
    top: -3,
    // marginLeft: 3,
  },

  tabSearchIcon: {
    fontSize: "1em",
    opacity: 0.8,
  },

  popper: {
    backgroundColor: "#fafafa",
    height: "530px",
    width: "300px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    // borderRadius: "0 20px 20px 0",
    borderRadius: "20px",
    marginLeft: "35.8%",
    // marginTop: "-4.5vh",
    boxShadow: "0px 0px 5px 5px rgba(0,0,0,0.1)",
  },

  popperClosed: {
    backgroundColor: "#fafafa",
    height: "530px",
    width: "300px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    // borderRadius: "0 20px 20px 0",
    borderRadius: "20px",
    marginLeft: "-64%",
    marginTop: "13vh",
    boxShadow: "0px 0px 5px 5px rgba(0,0,0,0.1)",
  },

  popperBox: {
    height: "490px",
    width: "300px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    // borderRadius: "0 20px 20px 0",
    borderRadius: "20px",
  },

  ticketOptionsBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fafafa",
    padding: theme.spacing(1),
    boxShadow: "0px 0px 5px 5px rgba(0,0,0,0.1)",
  },

  serachInputWrapper: {
    flex: 1,
    background: "#fff",
    display: "flex",
    borderRadius: 40,
    padding: 4,
    marginRight: theme.spacing(1),
  },

  searchIcon: {
    color: "grey",
    marginLeft: 6,
    marginRight: 6,
    alignSelf: "center",
  },

  searchInput: {
    flex: 1,
    border: "none",
  },

  subTabSearchInput: {
    marginLeft: 6,
    paddingLeft: 8,
    flex: 1,
    border: "1px solid #ccc",
    borderRadius: 6,
    width: "100%",
    height: "2.3em",
    marginTop: "3em",
  },

  searchContainedButton: {
    borderRadius: "0 0 10px 10px",
  },

  badge: {
    // paddingRight: 0,

    "& .MuiBadge-badge": {
      position: "absolute",
      right: 23,
      top: 0,
    },
  },
}));
