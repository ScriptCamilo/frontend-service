import React, { useContext } from "react";
import { Redirect, Route as RouterRoute, useLocation } from "react-router-dom";

import BackdropLoading from "../components/BackdropLoading";
import { AuthContext } from "../context/Auth/AuthContext";

function Route(params) {
  const {
    component: Component,
    isPrivate = false,
    ...rest
  } = params;

  const { isAuth, loading } = useContext(AuthContext);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const onesignal_push_id = queryParams.get('onesignal_push_id');

  if (onesignal_push_id) {
    localStorage.setItem("onesignal_push_id", onesignal_push_id);
  }

  if (!isAuth && isPrivate) {
    return (
      <>
        {loading && <BackdropLoading />}
        <Redirect to={{ pathname: "/login", state: { from: rest.location } }} />
      </>
    );
  }

  if (isAuth && !isPrivate) {
    return (
      <>
        {loading && <BackdropLoading />}
        <Redirect to={{ pathname: "/", state: { from: rest.location } }} />
      </>
    );
  }

  return (
    <>
      {loading && <BackdropLoading />}
      <RouterRoute {...rest} component={Component} />
    </>
  );
};

export default Route;
