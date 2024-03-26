import {
  useState,
  useEffect,
  useReducer,
  useContext,
  useCallback,
} from "react";
import openSocket from "../../services/socket-io";
import toastError from "../../errors/toastError";

import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";

const reducer = (state, action) => {
  if (action.type === "LOAD_METAS") {
    const metas = action.payload;

    return [...metas];
  }

  if (action.type === "UPDATE_METAS") {
    const meta = action.payload;
    const metaIndex = state.findIndex((s) => s.id === meta.id);

    if (metaIndex !== -1) {
      state[metaIndex] = meta;
      return [...state];
    } else {
      return [meta, ...state];
    }
  }

  if (action.type === "UPDATE_SESSION") {
    const meta = action.payload;
    const metaIndex = state.findIndex((s) => s.id === meta.id);

    if (metaIndex !== -1) {
      state[metaIndex].status = meta.status;
      state[metaIndex].updatedAt = meta.updatedAt;
      state[metaIndex].qrcode = meta.qrcode;
      state[metaIndex].retries = meta.retries;
      return [...state];
    } else {
      return [...state];
    }
  }

  if (action.type === "DELETE_METAS") {
    const metaId = action.payload;

    const metaIndex = state.findIndex((s) => s.id === metaId);
    if (metaIndex !== -1) {
      state.splice(metaIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useMetas = () => {
  const [metas, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const getConnectionsMeta = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/meta/");
      dispatch({
        type: "LOAD_METAS",
        payload: data,
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  }, []);

  useEffect(() => {
    getConnectionsMeta();
  }, [getConnectionsMeta]);

  useEffect(() => {
    const socket = openSocket({
      scope: "meta",
      userId: user.id,
      component: "useWhatsApps",
    });

    socket.on("meta", (data) => {
      if (data.action === "update") {
        dispatch({ type: "UPDATE_METAS", payload: data.meta });
      }
    });

    socket.on("meta", (data) => {
      if (data.action === "delete") {
        dispatch({ type: "DELETE_METAS", payload: data.metaId });
      }
    });

    socket.on("metaSession", (data) => {
      if (data.action === "update") {
        dispatch({ type: "UPDATE_SESSION", payload: data.session });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return {
    metas: metas.filter((meta) => meta.status !== "INATIVE"),
    loading,
    allMetas: metas,
    getConnectionsMeta,
  };
};

export default useMetas;
