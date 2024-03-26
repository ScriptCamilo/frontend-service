import React, { useState } from "react";
import MenuItem from "@material-ui/core/MenuItem";
import { Menu } from "@material-ui/core";
import NewTicketModalForSelectedContact from "../NewTicketModalForSelectedContact";

const NewTicketMenu = ({ message, menuOpen, handleClose, anchorEl }) => {
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);

  const handleCloseNewTicketModal = () => {
    handleClose();
    setNewTicketModalOpen(false);
  };

  return (
    <>
      <NewTicketModalForSelectedContact
        modalOpen={newTicketModalOpen}
        initialContact={message.contact}
        onClose={handleCloseNewTicketModal}
      />
      <Menu
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={menuOpen}
        onClose={handleClose}
      >
        {message.ticket?.isGroup && (
          <MenuItem
            onClick={() => {
              setNewTicketModalOpen(true);
            }}
          >
            Iniciar uma conversa
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default NewTicketMenu;
