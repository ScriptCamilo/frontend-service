import React, { Fragment, useEffect, useState } from "react";

import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Select,
  Tooltip,
} from "@material-ui/core";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import InputLabel from "@material-ui/core/InputLabel";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { RefreshRounded } from "@material-ui/icons";
import CloseIcon from "@material-ui/icons/Close";
import ContactPhoneIcon from "@material-ui/icons/ContactPhone";
import CreateIcon from "@material-ui/icons/Create";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import RestoreIcon from "@material-ui/icons/Restore";
import { useParams } from "react-router-dom";

import { useAuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import { ContactForm } from "../ContactForm";
import ContactModal from "../ContactModal";
import CopyToClipboard from "../CopyToClipboard";
import ImageModal from "../ImageModal";
import MarkdownWrapper from "../MarkdownWrapper";
import ModalImage from "../ReactModalImage";
import { ExtraFieldsForm } from "./ExtraFieldsForm";
import { useStyles } from "./styles";
import GenerateTimeline from './utils/GenerateTimeLine';

const ContactDrawer = ({
  open,
  handleDrawerClose,
  contact,
  loading,
  setContact,
}) => {
  const classes = useStyles();
  const { ticketId } = useParams();
  const { users, user, track } = useAuthContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [fields, setFields] = useState([]);
  const [tab, setTab] = useState(0);
  const [contactInfos, setContactInfos] = useState(contact.extraInfo || []);
  const [selectedUser, setSelectedUser] = useState();
  const [disableRefresh, setDisableRefresh] = useState(false);
  const [ticketIds, setTicketIds] = useState([]);
	const [pageNumber, setPageNumber] = useState(1);
	const [hasReachedEnd, setHasReachedEnd] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [oldEndTickets, setOldEndTickets] = useState([]);
	const [allQueues, setAllQueues] = useState([]);

  const URL = window.location.href;

  const updateClientPocketing = async (userId) => {
    const data =
      userId !== undefined
        ? { ...contact, userId }
        : { ...contact, userId: null };

    if (contact.id) {
      await api.put(`/contacts/${contact.id}`, data);
      track(`Contact Attendant Change`, {
        "Contact Name": contact.name,
        Origin: `${URL.split("/")[3]}`,
      });
    }
  };

	const updateQueuePocketing = async (queueId) => {
    const data =
		queueId
        ? { ...contact, queueId }
        : { ...contact, queueId: null };
    if (contact.id) {
      try {
				await api.put(`/contacts/${contact.id}`, data);
			} catch (error) {
				toastError(error);
			}
    }
  };

  const getProfileContact = async (id) => {
    setDisableRefresh(true);
    try {
      await api.get(`/refresh-pic/${id}`);
    } catch {
      console.log("Impossível obter imagem de perfil");
    }
    setDisableRefresh(false);
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (!hasReachedEnd && scrollHeight - (scrollTop + 100) < clientHeight) {
      setPageNumber((prevPageNumber) => prevPageNumber + 1);
      setHasReachedEnd(true);
    } else if (hasReachedEnd && scrollHeight - (scrollTop + 100) >= clientHeight) {
      setHasReachedEnd(false);
    }
  };

  useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get('/queue');
				setAllQueues(data);
			} catch (error) {
				console.log(error);
			}
		})();
	}, []);

  useEffect(() => {
    setContactInfos(contact.extraInfo || []);
  }, [contact, handleDrawerClose]);

  useEffect(() => {
    (async () => {
      const { data: fields } = await api.get("/extrainfo/field");
      setFields(fields);
    })();
  }, []);

  useEffect(() => {
		setOldEndTickets([]);
		setPageNumber(1);
		setHasMore(true);
  }, [contact.id]);

  useEffect(() => {
    const ticketIdsArr = [];

    if (contact?.extraInfo) {
      contact.extraInfo.forEach((extraInfo) => {
        if (!ticketIdsArr.includes(extraInfo.ticketId)) {
          ticketIdsArr.push(extraInfo.ticketId);
        }
      });
    }

    setTicketIds(ticketIdsArr);
  }, [contact.extraInfo]);

  useEffect(() => {
    setOpenForm(false);
  }, [open, contact]);

  useEffect(() => {
    setSelectedUser(contact.userId ?? "");
  }, [contact.userId]);

	useEffect(() => {
		if (contact.extraInfo.length > 0 && hasMore) {
			(async () => {
				try {

					const { data } = await api.get('/end-tickets-filters', {
						params: {
							contactId: contact.id,
							pageNumber
						}
					})

					setHasMore(data.hasMore);

					setOldEndTickets((prevState) => {
						const extraFields = data.tickets.map((ticket) => {
							return {
								...ticket,
								extraInfo: contact.extraInfo.filter((info) => info.ticketId == ticket.ticketId)
							}
						}
						);

						return [
							...prevState,
							...extraFields
						];
					});

				} catch (error) {
					console.log('error', error);
				}
			})()
		}

	}, [pageNumber, hasMore, setHasMore, setOldEndTickets, contact.extraInfo]);

  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="right"
      open={open}
      PaperProps={{ style: { position: "absolute" } }}
      BackdropProps={{ style: { position: "absolute" } }}
      ModalProps={{
        container: document.getElementById("drawer-container"),
        style: { position: "absolute" },
      }}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <div className={classes.header}>
        <IconButton
          onClick={() => {
            handleDrawerClose();
          }}
          style={{ position: "absolute" }}
        >
          <CloseIcon />
        </IconButton>
        <Typography
          style={{
            margin: "auto",
            fontWeight: "500",
            textTransform: "uppercase",
          }}
        >
          Informações de contato
        </Typography>
      </div>
      {loading ? (
        <ContactDrawerSkeleton classes={classes} />
      ) : (
        <div className={classes.content}>
          <Card className={classes.contactCard}>
            {contact.profilePicUrl ? (
              <ModalImage
                className={classes.cover}
                smallSrcSet={`${contact.profilePicUrl}`}
                medium={`${contact.profilePicUrl}`}
                large={`${contact.profilePicUrl}`}
                showRotate={true}
              />
            ) : (
              <ModalImage
                className={classes.cover}
                smallSrcSet={`/user.png`}
                medium={`/user.png`}
                large={`/user.png`}
              />
            )}
            <Tooltip title="Atualizar Perfil">
              <IconButton
                disabled={disableRefresh}
                style={{
                  position: "absolute",
                  bottom: "35px",
                  left: "130px",
                  padding: 0,
                }}
              >
                <RefreshRounded
                  onClick={() => getProfileContact(ticketId)}
                  style={{
										fontSize: 30,
                    color: "white",
										background: "#0009",
                    borderRadius: "50%",
                  }}
                />
              </IconButton>
            </Tooltip>
            <div className={classes.details}>
              <CardContent className={classes.cardContent}>
                <Typography
                  style={{ whiteSpace: "break-spaces" }}
                  component="h6"
                  variant="h6"
                >
                  {contact.name.slice(0, 18) || ""}
                  <Tooltip title="Editar contato">
                    <CreateIcon
                      onClick={() => setModalOpen(true)}
                      style={{ fontSize: 16, marginLeft: 5, cursor: "pointer" }}
                    />
                  </Tooltip>
                  <CopyToClipboard content={contact.name} title="nome" />
                </Typography>
                <Typography variant="subtitle1" color="primary">
                  {contact.number || ""}

                  <CopyToClipboard content={contact.number} title="número" />
                </Typography>
                <Divider style={{ margin: "8px" }} />
                <Typography
                  component="div"
                  noWrap
                  style={{
                    paddingTop: 2,
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
										flexDirection: 'column',
										gap: '5px'
                  }}
                >
                  {user.profile === "admin" ||
                  !contact.userId ||
                  contact.userId === user.id ? (
										<>
										<InputLabel
												style={{
													fontSize: "1.0rem",
													color: "#000",
													width: "100%",
													textAlign: "center",
												}}
											>
												Atendente recorrente
											</InputLabel>

											<Select
												variant="outlined"
												value={selectedUser}
												onChange={(e) => {
													setSelectedUser(e.target.value);
												}}
												style={{
													paddingTop: 2,
													minWidth: "50%",
													textAlign: "center",
													fontSize: "0.8rem",
													height: "3em",
													width: "100%",
												}}
											>
												<MenuItem value={""}>&nbsp;</MenuItem>
												<MenuItem
													value=""
													onClick={() => updateClientPocketing(null)}
												>
													Não atribuido
												</MenuItem>
												{user.profile === "admin"
													? users.users?.map((user) => (
															<MenuItem
																key={user.id}
																value={user.id}
																onClick={() => updateClientPocketing(user.id)}
															>
																{user.name}
															</MenuItem>
														))
													: users.users
															?.filter((userFilter) => user.id === userFilter.id)
															.map((user) => (
																<MenuItem
																	key={user.id}
																	value={user.id}
																	onClick={() => updateClientPocketing(user.id)}
																>
																	{user.name}
																</MenuItem>
															))}
											</Select>

											<InputLabel
												style={{
													fontSize: "1.0rem",
													color: "#000",
													width: "100%",
													textAlign: "center",
												}}
											>
												Setor recorrente
											</InputLabel>

											<Select
												variant="outlined"
												onChange={({target: { value }}) => {
													if (value === "") return updateQueuePocketing(value);
													return updateQueuePocketing(value)
												}}
												defaultValue={contact.queueId || ""}
												style={{
													paddingTop: 2,
													minWidth: "50%",
													textAlign: "center",
													fontSize: "0.8rem",
													height: "3em",
													width: "100%",
												}}
											>
												<MenuItem
													value=""
												>
													Não atribuido
												</MenuItem>
												{allQueues?.map((queue) => (
													<MenuItem
														key={queue.id}
														value={queue.id}
													>
														{queue.name}
													</MenuItem>
												))}
											</Select>
										</>
                  ) : (
                    <MarkdownWrapper>{`${
                      contact.userId
                        ? users.users?.find(
                            (user) => user.id === contact.userId
                          ).name
                        : "Não"
                    }`}</MarkdownWrapper>
                  )}
                </Typography>
              </CardContent>
            </div>
          </Card>

          {contact.id && openForm && (
            <ContactForm
              initialContact={contact}
              onCancel={() => setOpenForm(false)}
            />
          )}
          {/* </Paper> */}
          <Paper className={classes.contactDetails}>
            <ContactModal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              contactId={contact.id}
            ></ContactModal>

            {tab === 0 && (
              // EXTRA FIELDS
              <>
                <h4 className={classes.ticketHistoryTitle}>
                  Campos personalizados do contato
                </h4>

                <ExtraFieldsForm
                  contact={contact}
                  setContact={setContact}
                  fields={fields.filter(
                    (field) =>
                      field.context === "contact" || field.context === ""
                  )}
                  setFields={setFields}
                  contactInfos={contactInfos}
                  setContactInfos={setContactInfos}
                  contactDraweOpen={open}
                />

                <h4 className={classes.ticketHistoryTitle}>
                  {`Campos personalizados do ticket ${ticketId}`}
                </h4>

                <ExtraFieldsForm
                  contact={{
                    ...contact,
                    extraInfo: contact?.extraInfo?.filter(
                      (info) => info.ticketId == ticketId
                    ),
                  }}
                  setContact={setContact}
                  fields={fields.filter((field) => field.context === "ticket")}
                  setFields={setFields}
                  contactInfos={contactInfos.filter(
                    (info) => info.ticketId === ticketId
                  )}
                  setContactInfos={setContactInfos}
                  ticketId={ticketId}
                  contactDraweOpen={open}
                />

                {ticketIds.length > 0 && (
                  <h4 className={classes.ticketHistoryTitle}>
                    {`Campos personalizados dos tickets anteriores`}
                  </h4>
                )}

								<div onScroll={handleScroll} className={classes.ticketsView}>
                	{oldEndTickets
										.sort(function (a, b) {
											return b.ticketId - a.ticketId;
										})
										.map((oldEndTicket) => {
											return (
												<div
													key={oldEndTicket.ticketId}
													className={classes.extraInfoBlock}
												>
													<Typography
														className={classes.extraInfoName}
													>{`Ticket ${oldEndTicket.ticketId}:`}</Typography>

													<Typography>
														Data de criação:{" "}
														{`
														  ${new Date(oldEndTicket.ticket.createdAt).toLocaleDateString()} -
														  ${new Date(oldEndTicket.ticket.createdAt).toLocaleTimeString()}`
														}
													</Typography>

													{oldEndTicket.extraInfo?.map((extraInfo) => {
														return (
															<Fragment key={extraInfo.id}>
																{extraInfo?.path ? (
																	<Box display="flex" alignItems="center">
																		{/* name captilize */}error.response
																		<Typography>{`${extraInfo?.name}: `}</Typography>
																		<ImageModal imageUrl={extraInfo?.path} />
																		<Typography>{`${extraInfo?.value}`}</Typography>
																	</Box>
																) : (
																	<Typography>{`${extraInfo?.name}: ${extraInfo?.option?.value}`}</Typography>
																)}
															</Fragment>
														);
													})}

													<Typography>
														Motivo de finalização:{" "}
														{oldEndTicket.option || "N/A"}
													</Typography>

													<Divider className={classes.extraInfoDivider} />
												</div>
											);
										})
									}
								</div>
              </>
            )}

            {tab === 1 && (
              // TICKET ACTIONS
              <>
                <div className={classes.actionsBox}>
                  <h3 className={classes.ticketHistoryTitle}>
                    Histórico do ticket
                  </h3>
                  <Box className={classes.actionsDiv}>
                    {<GenerateTimeline isTicketActions contactId={contact.id} open={open} />}
                  </Box>
                </div>
              </>
            )}

            {tab === 2 && (
              // CONTACT ACTIONS
              <div className={classes.actionsBox}>
                <h3 className={classes.ticketHistoryTitle}>
                  Histórico do contato
                </h3>
                <Box className={classes.actionsDiv}>
                  {user.profile === "admin" && <GenerateTimeline contactId={contact.id} open={open} />}
                </Box>
              </div>
            )}
          </Paper>

          <BottomNavigation
            value={tab}
            onChange={(event, newValue) => {
              setTab(newValue);
            }}
            showLabels
            className={classes.bottomNav}
          >
            <BottomNavigationAction
              label="Campos Personalizados"
              icon={<ContactPhoneIcon />}
            />
            <BottomNavigationAction
              label="Histórico do Ticket"
              icon={<RestoreIcon />}
            />
            <BottomNavigationAction
              label="Histórico do Contato"
              icon={<MenuBookIcon />}
            />
          </BottomNavigation>
        </div>
      )}
    </Drawer>
  );
};

export default ContactDrawer;
