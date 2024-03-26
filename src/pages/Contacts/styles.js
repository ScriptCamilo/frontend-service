import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },

  mainContainer: {
    // overflow: "hidden",
    backgroundColor: "red",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  mainHeader: {
    backgroundColor: "red",
  },
  tableCell: {
    paddingRight: 0,
    width: "50px",
    display: "flex",
    marginRight: "30px",
    alignItems: "center",
  },

  activeContact: {
    marginBottom: "100px",
  },

  disabled: {
    backgroundColor: "rgba(0, 0, 0, 0.12)",
    pointerEvents: "none",
  },
}));
