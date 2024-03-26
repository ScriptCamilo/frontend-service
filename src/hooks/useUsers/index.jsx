import { useCallback, useEffect, useReducer, useState } from "react";

import toastError from "../../errors/toastError";
import { dataReducer } from "../../reducers/data";
import api from "../../services/api";

function useUsers() {
  const [userLoading, setLoading] = useState(false);
  const [pageNumber, setUsersPageNumber] = useState(0);
  const [hasMoreUsers, setHasMore] = useState(false);
  const [users, dispatchUsers] = useReducer(dataReducer, []);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get("/users", {
        params: { pageNumber },
      });
      setHasMore(data.hasMore);
      dispatchUsers({ type: "LOAD_DATA", payload: data.users });

      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [pageNumber]);

  useEffect(() => {
    if (pageNumber > 0) {
      setLoading(true);
      fetchUsers();
    }
  }, [pageNumber, fetchUsers]);

  return {
    userLoading,
    users,
    hasMoreUsers,
    pageNumber,
    setUsersPageNumber,
		fetchUsers
  };
}

export default useUsers;
