import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  maxWidth: {
    width: "100%",
  },
  select: {
    '&[data-disabled="true"]': {
      opacity: 0.5,
    },
  },
}));
