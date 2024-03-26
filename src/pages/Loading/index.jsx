import React from "react";
import { CircularProgress, Container, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  loadingText: {
    fontSize: "1.5rem",
    marginTop: theme.spacing(2),
  },
}));

const Loading = ({ text = "Carregando..." }) => {
  const classes = useStyles();

  return (
    <Container maxWidth="md" className={classes.loadingContainer}>
      <CircularProgress color="primary" size={80} />
      <p className={classes.loadingText}>{text}</p>
    </Container>
  );
};

export default Loading;
