import { IconButton, Paper } from "@material-ui/core";
import React, { useState } from "react";
import getActionMessage from "./getActionMessage";
import { useStyles } from "./UserActionDetails.styles";
import ListIcon from "@material-ui/icons/List";
import ModifiedModal from "./ModifiedModal";

const UserActionDetails = ({ userAction }) => {
  const { small, paperContainer, paperContent } = useStyles();
  const [modifiedModalOpen, setModifiedModalOpen] = useState(false);

  const actionMessage = getActionMessage(userAction);
  return (
    <Paper className={paperContainer}>
      {userAction.action === "mass closing" && modifiedModalOpen && (
        <ModifiedModal
          actionId={userAction.id}
          open={modifiedModalOpen}
          handleClose={() => setModifiedModalOpen(false)}
        />
      )}

      <i className={small}>
        {userAction.ticketId && `Ticket ${userAction.ticketId}`}
      </i>
      <span>
        <p
          className={paperContent}
          style={{
            textAlign: "center",
          }}
        >
          {actionMessage}

          {userAction.action === "mass closing" && (
            <IconButton
              onClick={() => setModifiedModalOpen(true)}
              style={{
                marginLeft: "auto",
              }}
            >
              <ListIcon />
            </IconButton>
          )}
        </p>
      </span>
    </Paper>
  );
};

export default UserActionDetails;
