import { useState, useEffect, useReducer, useCallback } from "react";
import openSocket from "../../services/socket-io";
import toastError from "../../errors/toastError";

import api from "../../services/api";

const reducer = (state, action) => {
  if (action.type === "LOAD_WHATSAPPS") {
    const whatsApps = action.payload;

    return [...whatsApps];
  }

  if (action.type === "UPDATE_WHATSAPPS") {
    const whatsApp = action.payload;
    const whatsAppIndex = state.findIndex(
      (s) => s.id === whatsApp.id && s.isOficial === whatsApp.isOficial
    );

    if (whatsAppIndex !== -1) {
      state[whatsAppIndex] = { ...state[whatsAppIndex], ...whatsApp };
      return [...state];
    } else {
      return [whatsApp, ...state];
    }
  }

  if (action.type === "UPDATE_SESSION") {
    const whatsApp = action.payload;
    const whatsAppIndex = state.findIndex(
      (s) => s.id === whatsApp.id && s.isOficial === whatsApp.isOficial
    );

    if (whatsAppIndex !== -1) {
      state[whatsAppIndex].status = whatsApp.status;
      state[whatsAppIndex].updatedAt = whatsApp.updatedAt;
      state[whatsAppIndex].qrcode = whatsApp.qrcode;
      state[whatsAppIndex].retries = whatsApp.retries;
      return [...state];
    } else {
      return [...state];
    }
  }

  if (action.type === "DELETE_WHATSAPPS") {
    const whatsAppId = action.payload;

    const whatsAppIndex = state.findIndex(
      (s) => s.id === whatsAppId && s.isOficial === true
    );
    if (whatsAppIndex !== -1) {
      state.splice(whatsAppIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useWhatsApps = () => {
  const [whatsApps, dispatch] = useReducer(reducer, []);
  const [whatsAppApis, dispatchApi] = useReducer(reducer, []);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user", ""));

  const getConnections = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: whatsapps }, { data: whatsappApis }] = await Promise.all([
        await api.get("/whatsapp/"),
        await api.get("/whatsapp-api/"),
      ]);

      dispatch({ type: "LOAD_WHATSAPPS", payload: whatsapps });
      dispatchApi({
        type: "LOAD_WHATSAPPS",
        payload: [...whatsappApis.map((e) => ({ ...e, isOficial: true }))],
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  }, []);

  useEffect(() => {
    getConnections();
  }, [getConnections]);

  useEffect(() => {
    if (!user) return;
    const socket = openSocket({
      scope: "whatsapp",
      userId: user.id,
      component: "useWhatsApps",
    });

    socket.on(`${user?.companyId}-whatsapp`, (data) => {
      if (data.action === "update" && data.whatsapp.isOficial) {
        dispatchApi({ type: "UPDATE_WHATSAPPS", payload: data.whatsapp });
      } else if (data.action === "update" && !data.whatsapp.isOficial) {
        dispatch({ type: "UPDATE_WHATSAPPS", payload: data.whatsapp });
      }
    });

    socket.on(`${user?.companyId}-whatsapp`, (data) => {
      if (data.action === "delete" && data.whatsapp.isOficial) {
        dispatchApi({ type: "DELETE_WHATSAPPS", payload: data.whatsappId });
      } else if (data.action === "delete" && !data.whatsapp.isOficial) {
        dispatch({ type: "DELETE_WHATSAPPS", payload: data.whatsappId });
      }
    });

    socket.on(`${user?.companyId}-whatsappSession`, (data) => {
      if (data.action === "update" && data.session.isOficial) {
        dispatchApi({ type: "UPDATE_SESSION", payload: data.session });
      } else if (data.action === "update" && !data.session.isOficial) {
        dispatch({ type: "UPDATE_SESSION", payload: data.session });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { whatsApps, whatsAppApis, loading, getConnections };
};

export default useWhatsApps;
