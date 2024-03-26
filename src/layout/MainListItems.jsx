import React, { useEffect, useState } from "react";

import { Badge, makeStyles } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import AndroidIcon from "@material-ui/icons/Android";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import ArrowRightAltIcon from "@material-ui/icons/ArrowRightAlt";
import CalendarToday from "@material-ui/icons/CalendarToday";
import CodeIcon from "@material-ui/icons/Code";
import CollectionsBookmarkIcon from "@material-ui/icons/CollectionsBookmark";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import LogoutIcon from "@material-ui/icons/ExitToApp";
import LabelOutlined from "@material-ui/icons/LabelOutlined";
import OpenInBrowserOutlined from "@material-ui/icons/OpenInBrowserOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import QuestionAnswerOutlinedIcon from "@material-ui/icons/QuestionAnswerOutlined";
import RecentActorsOutlined from "@material-ui/icons/RecentActorsOutlined";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import AdminPanelSettings from "@material-ui/icons/VerifiedUser";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import { Link as RouterLink } from "react-router-dom";

import { Can } from "../components/Can";
import UserModal from "../components/UserModal";
import { useAuthContext } from "../context/Auth/AuthContext";
import { useSettingsContext } from "../context/SettingsContext";
import { useWhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { i18n } from "../translate/i18n";

const useStyles = makeStyles((theme) => ({
  sideIcons: {
    display: "flex",
    flexDirection: "column",
    paddingLeft: ".5em",
    justifyContent: "space-between",
    height: "100%",
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, className } = props;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to || "/"} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem button component={renderLink} className={className}>
        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

const MainListItems = (props) => {
  const { drawerClose } = props;
  const classes = useStyles();
  const { whatsApps } = useWhatsAppsContext();
  const { getSettingValue } = useSettingsContext();
  const { user, handleLogout, isAdminClient } = useAuthContext();

  const [connectionWarning, setConnectionWarning] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);

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
    <div onClick={drawerClose} className={classes.sideIcons}>
      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user?.id}
      />
      <ListItemLink
        primary="Usuário"
        icon={
          <AccountCircleIcon
            onClick={() => {
              setUserModalOpen(true);
            }}
            style={{ color: "white" }}
          />
        }
      />

      <ListItemLink
        to="/"
        primary="Dashboard"
        icon={<DashboardOutlinedIcon style={{ color: "white" }} />}
      />

      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<WhatsAppIcon style={{ color: "white" }} />}
      />

      {getSettingValue("showSchedulePage") === "true" && (
        <ListItemLink
          to="/schedules"
          primary={i18n.t("mainDrawer.listItems.schedules")}
          icon={<CalendarToday style={{ color: "white" }} />}
        />
      )}

      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<ContactPhoneOutlinedIcon style={{ color: "white" }} />}
      />

      <ListItemLink
        to="/quickAnswers"
        primary={i18n.t("mainDrawer.listItems.quickAnswers")}
        icon={<QuestionAnswerOutlinedIcon style={{ color: "white" }} />}
      />

      <ListItemLink
        to="/connections"
        primary={i18n.t("mainDrawer.listItems.connections")}
        icon={
          <Badge
            overlap="rectangular"
            badgeContent={connectionWarning ? "!" : 0}
            color="error"
          >
            <SyncAltIcon style={{ color: "white" }} />
          </Badge>
        }
      />

      <ListItemLink
        to="/end-tickets"
        primary="Lista de Relatórios"
        icon={<AnnouncementIcon style={{ color: "white" }} />}
      />

      {getDisparadorPermission("user") && (
        <ListItemLink
          to="/disparador"
          primary="Disparador"
          icon={<ArrowRightAltIcon style={{ color: "white" }} />}
        />
      )}

      <Can
        role={user.profile}
        perform="drawer-admin-items:supervisor"
        yes={() => (
          <>
            <Divider />
            <ListSubheader inset style={{ color: "white" }}>
              Supervisão
            </ListSubheader>

            <ListItemLink
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              icon={<PeopleAltOutlinedIcon style={{ color: "white" }} />}
            />

            {getDisparadorPermission("supervisor") && (
              <ListItemLink
                to="/disparador"
                primary="Disparador"
                icon={<ArrowRightAltIcon style={{ color: "white" }} />}
              />
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
            <ListSubheader inset style={{ color: "white" }}>
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>

            {getDisparadorPermission("admin") && (
              <ListItemLink
                to="/disparador"
                primary="Disparador"
                icon={<ArrowRightAltIcon style={{ color: "white" }} />}
              />
            )}

            <ListItemLink
              style={{ maxWidth: "100px", textWrap: "wrap" }}
              to="/extrainfo"
              primary={
                <ListItemText
                  primary={"Campos Personalizados"}
                  primaryTypographyProps={{
                    style: {
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                  }}
                />
              }
              icon={<RecentActorsOutlined style={{ color: "white" }} />}
            />

            <ListItemLink
              to="/chat-bot"
              primary="Chat Bots"
              icon={<AndroidIcon style={{ color: "white" }} />}
            />

            {getSettingValue("showWebhookPage") === "true" && (
              <ListItemLink
                to="/webhook"
                primary="WebHooks"
                icon={<OpenInBrowserOutlined style={{ color: "white" }} />}
              />
            )}

            <ListItemLink
              to="/tags"
              primary="Etiquetas"
              icon={<LabelOutlined style={{ color: "white" }} />}
            />

            <ListItemLink
              to="/queues"
              primary={i18n.t("mainDrawer.listItems.queues")}
              icon={<AccountTreeOutlinedIcon style={{ color: "white" }} />}
            />

            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<SettingsOutlinedIcon style={{ color: "white" }} />}
            />

            {isAdminClient && (
              <ListItemLink
                to="/admin"
                primary={i18n.t("mainDrawer.listItems.adminPanel")}
                icon={<AdminPanelSettings style={{ color: "white" }} />}
              />
            )}
            <ListItemLink
              to="/api"
              primary={"API"}
              icon={<CodeIcon style={{ color: "white" }} />}
            />
            <ListItemLink
              to="/logs-registry"
              primary="Registro de Auditoria"
              icon={<CollectionsBookmarkIcon style={{ color: "white" }} />}
            />

            <Divider />
          </>
        )}
      />

      <ListItemLink
        primary="Sair"
        icon={
          <LogoutIcon
            onClick={() => {
              handleLogout();
            }}
            style={{ color: "white" }}
          />
        }
      />
    </div>
  );
};

export default MainListItems;
