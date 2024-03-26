import React, { createContext, useContext } from "react";

import useNotices from "../../hooks/useNotices";

const NoticesContext = createContext();

export function useNoticesContext() {
  return useContext(NoticesContext);
}

export function NoticesProvider({ children }) {
  const noticeHook = useNotices();

  return (
    <NoticesContext.Provider value={{ ...noticeHook }}>
      {children}
    </NoticesContext.Provider>
  )
}
