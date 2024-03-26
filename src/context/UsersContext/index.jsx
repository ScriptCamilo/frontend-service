import React, { createContext, useContext } from "react";

import useUsers from "../../hooks/useUsers";

const UsersContext = createContext();

export function useUsersContext() {
  return useContext(UsersContext);
}

export function UsersProvider({ children }) {
  const usersHook = useUsers();

  return (
    <UsersContext.Provider value={{ ...usersHook }}>
      {children}
    </UsersContext.Provider>
  )
}
