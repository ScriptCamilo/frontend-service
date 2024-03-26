import React, { useEffect, useState } from "react";

import { useNoticesContext } from "../../context/Notices";
import Header from "./Header";
import Popup from "./Popup";

function Notice() {
  const { notices, dispatchNotices, markNoticeAsRead } = useNoticesContext();
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const isPopup = notices[0]?.type === "popup";

  const handleCloseNotice = () => {
    setIsNoticeOpen(false);
    markNoticeAsRead(notices[0].id);
    dispatchNotices({ type: "DELETE_DATA", payload: notices[0].id });
  };

  useEffect(() => {
    if (notices.length) {
      setTimeout(() => setIsNoticeOpen(true), 500);
    }
  }, [notices]);

  if (!isNoticeOpen) return <></>;

  return isPopup
    ? <Popup notice={notices[0]} handleClose={handleCloseNotice} />
    : <Header notice={notices[0]} handleClose={handleCloseNotice} />;
}

export default Notice;
