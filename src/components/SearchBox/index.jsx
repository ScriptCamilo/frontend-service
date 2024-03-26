import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box, IconButton, Typography } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import CloseIcon from "@material-ui/icons/Close";
import MinimizeIcon from "@material-ui/icons/Minimize";
import { set } from "date-fns";

const useStyles = makeStyles((theme) => ({
  searchButton: {
    backgroundColor: "white",
    position: "absolute",
    width: "50px",
    // left: "98%",
    overflow: "visible",
    // top: "13.6vh",
    display: "flex",
    zIndex: 1,
    borderRadius: "0 50px 50px 0",
    boxShadow:
      "inset 5px 0px 5px rgba(0, 0, 0, 0.15), 0px 5px 5px rgba(0, 0, 0, 0.15)",
  },

  searchContainer: {
    backgroundColor: "#42722c",
    position: "absolute",
    // height: "100%",
    top: "0",
    width: "100%",
    // left: "36.7%",
    // top: "13.6vh",
    display: "flex",
    flexDirection: "column",
    zIndex: 1,
    borderRadius: "0 20px 0 0",
    // inner box shadow on left
    boxShadow: "inset 5px -5px 5px rgba(0, 0, 0, 0.18)",
  },

  searchHeader: {
    color: "white",
    paddingLeft: "1em",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: "0.9em",
    fontWeight: "bold",

    // icon size
    "& svg": {
      fontSize: "1.2em",
      color: "white",
    },
  },

  currentStatus: {
    fontSize: "0.8em",
    opacity: "0.7",
    fontStyle: "italic",
    textTransform: "uppercase",
  },
}));

export const SearchBox = ({ status, setAnchorEl, setPopperHidden }) => {
  const [open, setOpen] = useState(true);

  const classes = useStyles();
  return (
    <>
      {!open && (
        <Box className={classes.searchButton}>
          <IconButton onClick={() => setAnchorEl(null)}>
            <SearchIcon />
          </IconButton>
        </Box>
      )}

      {open && (
        <Box className={classes.searchContainer}>
          <Box className={classes.searchHeader}>
            <Typography className={classes.headerTitle}>Filtros</Typography>
            <Typography className={classes.currentStatus}>
              {`(${
                status === "open"
                  ? "Em atendimento"
                  : status === "pending"
                  ? "Aguardando atendimento"
                  : status === "groups"
                  ? "Grupos"
                  : status === "closed" && "Finalizados"
              })`}
            </Typography>
            <Box>
              <IconButton
                className={classes.headerTitle}
                onClick={() => setPopperHidden(true)}
              >
                <MinimizeIcon
                  style={{
                    marginTop: "-0.5em",
                  }}
                />
              </IconButton>
              <IconButton
                className={classes.headerTitle}
                onClick={() => setAnchorEl(null)}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};
