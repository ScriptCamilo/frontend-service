import { useCallback, useEffect, useReducer, useState } from "react";

import { toast } from 'react-toastify';

import { getBackendUrlV1 } from "../../config";
import { useAuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import { dataReducer } from "../../reducers/data";
import api from "../../services/api";
import { i18n } from '../../translate/i18n';

function useSettings() {
  const [settings, dispatchSettings] = useReducer(dataReducer, []);
  const { isAuth, setTimeoutUnqueued } = useAuthContext();

  const [settingLoading, setLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const events = new EventSource(`${getBackendUrlV1()}/settings`, {
        withCredentials: true
      });
      events.addEventListener("all-settings", (event) => {
        const data = JSON.parse(event.data);
        dispatchSettings({ type: "LOAD_DATA", payload: data });
      });
      events.addEventListener("update-setting", (event) => {
        const data = JSON.parse(event.data);
        dispatchSettings({ type: "UPDATE_DATA", payload: data });
      });
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSettingValue = useCallback((key) => {
    const setting = settings.find((setting) => setting.key === key);
    return setting?.value;
  }, [settings]);

  const updateSetting = useCallback(async (key, value) => {
    try {
      await api.put(`/settings/${key}`, {
        value,
      });
      toast.success(i18n.t("settings.success"));
    } catch (err) {
      toastError(err);
    }
  });

  useEffect(() => {
    if (isAuth) {
      fetchSettings();
    }
  }, [isAuth, fetchSettings]);

  useEffect(() => {
    if (settings.length) {
      const timer = getSettingValue('timeCreateNewTicket');
      setTimeoutUnqueued(Number(timer));
    }
  }, [setTimeoutUnqueued, settings, getSettingValue]);

  return {
    settingLoading,
    settings,
    getSettingValue,
    updateSetting
  };
}

export default useSettings;
