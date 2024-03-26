import React, { useEffect, useState } from "react";

import { makeStyles, Switch } from "@material-ui/core";
import { toast } from "react-toastify";

import { useAuthContext } from "../../context/Auth/AuthContext";
import { useSettingsContext } from '../../context/SettingsContext';
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import AllowedUsersDropdown from "../AllowedUsersDropdown";

const useStyles = makeStyles((theme) => ({
  allowedUsersDropdown: {
    width: "400px",
    padding: "0 1em",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },

  switch_track: {
    backgroundColor: "#afafaf",
  },
  switch_base: {
    color: "#ffffff",
    "&.Mui-disabled": {
      color: "#828282",
    },
    "&.Mui-checked": {
      color: "#27ff52",
    },
    "&.Mui-checked + .MuiSwitch-track": {
      backgroundColor: "#049d23",
    },
  },
  switch_primary: {
    "&.Mui-checked": {
      color: "#2576d2",
    },
    "&.Mui-checked + .MuiSwitch-track": {
      backgroundColor: "#2576d2",
    },
  },
}));

const UsersDistribution = (props) => {
  const classes = useStyles();
  const { user, onlineUsers, users } = useAuthContext();
  const { getSettingValue } = useSettingsContext();

  const [adminUser, setAdminUser] = useState(false);
  const [distribution, setDistribution] = useState(getSettingValue("distributionOn") === "true");

  const usersIdOnline = getSettingValue("usersIdOnline");

  const handleDistributionOn = async () => {
    setDistribution(!distribution);

    const settingKey = "distributionOn";
    const value = `${!distribution}`;
    try {
      await api.put(`/settings/${settingKey}`, {
        value: value,
      });
      toast.success(i18n.t("settings.success"));
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    if (user.profile === "admin") {
      setAdminUser(true);
    }
  }, [user.profile]);

  return (
    <>
      {adminUser && (
        <div className={classes.allowedUsersDropdown}>
          <p>Distribuição automática</p>
          <AllowedUsersDropdown
            users={users}
            usersIdOnline={usersIdOnline}
            setDistribution={setDistribution}
          />
          <Switch
            classes={{
              track: classes.switch_track,
              switchBase: classes.switch_base,
              colorPrimary: classes.switch_primary,
            }}
            disabled={onlineUsers.length === 0 ? true : false}
            checked={distribution}
            onChange={handleDistributionOn}
            inputProps={{ "aria-label": "controlled" }}
          />
        </div>
      )}
    </>
  );
};

export default UsersDistribution;
