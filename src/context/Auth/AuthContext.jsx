import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { useLocation } from "react-router-dom";

import useAuth from "../../hooks/useAuth/index.jsx";
import useImportContacts from "../../hooks/useImportContacts/index.jsx";
import useMixpanel from "../../hooks/useMixpanel/index.jsx";
import api from "../../services/api.js";

export const AuthContext = createContext();

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const { loading, user, isAuth, handleLogin, handleLogout, notice } = useAuth();
  const location = useLocation();
  const { track, identify } = useMixpanel(user);
  const { progress, showResults, setShowResults } = useImportContacts({ user });

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [queues, setQueues] = useState([]);
  const [tags, setTags] = useState([]);
  const [connections, setConnections] = useState([]);
  const [connectionsMeta, setConnectionsMeta] = useState([]);
	const [connectionsApi, setConnectionsApi] = useState([]);
  const [listRefresh, setListRefresh] = useState(0);
  const [ticketsNoQueue, setTicketsNoQueue] = useState([]);
  const [relatorio, setRelatorio] = useState("disabled");
  const [timeoutUnqueued, setTimeoutUnqueued] = useState(0);
  const [isSocketConnected, setIsSocketConnected] = useState(true);
  const [selectedUsersIds, setSelectedUsersIds] = useState([]);
	const [previousPath, setPreviousPath] = useState("");

  const isAdminClient = process.env.REACT_APP_ADMIN_CLIENT === "true";

  const getUsers = useCallback(async () => {
    if (isAuth) {
      try {
        const { data } = await api.get("/users/");
        setUsers(data);
      } catch (err) {
        console.log(err);
      }
    }
  }, [isAuth]);

  const getQueues = useCallback(async () => {
    if (isAuth) {
      try {
        const { data } = await api.get("/queue/");
        setQueues(data);
      } catch (err) {
        console.log(err);
      }
    }
  }, [isAuth]);

  const getTags = useCallback(async () => {
    if (isAuth) {
      try {
        const { data } = await api.get("/tags/");
        setTags(data);
      } catch (err) {
        console.log(err);
      }
    }
  }, [isAuth]);

  const getConnections = useCallback(async () => {
		const [
			{ data: whatsapps },
			{ data: whatsappApis },
			{ data: meta }
		] = await Promise.all([
			await api.get("/whatsapp/"),
			await api.get("/whatsapp-api/"),
			await api.get('/meta')
		]);
    setConnections(whatsapps);
		setConnectionsApi(whatsappApis)
    setConnectionsMeta(meta);
  }, []);

	useEffect(() => {
		getConnections();
	}, []);

  useEffect(() => {
    setPreviousPath(window.location.href);
  }, [location]);

	useEffect(() => {
		if (user.id && previousPath !== window.location.href && track) {
			track("Page View", {
				"Page Title": window.document.title,
				"Referrer": previousPath,
			});
		}
	}, [location, track, user.id, previousPath])

  useEffect(() => {
    setPreviousPath(window.location.href);
  }, [location]);

  useEffect(() => {
    isAuth && getUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, getUsers]);

  useEffect(() => {
    isAuth && getQueues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth, getQueues]);

  const getTicketsNoQueue = useCallback(async () => {
    const { data } = await api.get("/tickets-no-queue");
    setTicketsNoQueue(data);
  }, []);

  useEffect(() => {
    isAuth && getTicketsNoQueue();
  }, [isAuth, getTicketsNoQueue]);

  return (
    <AuthContext.Provider
      value={{
        loading,
        user,
        notice,
        isAuth,
        handleLogin,
        handleLogout,
        onlineUsers,
        setOnlineUsers,
        users,
        getUsers,
        getQueues,
        queues,
        tags,
        getTags,
        connections,
				connectionsApi,
        getConnections,
        listRefresh,
        setListRefresh,
        relatorio,
        setRelatorio,
        timeoutUnqueued,
        setTimeoutUnqueued,
        isSocketConnected,
        setIsSocketConnected,
        isAdminClient,
        selectedUsersIds,
        setSelectedUsersIds,
        connectionsMeta,
				progress,
				showResults,
				setShowResults,
				track,
				identify,
        ticketsNoQueue
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
