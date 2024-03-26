import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "1em",
  },
  applyButton: {
		marginTop: "1em",
		[theme.breakpoints.down('xs')]: {
			display: 'flex',
			justifyContent: "center",
			alignItems: "center",
			width: "100%"
		}
	},
  boxWithTotalData: {
    display: "flex",
    [theme.breakpoints.down("xs")]: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  subBoxWithTotalData: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    [theme.breakpoints.down("xs")]: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
  },
  boxWithCustomPeriod: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1em",
    [theme.breakpoints.down("xs")]: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
  },
  boxWithCustomPeriodWithData: {
    display: "flex",
    justifyContent: "space-between",
    [theme.breakpoints.down("xs")]: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    },
  },
  subBoxWithCustomPeriodWithData: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    width: "100%",
    [theme.breakpoints.down("xs")]: {
      width: "auto",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },
  },
  tooltip: {
    position: "relative",
    right: "-180px",
    fontSize: "0.8em",
    opacity: "0.5",
    zIndex: "1",
    [theme.breakpoints.down("xs")]: {
      right: "-150px",
      visibility: "hidden",
    },
  },
  customDateRangePicker: {
    [theme.breakpoints.down("xs")]: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  dateActions: {
    position: "relative",
    right: "70px",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1em",
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
    [theme.breakpoints.down("xs")]: {
      marginTop: "50px",
    },
  },
  customFixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  customFixedHeightPaperLg: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: "100%",
  },
  paperHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  help: {
    fontSize: "1.2em",
  },

  dateSlider: {
    width: "200px",

    // inclination of slider texts
    "& .MuiSlider-markLabel": {
      // transform: "rotate(-45deg)",
      // transformOrigin: "center",
      fontSize: "0.8em",
    },
  },

  customDate: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5em",

    fontSize: "0.8em",
    fontWeight: "900",
    color: "#406f2b",
    // backgroundColor: "red",
    // change fontsize icons
    "& .MuiSvgIcon-root": {
      fontSize: "1.6em",
    },
  },
}));
