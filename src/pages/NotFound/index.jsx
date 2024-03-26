import React from "react";
import { Container, Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  notFoundContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  notFoundText: {
    fontSize: "7rem",
    fontWeight: "bold",
    color: "black",
    marginBottom: theme.spacing(2),
    textAlign: "center",
  },
  notFoundMessage: {
    fontSize: "1.5rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
    textAlign: "center",
  },
}));

const NotFound = () => {
  const classes = useStyles();

  return (
    <Container maxWidth="md" className={classes.notFoundContainer}>
      <Typography variant="h1" className={classes.notFoundText} gutterBottom>
        404
      </Typography>
      <Typography
        variant="body1"
        className={classes.notFoundMessage}
        gutterBottom
      >
        A página que você está procurando não existe ou foi movida.
      </Typography>
    </Container>
  );
};

export default NotFound;
