import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  label: {
    marginRight: "4px",
  },
  paperContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1em",
    margin: "0 auto 16px",
    padding: "16px",
    width: "80%",
  },
  title: {
    margin: "0",
  },
  wildCardsContainer: {
    display: "flex",
    justifyContent: "space-around",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
}));
