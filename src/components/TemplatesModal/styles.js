import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  box: {
    width: "100%",
    height: "600px",
    backgroundColor: "white",
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: "99",
  },
  tabs: {
    zIndex: "99999",
    position: "absolute",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    "& .MuiTabs-flexContainer": {
      justifyContent: "space-around",
    },
    marginBottom: "10px",
    backgroundColor: "white",
  },
  tab: {
    fontSize: "20px",
  },
  main: {
    display: "flex",
    flexDirection: "column", // Altere a direção dos elementos para coluna
    gap: "10px",
    alignItems: "center",
    width: "100%",
    marginTop: "60px",
  },
  Card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    // colocar uma sombra no card
    boxShadow: "0px 0px 5px 0px rgba(0,0,0,0.75)",
  },
  Button: {
    border: "1px solid black",
    fontWeight: "bold",
    color: "black",
    "&:hover": {
      backgroundColor: "black",
      color: "white",
    },
  },
  selectedCard: {
    border: "2px solid red",
    backgroundColor: "#f0f0f0",
  },
  containerCreate: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    height: "100%",
  },
}));
