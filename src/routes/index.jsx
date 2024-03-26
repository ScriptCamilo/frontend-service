import React, { useEffect } from "react";

import Hotjar from "@hotjar/browser";
import { Redirect, Route as RouterRoute, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Notice from "../components/Notice";
import { useAuthContext } from "../context/Auth/AuthContext";
import { NoticesProvider } from "../context/Notices";
import { useSettingsContext } from '../context/SettingsContext';
import { UsersProvider } from "../context/UsersContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import LoggedInLayout from "../layout";
import DocumentationPage from "../pages/Api/index";
import ChatBot from "../pages/ChatBot";
import Connections from "../pages/Connections";
import Contacts from "../pages/Contacts";
import Dashboard from "../pages/Dashboard";
import Disparador from "../pages/Disparador";
import EndTickets from "../pages/EndTickets";
import Extrainfos from "../pages/Extrainfos";
import Login from "../pages/Login";
import LogsRegistry from "../pages/LogsRegistry";
import Queues from "../pages/Queues";
import QuickAnswers from "../pages/QuickAnswers";
import Schedules from "../pages/Schedules";
import Settings from "../pages/Settings";
import Tags from "../pages/Tags";
import Tickets from "../pages/Tickets";
import Users from "../pages/Users";
import Webhook from "../pages/Webhook";
import Route from "./Route";

const Routes = () => {
  const { isAuth } = useAuthContext();
  const { getSettingValue } = useSettingsContext();

  useEffect(() => {
    if (getSettingValue("hotjar") === "enabled") {
      const siteId = 3640127;
      const hotjarVersion = 6;
      Hotjar.init(siteId, hotjarVersion);
    }
  }, [getSettingValue]);

  return (
    <>
      <Switch>
        <Route exact path="/login" component={Login} />
        <UsersProvider>
          <WhatsAppsProvider>
            <NoticesProvider>
              <Notice />
              <LoggedInLayout>
                <Switch>
                  <Route exact path="/" component={Dashboard} isPrivate />
                  <Route
                    exact
                    path="/tickets/:ticketId?"
                    component={Tickets}
                    isPrivate
                  />
                  {getSettingValue("showSchedulePage") === "true" && (
                    <Route
                      exact
                      path="/schedules"
                      component={Schedules}
                      isPrivate
                    />
                  )}
                  <Route
                    exact
                    path="/connections"
                    component={Connections}
                    isPrivate
                  />
                  <Route
                    exact
                    path="/contacts"
                    component={Contacts}
                    isPrivate
                  />
                  <Route exact path="/users" component={Users} isPrivate />
                  <Route
                    exact
                    path="/quickAnswers"
                    component={QuickAnswers}
                    isPrivate
                  />
                  <Route
                    exact
                    path="/end-tickets"
                    component={EndTickets}
                    isPrivate
                  />
                  <Route exact path="/chat-bot" component={ChatBot} isPrivate />
                  <Route
                    exact
                    path="/settings"
                    component={Settings}
                    isPrivate
                  />
                  <Route
                    exact
                    path="/api"
                    component={DocumentationPage}
                    isPrivate
                  />
                  <Route exact path="/queues" component={Queues} isPrivate />
                  <Route exact path="/tags" component={Tags} isPrivate />
                  {getSettingValue("showDisparatorPage") === "true" && (
                    <Route
                      exact
                      path="/disparador"
                      component={Disparador}
                      isPrivate
                    />
                  )}

                  {getSettingValue("showWebhookPage") === "true" && (
                    <Route
                      exact
                      path="/webhook"
                      component={Webhook}
                      isPrivate
                    />
                  )}

                  <Route
                    exact
                    path="/logs-registry"
                    component={LogsRegistry}
                    isPrivate
                  />
                  <Route
                    exact
                    path="/extrainfo"
                    component={Extrainfos}
                    isPrivate
                  />
                  <RouterRoute path="*">
                    <Redirect to={isAuth ? "/" : "/login"} />
                  </RouterRoute>
                </Switch>
              </LoggedInLayout>
            </NoticesProvider>
          </WhatsAppsProvider>
        </UsersProvider>
      </Switch>
      <ToastContainer autoClose={3000} />
    </>
  );
};

export default Routes;
