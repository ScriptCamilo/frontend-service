import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  messageQuickAnswersWrapper: {
    ...theme.scrollbarStyles,
    overflowY: "scroll",
    maxHeight: "560px",
    margin: 0,
    position: "absolute",
    bottom: "50px",
    background: "#ffffff",
    padding: "2px",
    border: "1px solid #CCC",
    left: 0,
    width: "100%",
    zIndex: 9999,
    "& li": {
      display: "flex",
      alignItems: "center",
      listStyle: "none",
      cursor: "pointer",
      "&:hover": {
        background: "#F1F1F1",
      },
      "& a": {
        display: "block",
        padding: "8px",
        textOverflow: "ellipsis",
        overflow: "hidden",
        maxHeight: "32px",
        width: "100%",
      },
    },
    '& li:last-child[data-loading="true"]': {
      justifyContent: "center",
      padding: "8px",
      cursor: "unset",
      "&:hover": {
        background: "unset",
      },
    },
  },
}))
