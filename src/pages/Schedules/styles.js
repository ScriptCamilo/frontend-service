import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    maxHeight: "94vh",
    ...theme.scrollbarStyles,
  },
  status_sent: {
    color: "#00B050 !important",
  },
  status_error: {
    color: "#FF0000 !important",
  },
  icons: {
    color: "rgba(0, 0, 0, 0.54)",
  },
}));
