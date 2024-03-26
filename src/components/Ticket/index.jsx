import React, { useCallback, useEffect, useState } from "react";

import {
  ClickAwayListener,
  FormControlLabel,
  Paper,
  Switch,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import clsx from "clsx";
import { useHistory, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuthContext } from "../../context/Auth/AuthContext";
import { ReplyMessageProvider } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import Loading from "../../pages/Loading";
import NotFound from "../../pages/NotFound";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import ContactDrawer from "../ContactDrawer";
import MessageInput from "../MessageInput/";
import MessagesList from "../MessagesList";
import ScheduleModal from "../ScheduleModal";
import TicketActionButtons from "../TicketActionButtons";
import TicketHeader from "../TicketHeader";
import TicketInfo from "../TicketInfo";
import { useStyles } from "./styles";
// import useMixpanel from "../../hooks/useMixpanel";

const Ticket = ({ functionsDeleteTicketObject }) => {
  const { ticketId } = useParams();
  const history = useHistory();
  const classes = useStyles();
  const { user, track } = useAuthContext();

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({});
  const [ticket, setTicket] = useState({});
  const [clientTags, setClientTags] = useState([]);
  const [tagDropdown, setTagDropdown] = useState(false);
  const [tagOptions, setTagOptions] = useState([]);
  const [isAutoFinishEnabled, setIsAutoFinishEnabled] = useState(false);
	const [absenceMessageDisabled, setAbsenceMessageDisabled] = useState(false);
	const [viewAbsenceToggle, setViewAbsenceToggle] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get(`/tickets/verifyAbsenceMessageDisabled`, {
					params: {
						ticketId
					}
				});
				setViewAbsenceToggle(data.isPeriodForAbsenceMessage);
			} catch (error) {
				console.log('error', error);
			}
		})()
	}, [ticketId]);

  const handleAutoFinishSwitch = useCallback(async () => {
    try {
      setIsAutoFinishEnabled((prevState) => !prevState);
      await api.put(`/tickets/${ticketId}`, {
        enableAutoFinish: !isAutoFinishEnabled,
      });
      toast.success("Ticket atualizado com sucesso!");
    } catch (error) {
      setIsAutoFinishEnabled((prevState) => !prevState);
      toastError("Houve um erro ao atualizar auto finalização de Ticket");
    }
  }, [ticketId, isAutoFinishEnabled]);

	const handleAbsenceMessageDisabledSwitch = useCallback(async () => {
    try {
      setAbsenceMessageDisabled((prevState) => !prevState);
      await api.put(`/tickets/${ticketId}`, {
        absenceMessageDisabled: absenceMessageDisabled,
      });
      toast.success("Ticket atualizado com sucesso!");
    } catch (error) {
      setAbsenceMessageDisabled((prevState) => !prevState);
      toastError("Houve um erro ao atualizar a mensagem de ausência do Ticket");
    }
  }, [ticketId, absenceMessageDisabled]);

  const handleToggleScheduleModal = useCallback(() => {
    setScheduleModalOpen((isOpen) => !isOpen);
  }, []);

  const handleDrawerOpen = useCallback(() => {
    setDrawerOpen(true);
    localStorage.setItem("contactDrawer", true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    localStorage.setItem("contactDrawer", false);
  }, []);

  const showTagOptions = useCallback((tagDropdown) => {
    setTagDropdown(!tagDropdown);
  }, []);

  const addNewTag = useCallback(
    async (tag) => {
      await api.post(`/tags/${contact.id}`, {
        tagId: tag.id,
        ticketId: ticket.id,
      });
      track("Tag Use", {
        Action: "Added to Contact",
      });
      setClientTags([...clientTags, tag]);
      // setTagOptions(tagOptions.filter(tagItem => tagItem.id !== tag.id))
    },
    [ticket, contact, clientTags]
  );

  const removeTag = useCallback(
    async (tag) => {
      await api.put(`/tags/remove-tag/${contact.id}`, {
        tagId: tag.id,
        ticketId: ticket.id,
      });
      track("Tag Use", {
        Action: "Removed from Contact",
      });
      setClientTags(clientTags.filter((tagItem) => tagItem.id !== tag.id));
      // setTagOptions([...tagOptions, tag])
    },
    [ticket, contact, clientTags]
  );

  useEffect(() => {
    const showAllTicketsLs = localStorage.getItem("contactDrawer");

    if (showAllTicketsLs === "true") {
      setTimeout(() => {
        setDrawerOpen(true);
      }, 1000);
    } else {
      setTimeout(() => {
        setDrawerOpen(false);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("contactDrawer") === "true") {
      setDrawerOpen(true);
    }
    // localStorage.setItem("contactDrawer", !drawerOpen);
  }, [ticketId]);

  useEffect(() => {
    const getTags = async () => {
      const { data } = await api.get("/tags");
      setTagOptions(data);
    };
    getTags();
  }, []);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchTicket = async () => {
        try {
          const { data } = await api.get("/tickets/" + ticketId);

          setContact(data.contact);
          setTicket(data);
					setAbsenceMessageDisabled(!data.absenceMessageDisabled);
          setIsAutoFinishEnabled(
            data.enableAutoFinish ?? Boolean(data.queue?.autoFinishSeconds)
          );
          // setClientTags(data.contact.tags)
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchTicket();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [ticketId, history, drawerOpen]);

  useEffect(() => {
    setClientTags(ticket.contact?.tags);
  }, [ticket]);

  useEffect(() => {
    const socket = openSocket({
      scope: "ticket",
      userId: user.id,
      component: "Ticket",
    });

    socket.on(`connect`, () => socket.emit("joinChatBox", ticketId));

    socket.on(`${user?.companyId}-ticket`, async (data) => {
      if (data.ticket && Number(ticketId) !== Number(data.ticket.id)) return;

      if ((data.action === "update") || (data.action === "autoFinish")) {
        const {
          data: { contact },
        } = await api.get("/tickets/" + ticketId);

        setContact(contact);
        setTicket(data.ticket);
      }

      if (data.action === "delete") {
        toast.success("Ticket deleted sucessfully.");
        history.push("/tickets");
      }
    });

    socket.on(`${user?.companyId}-contact`, (data) => {
      if (data.action === "update") {
        setContact((prevState) => {
          if (prevState.id === data.contact?.id) {
            return { ...prevState, ...data.contact, extraInfo: [ ...(prevState.extraInfo || []) ] };
          }
          return prevState;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId, history]);

  return (
    <>
      {contact.name ? (
        <div className={classes.root} id="drawer-container">
          <div className={classes.userTagsContainer}>
            {clientTags?.length > 0 &&
              clientTags.map((tag) => (
                <button
                  className={classes.userTags}
                  style={{
                    background: tag.color,
                    border: `1px solid ${tag.color}`,
                  }}
                  onClick={() => removeTag(tag)}
                >
                  {`${tag.name} x`}
                </button>
              ))}
            <ClickAwayListener onClickAway={() => setTagDropdown(false)}>
              <button
                className={classes.addTagButton}
                onClick={() => showTagOptions(tagDropdown)}
              >
                +
                <div className={classes.tagsDropdown}>
                  {tagDropdown &&
                    tagOptions.map((tag) => (
                      <button
                        style={{ background: tag.color }}
                        className={classes.buttonDropdown}
                        onClick={() => addNewTag(tag)}
                      >
                        {tag.name}
                      </button>
                    ))}
                </div>
              </button>
            </ClickAwayListener>
          </div>
          <Paper
            variant="outlined"
            elevation={0}
            className={clsx(classes.mainWrapper, {
              [classes.mainWrapperShift]: drawerOpen,
            })}
          >
            <TicketHeader loading={loading}>
              <div className={classes.ticketInfo}>
                <TicketInfo
                  contact={contact}
                  ticket={ticket}
                  onClick={handleDrawerOpen}
                />
              </div>
              <div className={classes.ticketActionButtons}>
                <TicketActionButtons
                  ticket={ticket}
                  checkedFinish={isAutoFinishEnabled}
                  isQueueAutoFinishEnabled={ticket?.queue?.autoFinishSeconds && ticket.status === "open"}
									checkedAbsenceMessage={absenceMessageDisabled}
                  onChangeFinish={handleAutoFinishSwitch}
									onChangeAbsenceMessage={handleAbsenceMessageDisabledSwitch}
									viewAbsenceToggle={viewAbsenceToggle}
                  isMobile={isMobile}
									functionsDeleteTicketObject={functionsDeleteTicketObject}
                />
              </div>

							{!isMobile && viewAbsenceToggle && ticket.status !== 'closed' && ticket.status !== 'groups' && !ticket.isGroup && (
								<FormControlLabel
									label="Mensagem de ausência"
									control={
										<Switch
											checked={absenceMessageDisabled}
											onChange={handleAbsenceMessageDisabledSwitch}
											color="primary"
											name="autoFinish"
										/>
									}
								/>
							)}

              {!isMobile &&
                ticket?.queue?.autoFinishSeconds &&
                ticket.status === "open" && (
                  <FormControlLabel
                    label="Finalização automática"
                    control={
                      <Switch
                        checked={isAutoFinishEnabled}
                        onChange={handleAutoFinishSwitch}
                        color="primary"
                        name="autoFinish"
                      />
                    }
                  />
              )}
            </TicketHeader>

            <ScheduleModal
              open={scheduleModalOpen}
              onClose={handleToggleScheduleModal}
              aria-labelledby="form-dialog-title"
              ticket={ticket}
            />

            <ReplyMessageProvider>
              <MessagesList
                ticketId={ticketId}
                isGroup={ticket.isGroup}
                contactModalOpen={drawerOpen}
              ></MessagesList>
              {scheduleModalOpen || ticket.status === "pending" || ticket.status === 'closed' ? (
                <></>
              ) : (
                <MessageInput
                  key={ticketId}
                  ticket={ticket}
                  handleOpenScheduleModal={handleToggleScheduleModal}
                />
              )}
            </ReplyMessageProvider>
          </Paper>
          {contact.name && (
            <ContactDrawer
              open={drawerOpen}
              handleDrawerClose={handleDrawerClose}
              contact={contact}
              setContact={setContact}
              loading={loading}
              ticketId={ticketId}
            />
          )}
        </div>
      ) : loading ? (
        <Loading />
      ) : (
        <NotFound />
      )}
    </>
  );
};

export default Ticket;
