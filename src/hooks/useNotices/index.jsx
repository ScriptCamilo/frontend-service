import { parseCookies, setCookie } from "nookies";
import { useCallback, useEffect, useReducer } from "react";

import { getBackendUrlV1 } from '../../config';
import toastError from "../../errors/toastError";
import { dataReducer } from "../../reducers/data";

const cookieOptions = {
  path: "/",
  domain: ".deskrio.com.br",
  secure: true,
  sameSite: "none",
};

function useNotices() {
  const [notices, dispatchNotices] = useReducer(
    dataReducer,
    []
  );

  const fetchNewNotices = useCallback(async () => {
    try {
      const events = new EventSource(`${getBackendUrlV1()}/new-notices`, {
        withCredentials: true
      });

      events.addEventListener('all-notices', event => {
        const data = JSON.parse(event.data);
        dispatchNotices({ type: 'LOAD_DATA', payload: data });
      });

      events.addEventListener('new-notice', event => {
        const data = JSON.parse(event.data);
        dispatchNotices({ type: 'LOAD_DATA', payload: [data] });
      });
    } catch (err) {
      if (err.message !== "Request failed with status code 400") {
        toastError(err);
      }
    }
  }, []);

  const markNoticeAsRead = (noticeId) => {
    const { closedNotices } = parseCookies();

    if (closedNotices) {
      const noticeIds = new Set(JSON.parse(closedNotices));
      noticeIds.add(+noticeId);
      return setCookie(
        null,
        "closedNotices",
        JSON.stringify(Array.from(noticeIds)),
        cookieOptions
      );
    }

    return setCookie(null, "closedNotices", JSON.stringify([noticeId]), cookieOptions);
  };

  useEffect(() => {
    fetchNewNotices();
  }, [fetchNewNotices]);

  return { notices, dispatchNotices, markNoticeAsRead };
}

export default useNotices;
