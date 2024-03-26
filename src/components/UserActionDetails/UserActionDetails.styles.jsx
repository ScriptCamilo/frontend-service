import { grey } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((_theme) => ({
  small: {
    fontSize: "12px",
    margin: "0",
  },
  paperContainer: {
    backgroundColor: grey[300],
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    margin: "0 auto",
    padding: "8px 16px",
    width: "360px",
  },
  paperContent: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    margin: "8px auto",
  },
  footer: {
    alignSelf: "flex-end",
    fontSize: "12px",
    margin: "0",
  },
}));
