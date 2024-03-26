import React, { useEffect, useState } from "react";

import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  Paper,
  Typography,
  makeStyles,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import MenuIcon from "@material-ui/icons/Menu";
import clsx from "clsx";

import BackdropLoading from "../components/BackdropLoading";
import NotificationsPopOver from "../components/NotificationsPopOver";
import UserModal from "../components/UserModal";
import { useAuthContext } from "../context/Auth/AuthContext";
import { useSettingsContext } from '../context/SettingsContext';
import { deskChatVersion } from "../version";
import MainListItems from "./MainListItems";
import MainListItemsMobile from "./MainListItemsMobile";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    display: "flex",
    margin: "0px",
    padding: "0px",
  },

  toolbar: {
    paddingRight: 2, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    minHeight: "48px",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    ...theme.scrollbarStyles,
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    // backgroundColor: "#42722c",
    // gradient: "linear-gradient(45deg, #42722c 30%, #000000 90%)",
    backgroundImage: "linear-gradient(79deg, #2b4b1d 20%, #42722c  50%)",
    // background: "linear-gradient(to , #42722c, #348c0c)",
    color: "#fff",

    // if is mobile
    [theme.breakpoints.down("sm")]: {
      // hideen
      display: "none",
    },
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },

    [theme.breakpoints.down("sm")]: {
      // hideen
      display: "none",
    },
  },

  appBarSpacer: {
    minHeight: "48px",
  },
  content: {
    flex: 1,
    // height: "105vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  // paper: {
  //   padding: theme.spacing(2),
  //   display: "flex",
  //   overflow: "auto",
  //   flexDirection: "column",
  // },
  logo: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },

  version: {
    position: "absolute",
    left: "48%",
    top: "31px",
    fontSize: "0.7em",
  },
}));

const LoggedInLayout = ({ children }) => {
  const classes = useStyles();
  const { user, isSocketConnected, handleLogout, loading } = useAuthContext();
  const { settingLoading } = useSettingsContext();

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const drawerClose = () => {
    if (document.body.offsetWidth < 600) {
      setDrawerOpen(false);
    }
  };

  useEffect(() => {
    if (document.body.offsetWidth < 100) {
      setDrawerOpen(true);
    }
  }, []);

  useEffect(() => {
    if (document.body.offsetWidth < 600) {
      setDrawerVariant("temporary");
    } else {
      setDrawerVariant("permanent");
    }
  }, [drawerOpen]);

  if (loading || settingLoading) {
    return <BackdropLoading />;
  }

  return (
    <div className={classes.root}>
      {!isSocketConnected && (
        <Box
          style={{
            position: "fixed",
            width: "100vw",
            height: "100vh",
            zIndex: 9999999,
            // glass blur
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(5px)",
          }}
        >
          <Paper
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              padding: "1em 3em",
              width: "80%",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              style={{
                fontWeight: "bold",
                marginBottom: "1em",
                textTransform: "uppercase",
              }}
            >
              Sessão interrompida!
            </Typography>
            <Typography variant="body1">
              Identificamos acesso a esse usuário em outro dispositivo ou aba do
              navegador!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              style={{
                marginTop: "1em",
              }}
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Reconectar
            </Button>
          </Paper>
        </Box>
      )}
      <Drawer
        variant={drawerVariant}
        className={drawerOpen ? classes.drawerPaper : classes.drawerPaperClose}
        classes={{
          paper: clsx(
            classes.drawerPaper,
            !drawerOpen && classes.drawerPaperClose
          ),
        }}
        open={drawerOpen}
      >
        <div className={classes.toolbarIcon}>
          <img
            className={classes.logo}
            src="/DESKRIO-LOGO-BRANCA.png"
            alt="logo"
          />

          {drawerOpen && (
            <Typography
              className={classes.version}
            >{`v${deskChatVersion}`}</Typography>
          )}
          <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
            {/* <ChevronLeftIcon style={{ color: "white" }} /> */}
            {!drawerOpen ? (
              <MenuIcon style={{ color: "white", marginLeft: "-1.3em" }} />
            ) : (
              <CloseIcon style={{ color: "white" }} />
            )}
          </IconButton>
        </div>
        <Divider />
        <List>
          <MainListItems drawerClose={drawerClose} />
        </List>
        <Divider />
      </Drawer>

      <MainListItemsMobile />

      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user?.id}
      />
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, drawerOpen && classes.appBarShift)}
        color={process.env.NODE_ENV === "development" ? "inherit" : "primary"}
      >
        {/* <Toolbar variant="dense" className={classes.toolbar}> */}
        {/* <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={clsx(
              classes.menuButton,
              drawerOpen && classes.menuButtonHidden
            )}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            DeskRio
          </Typography> */}
        <NotificationsPopOver />
        {/*
          <div>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={menuOpen}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={handleOpenUserModal}>
                {i18n.t("mainDrawer.appBar.user.profile")}
              </MenuItem>
              <MenuItem onClick={handleClickLogout}>
                {i18n.t("mainDrawer.appBar.user.logout")}
              </MenuItem> */}
        {/* </Menu> */}
        {/* </div> */}
        {/* </Toolbar> */}
      </AppBar>
      <main className={classes.content}>{children ? children : null}</main>
    </div>
  );
};

export default LoggedInLayout;
