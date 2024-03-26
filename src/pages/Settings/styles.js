import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(8, 8, 3),
  },

  container: {
    display: "flex",
    flexDirection: "column",
  },

  paper: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
  },

  settingOption: {
    marginLeft: "auto",
  },

  margin: {
    margin: theme.spacing(1),
  },

  textArea: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    marginBottom: 12,
    justifyContent: "space-between",
  },
}));
