import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  alert: {
    alignItems: "center",
    position: "fixed",
    width: "100%",
    zIndex: 9999999,
    borderRadius: 0,

    "& .MuiAlert-message": {
      display: "flex",
      alignItems: "center",
      width: "100%",
    },
  },
  button: {
    padding: "2px",
    marginLeft: "1em",
  },
  customerList: {
    position: "absolute",
    zIndex: 999999,
    left: 0,
    bottom: 0,
    width: "max-content",
    background: "#000000",
    color: "white",
    borderRadius: "0 8px 0 0",
    overflowY: "scroll",
    maxHeight: "50vh",
    ...theme.scrollbarStyles
  },
  customerAvatar: {
    backgroundColor: "white",
  },
  customerText: {
    color: "white",
    "& p": {
      color: "#FFFFFF99"
    }
  },
}))
