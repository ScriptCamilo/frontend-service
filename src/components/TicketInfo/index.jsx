import React from "react";
import CopyToClipboard from "../CopyToClipboard";
import { Avatar, CardHeader, useMediaQuery, useTheme } from "@material-ui/core";

import { i18n } from "../../translate/i18n";

const   TicketInfo = ({ contact, ticket, onClick }) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

  return (
    <CardHeader
      onClick={onClick}
      style={{ cursor: "pointer" }}
      titleTypographyProps={{ noWrap: true }}
			subheaderTypographyProps={{ noWrap: !isMobile }}
      avatar={<Avatar src={contact.profilePicUrl || ""} alt="contact_image" />}
      title={
        <>
          <span>{`${contact.name} #${ticket.id}`}</span>
          <CopyToClipboard content={ticket.id} title="protocolo" />
        </>
      }
      subheader={
        ticket.user &&
        `${i18n.t("messagesList.header.assignedTo")} ${ticket.user.name} ${
          ticket.queue ? " | Setor: " + ticket.queue.name : " | Setor: Nenhum"
        }`
      }
    />
  );
};

export default TicketInfo;
