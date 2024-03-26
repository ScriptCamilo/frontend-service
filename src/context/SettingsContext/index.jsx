import React, { createContext, useContext } from "react";

import useSettings from "../../hooks/useSettings";

const SettingsContext = createContext();

/**
 * @typedef {object} SettingsContextReturn
 * @property {array<object>} settings
 * @property {boolean} settingLoading
 * @property {function} getSettingValue
 * @property {function} updateSetting
 *
 * @returns {SettingsContextReturn}
 */
export function useSettingsContext() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const settingsHook = useSettings();

  return (
    <SettingsContext.Provider value={{ ...settingsHook }}>
      {children}
    </SettingsContext.Provider>
  );
}
