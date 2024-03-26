import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  box: {
    position: "fixed",
    width: "100vw",
    height: "100vh",
    zIndex: 9999999,
    // glass blur
    background: "#00000033",
    backdropFilter: "blur(5px)",
  },
  customerList: {
    width: "max-content",
    background: "#00000099",
    color: "white",
    borderRadius: "0 0 8px 0",
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
  paper: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    padding: "1em 3em",
    width: "80%",
    maxWidth: "600px",
    textAlign: "center",
    alignItems: "center",
  },
  typography: {
    fontWeight: "bold",
    marginBottom: "0.5em",
    textTransform: "uppercase",
  },
  closeIcon: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  button: {
    marginTop: "1em",
    width: "50%",
  },
  youtubeVideo: {
    height: "315px",
    width: "100%",
    maxWidth: "560px",
  }
}))
