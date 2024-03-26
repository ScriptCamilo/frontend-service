import React, { useCallback, useEffect, useState } from "react";

import { Box, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { DoneAll, MoreVert, Replay } from "@material-ui/icons";
import { useHistory } from "react-router-dom";

import { useAuthContext } from "../../context/Auth/AuthContext";
import { useSettingsContext } from "../../context/SettingsContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import EndTicketModal from "../EndTicketModal";
import QueueSelectModal from "../QueueSelectModal";
import ReopenTicketModal from "../ReopenTicketModal";
import TicketOptionsMenu from "../TicketOptionsMenu";
import TicketOptionsGroupMenu from "../TicketOptionsMenu/groups";
import TransferTicketModal from "../TransferTicketModal";

const useStyles = makeStyles((theme) => ({
  actionButtons: {
    marginRight: 6,
    flex: "none",
    alignSelf: "center",
    marginLeft: "auto",
    "& > *": {
      margin: theme.spacing(1),
    },
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      display: "flex",
      width: "100%",
    },
  },
  actionButtonsContainer: {
    display: "flex",
    alignItems: "center",
		columnGap: "10px",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
}));

const TicketActionButtons = ({
  ticket,
  checkedFinish,
  isQueueAutoFinishEnabled,
	checkedAbsenceMessage,
  onChangeFinish,
	onChangeAbsenceMessage,
  isMobile,
	viewAbsenceToggle,
	functionsDeleteTicketObject
}) => {
  const classes = useStyles();
  const history = useHistory();
  const { user, track } = useAuthContext();
  const { getSettingValue } = useSettingsContext();

  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
	const [openFromOptionsMenu, setOpenFromOptionsMenu] = useState(false);
  const [queueSelectModalOpen, setQueueSelectModalOpen] = useState(false);
  const [reopenTicketModalOpen, setReopenTicketModalOpen] = useState(false);
  const [queue, setQueue] = useState();
	const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);

  const ticketOptionsMenuOpen = Boolean(anchorEl);

  const getQueue = useCallback(async () => {
    if (ticket.queueId) {
      try {
        const { data } = await api.get(`/queue/${ticket.queueId}`);
        setQueue(data);
      } catch (err) {
        toastError(err);
      }
    }
  }, [ticket.queueId]);

  useEffect(() => {
    getQueue();
  }, [getQueue]);

  const handleOpenTicketOptionsMenu = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseTicketOptionsMenu = (e) => {
    setAnchorEl(null);
  };

  const handleCloseModal = () => {
    setOpen(false);
		setOpenFromOptionsMenu(false);
  };

	const handleFinishTicket = async () => {
    try {
      await api.put(`/tickets/${ticket.id}`, {
        status: "closed",
        sendSurvey: false,
      });
			handleCloseTicketOptionsMenu()
			functionsDeleteTicketObject[ticket.status](ticket.id);
    } catch (err) {
      toastError(err);
			handleCloseTicketOptionsMenu()
    }
  };

  const handleUpdateTicketStatus = async (
    e,
    status,
    userId,
    ticketId,
    sendSurvey
  ) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${ticketId}`, {
        status: status,
        userId: userId || null,
        sendSurvey: sendSurvey || false,
      });
			functionsDeleteTicketObject[ticket.status](ticket.id);
      setLoading(false);
      if (status === "open") {
        history.push(`/tickets/${ticketId}`);
      } else if (status === "closed") {
        track("Ticket Change", {
          Action: "End Ticket",
          Origin: "Modal",
        });
        getSettingValue("endTicket") === "enabled"
          ? setOpen(true)
          : history.push("/tickets");
      } else {
        history.push("/tickets");
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

	const handleOpenTransferModal = (e) => {
    setTransferTicketModalOpen(true);
  };

  const handleCloseTransferTicketModal = () => {
    setTransferTicketModalOpen(false);
  };


  return (
    <div className={classes.actionButtons}>
      <ReopenTicketModal
        modalOpen={reopenTicketModalOpen}
        onClose={() => setReopenTicketModalOpen(false)}
        ticket={ticket}
      />

      <QueueSelectModal
        modalOpen={queueSelectModalOpen}
        onClose={() => setQueueSelectModalOpen(false)}
        ticket={ticket}
				functionsDeleteTicketObject={functionsDeleteTicketObject}
      />

			<TransferTicketModal
        modalOpen={transferTicketModalOpen}
        onClose={handleCloseTransferTicketModal}
        ticketid={ticket.id}
        ticketWhatsappId={ticket.whatsappId}
        ticket={ticket}
      />

      {ticket ? (
        <EndTicketModal
          open={open || openFromOptionsMenu}
          handleClose={handleCloseModal}
          ticketId={ticket.id}
          queue={queue}
          motiveList={queue?.motives}
          contactId={ticket?.contact?.id}
          whatsappId={ticket.whatsappId}
          closeTicket={(e) => {
						if (open) {
							handleUpdateTicketStatus(e, "closed", user?.id, ticket.id, true)
						} else {
							handleFinishTicket()
						}
					}}
        />
      ) : null}

      {ticket.status === "closed" && (
        <>
          <ButtonWithSpinner
            loading={loading}
            startIcon={<Replay />}
            size="small"
            onClick={() => setReopenTicketModalOpen(true)}
          >
            {i18n.t("messagesList.header.buttons.reopen")}
          </ButtonWithSpinner>
          {!["facebook", "instagram"].includes(ticket.contact.channel) && (
            <>
              <IconButton onClick={handleOpenTicketOptionsMenu}>
                <MoreVert />
              </IconButton>
              <TicketOptionsMenu
                ticket={ticket}
                anchorEl={anchorEl}
                menuOpen={ticketOptionsMenuOpen}
                handleClose={handleCloseTicketOptionsMenu}
                onlyExport={true}
                checkedFinish={checkedFinish}
                isQueueAutoFinishEnabled={isQueueAutoFinishEnabled}
								checkedAbsenceMessage={checkedAbsenceMessage}
                onChangeFinish={onChangeFinish}
								onChangeAbsenceMessage={onChangeAbsenceMessage}
								viewAbsenceToggle={viewAbsenceToggle}
                isMobile={isMobile}
								setOpenFromOptionsMenu={setOpenFromOptionsMenu}
              />
            </>
          )}
        </>
      )}
      {ticket.status === "open" && (
        <Box className={classes.actionButtonsContainer}>
					{!isMobile && (
						<ButtonWithSpinner
							loading={loading}
							size="small"
							variant="contained"
							color="primary"
							onClick={handleOpenTransferModal}
						>
							{i18n.t("ticketOptionsMenu.transfer")}
						</ButtonWithSpinner>
					)}

          <ButtonWithSpinner
            loading={loading}
            size="small"
            variant="contained"
            color="primary"
            onClick={(e) => {
              getSettingValue("endTicket") === "enabled"
                ? setOpen(true)
                : handleUpdateTicketStatus(
                    e,
                    "closed",
                    user?.id,
                    ticket.id,
                    true
                  );
            }}
            // onClick={e => handleUpdateTicketStatus(e, "closed", user?.id, ticket.id)}
          >
            {isMobile ? (
              <DoneAll />
            ) : (
              i18n.t("messagesList.header.buttons.resolve")
            )}
          </ButtonWithSpinner>
          <IconButton onClick={handleOpenTicketOptionsMenu}>
            <MoreVert />
          </IconButton>

          <TicketOptionsMenu
            ticket={ticket}
            anchorEl={anchorEl}
            menuOpen={ticketOptionsMenuOpen}
            handleClose={handleCloseTicketOptionsMenu}
            checkedFinish={checkedFinish}
            isQueueAutoFinishEnabled={isQueueAutoFinishEnabled}
						checkedAbsenceMessage={checkedAbsenceMessage}
            onChangeFinish={onChangeFinish}
						onChangeAbsenceMessage={onChangeAbsenceMessage}
						viewAbsenceToggle={viewAbsenceToggle}
            isMobile={isMobile}
						setOpenFromOptionsMenu={setOpenFromOptionsMenu}
          />
        </Box>
      )}
      {ticket.status === "groups" && (
        <>
          <IconButton onClick={handleOpenTicketOptionsMenu}>
            <MoreVert />
          </IconButton>
          <TicketOptionsGroupMenu
            ticket={ticket}
            anchorEl={anchorEl}
            menuOpen={ticketOptionsMenuOpen}
            handleClose={handleCloseTicketOptionsMenu}
          />
        </>
      )}
      {ticket.status === "pending" && (
        <Box className={classes.actionButtonsContainer}>
					{!isMobile && (
						<ButtonWithSpinner
							loading={loading}
							size="small"
							variant="contained"
							color="primary"
							onClick={handleOpenTransferModal}
						>
							{i18n.t("ticketOptionsMenu.transfer")}
						</ButtonWithSpinner>
					)}

          <ButtonWithSpinner
            loading={loading}
            size="small"
            variant="contained"
            color="primary"
            onClick={(e) =>
              ticket.queueId
                ? handleUpdateTicketStatus(e, "open", user?.id, ticket.id)
                : setQueueSelectModalOpen(true)
            }
          >
            {i18n.t("messagesList.header.buttons.accept")}
          </ButtonWithSpinner>
          <IconButton onClick={handleOpenTicketOptionsMenu}>
            <MoreVert />
          </IconButton>
          <TicketOptionsMenu
            ticket={ticket}
            anchorEl={anchorEl}
            menuOpen={ticketOptionsMenuOpen}
            handleClose={handleCloseTicketOptionsMenu}
            ignoreExport={true}
            ignoreDelete={true}
            checkedFinish={checkedFinish}
            isQueueAutoFinishEnabled={isQueueAutoFinishEnabled}
						checkedAbsenceMessage={checkedAbsenceMessage}
            onChangeFinish={onChangeFinish}
						onChangeAbsenceMessage={onChangeAbsenceMessage}
						viewAbsenceToggle={viewAbsenceToggle}
            isMobile={isMobile}
						setOpenFromOptionsMenu={setOpenFromOptionsMenu}
          />
        </Box>
      )}
    </div>
  );
};

export default TicketActionButtons;
