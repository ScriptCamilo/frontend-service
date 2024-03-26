import React, { useEffect, useState } from "react";

import {
  Badge,
  Box,
  ClickAwayListener,
  Menu,
  MenuItem,
  Typography,
  makeStyles,
} from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListSubheader from "@material-ui/core/ListSubheader";
import {
  CalendarToday,
  LabelOutlined,
  RecentActorsOutlined,
} from "@material-ui/icons";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import AndroidIcon from "@material-ui/icons/Android";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import ArrowRightAltIcon from "@material-ui/icons/ArrowRightAlt";
import CodeIcon from "@material-ui/icons/Code";
import CollectionsBookmarkIcon from "@material-ui/icons/CollectionsBookmark";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import LogoutIcon from "@material-ui/icons/ExitToApp";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import OpenInBrowserOutlined from "@material-ui/icons/OpenInBrowserOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import QuestionAnswerOutlinedIcon from "@material-ui/icons/QuestionAnswerOutlined";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { Can } from "../components/Can";
import UserModal from "../components/UserModal";
import { useAuthContext } from "../context/Auth/AuthContext";
import { useSettingsContext } from "../context/SettingsContext";
import { useWhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { i18n } from "../translate/i18n";

const useStyles = makeStyles((theme) => ({
  bottomBar: {
    display: "none",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: "linear-gradient(0deg, #2b4b1d 20%, #42722c 90%)",
    height: "50px",
    listStyleType: "none",
    position: "fixed",
    bottom: "0",
    zIndex: "1000",
    width: "100%",
    borderRadius: "10px 10px 0 0",
    // set breakpoint with 960px

    [theme.breakpoints.down(960)]: {
      display: "flex",
    },
  },

  navButtonActive: {
    color: "#2b4b1d",
    backgroundImage: "linear-gradient(0deg, #c2c2c2 10%, #fff 30%)",
    borderRadius: "50%",
    height: "50px",
    width: "50px",
    padding: "12px",
    margin: "-30px 0 0 0",
    boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.35)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  navButtonInactive: {
    margin: 0,
    padding: 0,
    color: "#fff",
    // change list item text
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",

    "& span": {
      margin: 0,
      padding: 0,
      color: "#fff",
    },
  },

  moreOptionsMenu: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "10px",
  },

  moreOptionsIcon: {
    color: "#fff",
    fontSize: "0.8em",
    textAlign: "center",
  },

  moreOption: {
    "& .MuiTypography-root": {
      color: "red",
    },

    "& svg": {
      color: "#000",
    },
  },

  menuOptions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, className } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem
        button
        component={renderLink}
        className={className}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          fontSize: "0.8em",
          textAlign: "center",
        }}
      >
        {icon}
        {primary}
      </ListItem>
    </li>
  );
}

function ListMoreItemLink(props) {
  const { icon, primary, to, className } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <ListItem
      button
      component={to ? renderLink : "div"}
      className={className}
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        color: "#213916",
        fontSize: "0.7em",
        textAlign: "center",
        gap: "10px",
      }}
    >
      {icon}
      {primary}
    </ListItem>
  );
}

const MainListItemsMobile = (props) => {
  const { drawerClose } = props;
  const classes = useStyles();
  const { pathname } = useLocation();
  const { whatsApps } = useWhatsAppsContext();
  const { user, handleLogout } = useAuthContext();
  const { getSettingValue } = useSettingsContext();

  const [connectionWarning, setConnectionWarning] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [menuMoreOptions, setMenuMoreOptions] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const getDisparadorPermission = (profile) => {
    const showDisparatorPage = getSettingValue("showDisparatorPage");
    const disparadorPermission = getSettingValue("disparadorPermission");
    const isDisparadorToShow = showDisparatorPage === "true";
    return isDisparadorToShow && disparadorPermission === profile;
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  return (
    <div onClick={drawerClose} className={classes.bottomBar}>
      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user?.id}
      />

      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={
          <WhatsAppIcon
            className={
              pathname && pathname === "/tickets"
                ? classes.navButtonActive
                : classes.navButtonInactive
            }
          />
        }
      />

      {["supervisor", "admin"].includes(user.profile) && (
        <ListItemLink
          to="/contacts"
          primary={i18n.t("mainDrawer.listItems.contacts")}
          icon={
            <ContactPhoneOutlinedIcon
              className={
                pathname && pathname === "/contacts"
                  ? classes.navButtonActive
                  : classes.navButtonInactive
              }
            />
          }
        />
      )}

      {user.profile === "admin" && (
        <ListItemLink
          to="/end-tickets"
          primary="Lista de relatórios"
          icon={
            <AnnouncementIcon
              className={
                pathname && pathname === "/end-tickets"
                  ? classes.navButtonActive
                  : classes.navButtonInactive
              }
            />
          }
        />
      )}

      <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
        <>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            style={{ marginTop: "-40px" }}
            MenuListProps={{
              className: classes.menuOptions,
            }}
          >
            <MenuItem onClick={() => setAnchorEl(null)}>
              <ListMoreItemLink
                primary="Dashboard"
                icon={<DashboardOutlinedIcon />}
                to="/"
              />
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                setUserModalOpen(true);
              }}
            >
              <ListMoreItemLink
                primary="Usuário"
                icon={<AccountCircleIcon />}
              />
            </MenuItem>

            <MenuItem onClick={() => setAnchorEl(null)}>
              <ListMoreItemLink
                to="/quickAnswers"
                primary={i18n.t("mainDrawer.listItems.quickAnswers")}
                icon={<QuestionAnswerOutlinedIcon />}
              />
            </MenuItem>

            {getSettingValue("showSchedulePage") === "true" && (
              <MenuItem onClick={() => setAnchorEl(null)}>
                <ListMoreItemLink
                  to="/schedules"
                  primary={i18n.t("mainDrawer.listItems.schedules")}
                  icon={<CalendarToday />}
                />
              </MenuItem>
            )}

            {getSettingValue("showWebhookPage") === "true" && (
              <MenuItem onClick={() => setAnchorEl(null)}>
                <ListMoreItemLink
                  to="/webhook"
                  primary="WebHooks"
                  icon={<OpenInBrowserOutlined />}
                />
              </MenuItem>
            )}

            {getDisparadorPermission("user") && (
              <MenuItem onClick={() => setAnchorEl(null)}>
                <ListMoreItemLink
                  to="/disparador"
                  primary="Disparador"
                  icon={<ArrowRightAltIcon />}
                />
              </MenuItem>
            )}

            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                handleLogout();
              }}
            >
              <ListMoreItemLink primary="Sair" icon={<LogoutIcon />} />
            </MenuItem>

            <Can
              role={user.profile}
              perform="drawer-admin-items:supervisor"
              yes={() => (
                <>
                  <Divider />
                  <ListSubheader inset>Supervisão</ListSubheader>

                  <MenuItem onClick={() => setAnchorEl(null)}>
                    <ListMoreItemLink
                      to="/connections"
                      primary={i18n.t("mainDrawer.listItems.connections")}
                      icon={
                        <Badge
                          overlap="rectangular"
                          badgeContent={connectionWarning ? "!" : 0}
                          color="error"
                        >
                          <SyncAltIcon />
                        </Badge>
                      }
                    />
                  </MenuItem>

                  {getDisparadorPermission("supervisor") && (
                    <MenuItem onClick={() => setAnchorEl(null)}>
                      <ListMoreItemLink
                        to="/disparador"
                        primary="Disparador"
                        icon={<ArrowRightAltIcon />}
                      />
                    </MenuItem>
                  )}
                </>
              )}
            />
            <Can
              role={user.profile}
              perform="drawer-admin-items:view"
              yes={() => (
                <>
                  <Divider />
                  <ListSubheader inset>
                    {i18n.t("mainDrawer.listItems.administration")}
                  </ListSubheader>

                  <MenuItem onClick={() => setAnchorEl(null)}>
                    <ListMoreItemLink
                      to="/extrainfo"
                      primary="Campos Personalizados"
                      icon={<RecentActorsOutlined />}
                    />
                  </MenuItem>

                  <MenuItem onClick={() => setAnchorEl(null)}>
                    <ListMoreItemLink
                      to="/chat-bot"
                      primary="Chat Bots"
                      icon={<AndroidIcon />}
                    />
                  </MenuItem>

                  {getSettingValue("showWebhookPage") === "true" && (
                    <MenuItem onClick={() => setAnchorEl(null)}>
                      <ListMoreItemLink
                        to="/webhook"
                        primary="WebHooks"
                        icon={<OpenInBrowserOutlined />}
                      />
                    </MenuItem>
                  )}

                  <MenuItem onClick={() => setAnchorEl(null)}>
                    <ListMoreItemLink
                      to="/tags"
                      primary="Etiquetas"
                      icon={<LabelOutlined />}
                    />
                  </MenuItem>
                  <MenuItem onClick={() => setAnchorEl(null)}>
                    <ListMoreItemLink
                      to="/users"
                      primary={i18n.t("mainDrawer.listItems.users")}
                      icon={<PeopleAltOutlinedIcon />}
                    />
                  </MenuItem>
                  <MenuItem onClick={() => setAnchorEl(null)}>
                    <ListMoreItemLink
                      to="/queues"
                      primary={i18n.t("mainDrawer.listItems.queues")}
                      icon={<AccountTreeOutlinedIcon />}
                    />
                  </MenuItem>
                  {getDisparadorPermission("admin") && (
                    <MenuItem onClick={() => setAnchorEl(null)}>
                      <ListMoreItemLink
                        to="/disparador"
                        primary="Disparador"
                        icon={<ArrowRightAltIcon />}
                      />
                    </MenuItem>
                  )}
                  <MenuItem onClick={() => setAnchorEl(null)}>
                    <ListMoreItemLink
                      to="/settings"
                      primary={i18n.t("mainDrawer.listItems.settings")}
                      icon={<SettingsOutlinedIcon />}
                    />
                  </MenuItem>
                  <MenuItem onClick={() => setAnchorEl(null)}>
                    <ListMoreItemLink
                      to="/api"
                      primary={"API"}
                      icon={<CodeIcon />}
                    />
                  </MenuItem>
                  <MenuItem onClick={() => setAnchorEl(null)}>
                    <ListMoreItemLink
                      to="/logs-registry"
                      primary="Registro de Auditoria"
                      icon={<CollectionsBookmarkIcon />}
                    />
                  </MenuItem>

                  <Divider />
                </>
              )}
            />
          </Menu>

          <Box
            className={classes.moreOptionsMenu}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              marginLeft: "10px",
            }}
          >
            <MoreVertIcon
              className={
                anchorEl ? classes.navButtonActive : classes.navButtonInactive
              }
              onClick={(e) => {
                setAnchorEl(e.currentTarget);
              }}
            />
            <Typography className={classes.moreOptionsIcon}>Outros</Typography>
          </Box>
        </>
      </ClickAwayListener>
    </div>
  );
};

export default MainListItemsMobile;
