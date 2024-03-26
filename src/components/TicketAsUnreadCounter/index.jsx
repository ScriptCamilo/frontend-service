import React, { useState } from "react";
import NotificationsIcon from "@material-ui/icons/Notifications";
import { Badge } from "@material-ui/core";

const TicketAsUnreadCounter = ({ counter, isActive }) => {
  return (
    <Badge
      // rectangle
      overlap="rectangular"
      badgeContent={counter}
      color="error"
      invisible={!isActive}
    >
      <NotificationsIcon
        style={{ color: counter > 0 && isActive ? "#4caf50" : "GrayText" }}
      />
    </Badge>
  );
};

export default TicketAsUnreadCounter;
