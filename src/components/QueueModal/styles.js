import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

export const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
    width: "40%",

    '&[data-disabled="true"]': {
      opacity: 0.5,
    },
  },
  nameField: {
    marginRight: theme.spacing(1),
    flex: 1,
    width: "15%",
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  colorAdorment: {
    width: 15,
    height: 20,
  },
  formHours: {
    width: "110px",
    marginRight: "10px",
  },
  autoFinishWrapper: {
    display: "flex",
    flexDirection: "column",
  }
}));
