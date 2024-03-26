import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles({
  typography: {
    width: "200px",
    height: "200px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  linearProgress: {
    width: "100%",
    height: "10px",
    borderRadius: "5px",
  },
	messageInput: {
		paddingLeft: 10,
		flex: 1,
		border: "1px solid #ddd",
		width: "500px",
		height: "100px",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	emojiBox: {
    position: "absolute",
    bottom: 63,
    width: 40,
    borderTop: "1px solid #e8e8e8",
		zIndex: 9999,
  },
});
