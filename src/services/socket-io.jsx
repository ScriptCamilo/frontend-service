import openSocket from "socket.io-client";
import { getBackendUrl, getFrontendUrl } from "../config";

function connectToSocket({ userId, scope, component, onDisconnect }) {
  try {
    const token = localStorage.getItem("token");
    const socket = openSocket(getBackendUrl(), {
      query: {
        userId,
        scope,
        component,
        token,
      },
    });

    return socket;
  } catch (error) {
    console.log(error);
  }

  // return openSocket(getBackendUrl());
}

export default connectToSocket;
