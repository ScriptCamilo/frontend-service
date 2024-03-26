import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
	maxWidth: {
		width: "100%",
	},
	disparadorContentWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
	dateTimeWrapper: {
    display: "flex",
		alignItems: "center",
    gap: "12px",
  },
	lastSchedule: {
		display: "flex",
		flexDirection: "column",
		gap: "8px",
	},
	status: {
		display: "flex",
		textAlign: "center",
		lineHeight: "1.5"
	},
}));
