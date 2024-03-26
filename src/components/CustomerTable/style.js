import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((_theme) => ({
  row: {
    transition: "background-color 0.2s ease",
    "&:hover": {
      backgroundColor: "#F8F8F8",
    }
  },
}))
