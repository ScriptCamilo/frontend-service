import { useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  customToast: {
    color: "black",
    fontWeight: "bold",
  },
}));

const useAuth = () => {
  const classes = useStyles();

  const history = useHistory();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      const onesignalPushId = localStorage.getItem("onesignal_push_id");

      if (token) {
        config.headers["Authorization"] = `Bearer ${JSON.parse(token)}`;
        setIsAuth(true);
      }

      if (onesignalPushId) {
        config.headers["onesignal-push-id"] = onesignalPushId;
      }

      return config;
    },
    (error) => {
      Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      if (error?.response?.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;

        const { data } = await api.post("/auth/refresh_token");
        if (data) {
          localStorage.setItem("token", JSON.stringify(data.token));
          localStorage.setItem("user", JSON.stringify(data.user));
          api.defaults.headers.Authorization = `Bearer ${data.token}`;
        }
        return api(originalRequest);
      }
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        api.defaults.headers.Authorization = undefined;
        setIsAuth(false);
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    (async () => {
      if (token) {
        try {
          const { data } = await api.post("/auth/refresh_token");
          api.defaults.headers.Authorization = `Bearer ${data.token}`;
          localStorage.setItem("token", JSON.stringify(data.token));
          localStorage.setItem("user", JSON.stringify(data.user));
          setIsAuth(true);
          setUser(data.user);
        } catch (err) {
          toastError(err);
        }
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const socket = openSocket({
      scope: "useAuth",
      userId: user.id,
      component: "useAuth",
    });

    socket.on(`${user?.companyId}-user`, (data) => {
      if (data.action === "update" && data.user.id === user.id) {
        setUser(data.user);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleLogin = async (userData) => {
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", userData);
      localStorage.setItem("token", JSON.stringify(data.token));
      localStorage.setItem("user", JSON.stringify(data.user));
      api.defaults.headers.Authorization = `Bearer ${data.token}`;
      setUser(data.user);
      setIsAuth(true);
      toast.success(i18n.t("auth.toasts.success"));
      history.push("/tickets");
    } catch (err) {
      const errorMessage = `backendErrors.${err.response.data.error}`;
      toast.warn(i18n.t(errorMessage), {
        className: classes.customToast,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);

    try {
      await api.delete("/auth/logout");
      setIsAuth(false);
      setUser({});
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      api.defaults.headers.Authorization = undefined;
      setLoading(false);
      setTimeout(() => {
        toast.success("Usuário desconectado com sucesso!");
        history.push("/login");
      }, 500);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  return { isAuth, user, loading, handleLogin, handleLogout };
};

export default useAuth;
