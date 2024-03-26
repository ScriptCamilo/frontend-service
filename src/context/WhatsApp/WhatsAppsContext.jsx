import React, { createContext, useContext } from "react";

import useWhatsApps from "../../hooks/useWhatsApps";
import useMetas from "../../hooks/userMetas";

export const WhatsAppsContext = createContext();

export const WhatsAppsProvider = ({ children }) => {
  const { loading, whatsApps, whatsAppApis, getConnections } = useWhatsApps();
  const { metas, allMetas, getConnectionsMeta } = useMetas();

  return (
    <WhatsAppsContext.Provider
      value={{
        whatsApps,
        loading,
        metas,
        allMetas,
        whatsAppApis,
        getConnectionsMeta,
        getConnections,
      }}
    >
      {children}
    </WhatsAppsContext.Provider>
  );
};

export const useWhatsAppsContext = () => useContext(WhatsAppsContext);
