import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Popper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import Badge from "@material-ui/core/Badge";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputBase from "@material-ui/core/InputBase";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import ArrowDown from "@material-ui/icons/ArrowDropDown";
import ArrowUp from "@material-ui/icons/ArrowDropUp";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import CloseIcon from "@material-ui/icons/Close";
import FilterListIcon from "@material-ui/icons/FilterList";
import ForumOutlinedIcon from "@material-ui/icons/ForumOutlined";
import Groups from "@material-ui/icons/Group";
import SearchIcon from "@material-ui/icons/Search";
import { useHistory, useLocation } from "react-router-dom";

import { useAuthContext } from "../../context/Auth/AuthContext";
import { useSettingsContext } from "../../context/SettingsContext";
import { i18n } from "../../translate/i18n";
import NewTicketModal from "../NewTicketModal";
import { SearchBox } from "../SearchBox";
import TabPanel from "../TabPanel";
import TicketAsUnreadCounter from "../TicketAsUnreadCounter";
import TicketsFilters from "../TicketsFilters";
import TicketsList from "../TicketsList";
import TicketsQueueSelect from "../TicketsQueueSelect";
import TicketsUserSelect from "../TicketsUserSelect";
import UnreadTicketsList from "../UnreadTicketsList";
import { useStyles } from "./styles";

const TicketsManager = ({ setFunctionsDeleteTicketObject }) => {
  const searchInputRef = useRef();
  const classes = useStyles();
  const history = useHistory();
  const { pathname } = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("xs"));
  const { getSettingValue } = useSettingsContext();
  const {
    user,
    users,
    tags,
    getTags,
    connections,
    connectionsApi,
    connectionsMeta,
    getConnections,
    track,
  } = useAuthContext();

  const userQueueIds = user.queues.map((q) => q.id);

  const [searchParam, setSearchParam] = useState("");
  const [subTabSearchParam, setSubTabSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen, setTabOpen] = useState("open");
  const [previousTab, setPreviousTab] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [previousTicketModalOpen, setPreviousTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
  const [selectedUsersIds, setSelectedUsersIds] = useState([]);
  const [selectedMains, setSelectedMains] = useState(["Nome"]);
  const [selectedStatus, setSelectedStatus] = useState([
    "open",
    "pending",
    "closed",
  ]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [selectedWhatsappsIds, setSelectedWhatsappsIds] = useState(
    user?.whatsapps?.map((c) => c.id) || []
  );
  const [selectedWhatsappApisIds, setSelectedWhatsappApisIds] = useState(
    user?.whatsappApis?.map((c) => c.id) || []
  );
  const [selectedMetasIds, setSelectedMetasIds] = useState(
    user?.metas?.map((c) => c.id) || []
  );
  const [dateInterval, setDateInterval] = useState(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const lastMonth = String(today.getMonth()).padStart(2, "0");
    const currentMonth = String(today.getMonth() + 1).padStart(2, "0");

    const startDate = new Date(
      `${currentYear}-${lastMonth}-${today.getDate()}`
    );
    const endDate = new Date(
      `${currentYear}-${currentMonth}-${today.getDate()}`
    );

    return { startDate, endDate };
  });

  const [searchClicked, setSearchClicked] = useState(0);
  const [unreadTabActive, setUnreadTabActive] = useState(false);
  const [toggleFilters, setToggleFilters] = useState(false);
  const [selectedReference, setSelectedReference] = useState("updatedAt");
  const [anchorEl, setAnchorEl] = useState(null);
  const [previousAnchorEl, setPreviousAnchorEl] = useState(null);
  const [statusSearch, setStatusSearch] = useState("open");
  const [popperHidden, setPopperHidden] = useState(false);
  const [arrowAnswering, setArrowAnswering] = useState("DESC");
  const [arrowWaiting, setArrowWaiting] = useState("DESC");

  const isGroupsEnabled = getSettingValue("showGroupsPage") === "true";
  const URL = window.location.href;

  const searchHandleClick = useCallback((event) => {
    // take parent anchor element
    setPopperHidden(false);
    setAnchorEl(
      event.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode
        .parentNode
    );
  }, []);

  const toggleShowAllTickets = useCallback(() => {
    if (showAllTickets) {
      setSelectedUsersIds([user.id]);
    } else {
      setSelectedUsersIds(users.users?.map((u) => u.id));
    }
    setShowAllTickets(!showAllTickets);
  }, [showAllTickets, user, users]);

  const handleSearch = useCallback(
    (e) => {
      const searchedTerm = e.target.value.toLowerCase();

      if (tab === "search") {
        setSearchParam(searchedTerm);
      }
    },
    [tab]
  );

  const handleChangeTab = useCallback((_e, newValue) => {
    setTab(newValue);
  }, []);

  const handleChangeTabOpen = useCallback(
    (_e, newValue) => {
      setTabOpen(newValue);
      if (tabOpen !== newValue) {
        setAnchorEl(null);
        setPopperHidden(false);
      }
    },
    [tabOpen]
  );

  const applyPanelStyle = useCallback(
    (status) => {
      if (tabOpen !== status) {
        return { width: 0, height: 0 };
      }
    },
    [[tabOpen]]
  );

  const handleCloseOrOpenTicket = useCallback(
    (ticket) => {
      setNewTicketModalOpen(false);
      if (ticket) {
        history.push(`/tickets/${ticket.id}`);
      }
    },
    [history]
  );

  const handleToggleUnreadTab = useCallback(() => {
    if (tabOpen !== "unread") {
      setTabOpen("unread");
      setUnreadTabActive(true);
    } else {
      setTabOpen("open");
      setUnreadTabActive(false);
    }
  }, [tabOpen]);

  useEffect(() => {
    if (tab === "closed" && previousTab !== tab) {
      track("Tickets SubPage View", {
        SubPage: "Closed Tickets",
      });
      setPreviousTab(tab);
    }
  }, [previousTab, tab, track]);

  useEffect(() => {
    if (anchorEl !== null && previousAnchorEl === null) {
      track("Ticket Modal Filter Change", {
        Action: "Open Filter",
      });
      setPreviousAnchorEl(anchorEl);
    } else if (anchorEl === null && previousAnchorEl !== null) {
      track("Ticket Modal Filter Change", {
        Action: "Close Filter",
      });
      setPreviousAnchorEl(anchorEl);
    }
  }, [anchorEl, track, previousAnchorEl]);

  useEffect(() => {
    if (!newTicketModalOpen && previousTicketModalOpen !== newTicketModalOpen) {
      track("New Ticket Modal Change", {
        Action: "Close Modal",
      });
      setPreviousTicketModalOpen(newTicketModalOpen);
    } else if (
      newTicketModalOpen &&
      previousTicketModalOpen !== newTicketModalOpen
    ) {
      track("New Ticket Modal Change", {
        Action: "Open Modal",
      });
      setPreviousTicketModalOpen(newTicketModalOpen);
    }
  }, [newTicketModalOpen, track, previousTicketModalOpen]);

  useEffect(() => {
    const showAllTicketsLs = localStorage.getItem("showAllTickets");

    if (
      showAllTicketsLs === "true" &&
      (user.profile === "admin" || user.profile === "supervisor")
    ) {
      setTimeout(() => {
        setShowAllTickets(true);
        setSelectedUsersIds(users.users?.map((u) => u.id));
      }, 1000);
    } else {
      setTimeout(() => {
        setShowAllTickets(false);
        setSelectedUsersIds([user.id]);
      }, 1000);
    }
  }, [users, user]);

  useEffect(() => {
    if (tabOpen !== "unread") {
      setUnreadTabActive(false);
    }
  }, [tabOpen]);

  useEffect(() => {
    setSelectedUsersIds([user.id]);
  }, [user]);

  useEffect(() => {
    setPopperHidden(true);
  }, [pathname]);

  useEffect(() => {
    setSelectedWhatsappsIds(connections.map((c) => c.id));
  }, [connections]);

  useEffect(() => {
    setSelectedWhatsappApisIds(connectionsApi.map((c) => c.id));
  }, [connectionsApi]);

  useEffect(() => {
    setSelectedMetasIds(connectionsMeta.map((c) => c.id));
  }, [connectionsMeta]);

  return (
    <>
      <Paper
        elevation={0}
        variant="outlined"
        className={classes.ticketsWrapper}
      >
        {popperHidden ? null : (
          <Popper
            // drag and drop
            className={tab !== "closed" ? classes.popper : classes.popperClosed}
            id={Boolean(anchorEl) ? "simple-popover" : undefined}
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={() => {
              setAnchorEl(null);
              setPopperHidden(false);
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "end",
            }}
            // popper position
            placement="bottom-end"
          >
            <Box className={classes.popperBox}>
              <SearchBox
                status={statusSearch}
                setAnchorEl={setAnchorEl}
                setPopperHidden={setPopperHidden}
              />
              <div className={classes.serachInputWrapper}>
                <InputBase
                  className={classes.subTabSearchInput}
                  inputRef={searchInputRef}
                  value={subTabSearchParam}
                  placeholder={
                    selectedMains[0] === "Nome"
                      ? "Nome do cliente"
                      : selectedMains[0] === "Contato"
                      ? "Número do cliente"
                      : selectedMains[0] === "Mensagem"
                      ? "Trecho da mensagem"
                      : selectedMains[0] === "Protocolo"
                      ? "Protocolo do atendimento"
                      : ""
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          setSearchClicked(searchClicked + 1);
                        }}
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                  type="search"
                  onChange={(e) => setSubTabSearchParam(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearchClicked(searchClicked + 1);
                    }
                  }}
                />
              </div>
              <TicketsFilters
                toggleFilters={true}
                setToggleFilters={setToggleFilters}
                selectedMains={selectedMains}
                setSelectedMains={setSelectedMains}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                selectedUsersIds={selectedUsersIds}
                setSelectedUsersIds={setSelectedUsersIds}
                selectedQueueIds={selectedQueueIds}
                setSelectedQueueIds={setSelectedQueueIds}
                selectedTagIds={selectedTagIds}
                selectedReference={selectedReference}
                setSelectedReference={setSelectedReference}
                setSelectedTagIds={setSelectedTagIds}
                users={users}
                user={user}
                tags={tags}
                getTags={getTags}
                connections={connections}
                connectionsApi={connectionsApi}
                connectionsMeta={connectionsMeta}
                selectedWhatsappsIds={selectedWhatsappsIds}
                setSelectedWhatsappsIds={setSelectedWhatsappsIds}
                selectedWhatsappApisIds={selectedWhatsappApisIds}
                setSelectedWhatsappApisIds={setSelectedWhatsappApisIds}
                selectedMetasIds={selectedMetasIds}
                setSelectedMetasIds={setSelectedMetasIds}
                getConnections={getConnections}
                dateInterval={dateInterval}
                setDateInterval={setDateInterval}
                isSubTab={true}
              />

              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => {
                  setSearchClicked(searchClicked + 1);
                  track(`Ticket Filtered`, {
                    Origin: `${URL.split("/")[3]}`,
                  });
                }}
                className={classes.searchContainedButton}
              >
                BUSCAR
              </Button>
            </Box>
          </Popper>
        )}

        <NewTicketModal
          modalOpen={newTicketModalOpen}
          onClose={(ticket) => {
            handleCloseOrOpenTicket(ticket);
          }}
        />

        <Paper elevation={0} square className={classes.tabsHeader}>
          <Tabs
            value={tab}
            onChange={handleChangeTab}
            variant="fullWidth"
            TabIndicatorProps={{
              style: {
                backgroundColor: "rgba(66,114,44)",
                height: "100%",
              },
            }}
            aria-label="simple tabs example"
          >
            <Tab
              value={"open"}
              onClick={() => {
                setAnchorEl(null);
                setPopperHidden(false);
                setStatusSearch("open");
                setSelectedStatus(["open"]);
                setTabOpen("open");
              }}
              icon={
                <ForumOutlinedIcon
                  style={tab === "open" ? { zIndex: 2, color: "white" } : null}
                />
              }
              label={
                <div
                  style={tab === "open" ? { zIndex: 2, color: "white" } : null}
                >
                  <Badge
                    overlap="rectangular"
                    className={classes.badge}
                    badgeContent={pendingCount}
                    max={9999}
                    color="error"
                    display="inline"
                  >
                    {i18n.t("tickets.tabs.open.title")}
                  </Badge>
                </div>
              }
              classes={{ root: classes.tab }}
            />
            <Tab
              value={"closed"}
              onClick={() => {
                setAnchorEl(null);
                setPopperHidden(false);
                setStatusSearch("closed");
                setSelectedStatus(["closed"]);
              }}
              icon={
                <CheckBoxIcon
                  style={
                    tab === "closed" ? { zIndex: 2, color: "white" } : null
                  }
                />
              }
              label={
                <div
                  style={
                    tab === "closed" ? { zIndex: 2, color: "white" } : null
                  }
                >
                  <Badge
                    overlap="rectangular"
                    className={classes.badge}
                    color="error"
                  >
                    Finalizados
                  </Badge>
                </div>
              }
              classes={{ root: classes.tab }}
            />
            {/* <Tab
            value={"search"}
              // onClick={() => {
              //   setAnchorEl(null);
              // }}
            icon={
              <SearchIcon
                  style={
                    tab === "search" ? { zIndex: 2, color: "white" } : null
                  }
              />
            }
            label={
              <div
                  style={
                    tab === "search" ? { zIndex: 2, color: "white" } : null
                  }
              >
                {i18n.t("tickets.tabs.search.title")}
              </div>
            }
            classes={{ root: classes.tab }}
            /> */}
          </Tabs>
        </Paper>

        <Paper square elevation={0} className={classes.ticketOptionsBox}>
          {tab === "search" ? (
            <>
              <div className={classes.serachInputWrapper}>
                <InputBase
                  className={classes.searchInput}
                  inputRef={searchInputRef}
                  placeholder={i18n.t("tickets.search.placeholder")}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => {
                          setSearchClicked(searchClicked + 1);
                        }}
                      >
                        <SearchIcon />
                      </IconButton>

                      <IconButton
                        style={{ cursor: "pointer" }}
                        aria-label="toggle password visibility"
                        onClick={() => {
                          setToggleFilters(!toggleFilters);
                        }}
                      >
                        <FilterListIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                  type="search"
                  onChange={handleSearch}
                />
              </div>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                style={{
                  fontSize: "1em",
                  minWidth: "2.3em",
                  margin: "0",
                  padding: "0",
                  height: "2.3em",
                  width: "2.3em",
                  textAlign: "center",
                  borderRadius: "50%",
                  fontWeight: "bold",
                }}
                onClick={() => setNewTicketModalOpen(true)}
              >
                +
              </Button>

              {(user.profile === "admin" || user.profile === "supervisor") && (
                <FormControlLabel
                  label={i18n.t("tickets.buttons.showAll")}
                  labelPlacement="start"
                  control={
                    <Switch
                      size="small"
                      checked={showAllTickets}
                      onChange={() => {
                        localStorage.setItem("showAllTickets", !showAllTickets);
                        toggleShowAllTickets();
                      }}
                      name="showAllTickets"
                      color="primary"
                    />
                  }
                />
              )}
            </>
          )}
          {tab !== "search" && (
            <TicketsQueueSelect
              style={{ marginLeft: 6 }}
              selectedQueueIds={selectedQueueIds}
              userQueues={user?.queues}
              onChange={(values) => setSelectedQueueIds(values)}
              anchorEl={anchorEl}
            />
          )}

          {tab !== "search" &&
            (user.profile === "admin" || user.profile === "supervisor") && (
              <TicketsUserSelect
                style={{ marginLeft: 6 }}
                selectedUsersIds={selectedUsersIds}
                users={users?.users}
                user={user}
                anchorEl={anchorEl}
                onChange={(values) => {
                  setSelectedUsersIds(values);
                  if (values.length !== users.users.length) {
                    setShowAllTickets(false);
                  } else {
                    setShowAllTickets(true);
                  }
                }}
              />
            )}
          {tab === "closed" && (
            <IconButton
              size="small"
              // className={classes.tabSearchButton}
            >
              {!popperHidden && anchorEl ? (
                <CloseIcon
                  onClick={() => {
                    setAnchorEl(null);
                    setPopperHidden(false);
                  }}
                />
              ) : (
                <SearchIcon
                  // className={classes.tabSearchIcon}
                  onClick={(e) => {
                    searchHandleClick(e);
                    setSelectedStatus(["closed"]);
                  }}
                />
              )}
            </IconButton>
          )}
        </Paper>

        <TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
          <Tabs
            value={tabOpen}
            onChange={handleChangeTabOpen}
            indicatorColor="primary"
            textColor="primary"
            className={classes.tabs}
            variant={isMobile ? "scrollable" : "fullWidth"}
          >
            <Tab
              className={classes.unreadsTab}
              onClick={() => {
                handleToggleUnreadTab();
                track("Tickets SubPage View", {
                  SubPage: "Unread Tickets",
                });
              }}
              label={
                <TicketAsUnreadCounter
                  counter={openCount + pendingCount + groupCount}
                  isActive={unreadTabActive}
                />
              }
              value={"unread"}
            />

            <Tab
              className={classes.subTab}
              onClick={() => {
                setStatusSearch("open");
              }}
              label={
                <Badge
                  overlap="rectangular"
                  className={classes.badge}
                  badgeContent={openCount}
                  max="9999"
                  color="error"
                >
                  {i18n.t("ticketsList.assignedHeader")}
                  {arrowAnswering === "ASC" ? (
                    <ArrowUp onClick={() => setArrowAnswering("DESC")} />
                  ) : (
                    <ArrowDown onClick={() => setArrowAnswering("ASC")} />
                  )}
                  {statusSearch === "open" && (
                    <>
                      {!popperHidden && anchorEl ? (
                        <CloseIcon
                          onClick={() => {
                            setAnchorEl(null);
                            setPopperHidden(false);
                          }}
                        />
                      ) : (
                        <SearchIcon
                          // className={classes.tabSearchIcon}
                          onClick={(e) => {
                            searchHandleClick(e);
                            setSelectedStatus(["open"]);
                          }}
                        />
                      )}
                    </>
                  )}
                </Badge>
              }
              value={"open"}
            />
            <Tab
              className={classes.subTab}
              onClick={() => {
                setStatusSearch("pending");
              }}
              label={
                <Badge
                  overlap="rectangular"
                  className={classes.badge}
                  badgeContent={pendingCount}
                  max="9999"
                  color="error"
                >
                  {i18n.t("ticketsList.pendingHeader")}
                  {arrowWaiting === "ASC" ? (
                    <ArrowUp onClick={() => setArrowWaiting("DESC")} />
                  ) : (
                    <ArrowDown onClick={() => setArrowWaiting("ASC")} />
                  )}
                  {statusSearch === "pending" && (
                    <>
                      {!popperHidden && anchorEl ? (
                        <CloseIcon
                          onClick={() => {
                            setAnchorEl(null);
                            setPopperHidden(false);
                          }}
                        />
                      ) : (
                        <SearchIcon
                          // className={classes.tabSearchIcon}
                          onClick={(e) => {
                            searchHandleClick(e);
                            setSelectedStatus(["pending"]);
                          }}
                        />
                      )}
                    </>
                  )}
                </Badge>
              }
              value={"pending"}
            />
            {isGroupsEnabled && (
              <Tab
                className={classes.subTab}
                onClick={() => {
                  setStatusSearch("groups");
                }}
                label={
                  <Badge
                    overlap="rectangular"
                    className={classes.badge}
                    badgeContent={groupCount}
                    max="9999"
                    color="error"
                  >
                    {isMobile ? (
                      <span style={{ marginRight: "10px" }}>
                        <Groups />
                      </span>
                    ) : (
                      <span style={{ marginRight: "10px" }}>Grupos</span>
                    )}
                    {statusSearch === "groups" && (
                      <IconButton
                        size="small"
                        className={classes.tabSearchButton}
                      >
                        {!popperHidden && anchorEl ? (
                          <CloseIcon
                            onClick={() => {
                              setAnchorEl(null);
                              setPopperHidden(false);
                            }}
                          />
                        ) : (
                          <SearchIcon
                            // className={classes.tabSearchIcon}
                            onClick={(e) => {
                              searchHandleClick(e);
                              setSelectedStatus(["groups"]);
                            }}
                          />
                        )}
                      </IconButton>
                    )}
                  </Badge>
                }
                value={"groups"}
              />
            )}
          </Tabs>
          <Paper className={classes.ticketsWrapper}>
            <UnreadTicketsList
              status="unread"
              selectedQueueIds={selectedQueueIds}
              selectedUsersIds={selectedUsersIds}
              isActive={unreadTabActive}
              style={applyPanelStyle("unread")}
            />
            {anchorEl && (
              <>
                <Box
                  onClick={() => {
                    setAnchorEl(null);
                    setPopperHidden(false);
                  }}
                  sx={{
                    color: "white",
                    backgroundColor: "#f50057",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    padding: "0.5em",
                    cursor: "pointer",
                  }}
                >
                  <Typography variant="p">
                    Pesquisando tickets antigos
                  </Typography>
                  <Typography
                    variant="p"
                    style={{
                      fontSize: "0.7rem",
                      fontStyle: "italic",
                    }}
                  >
                    (clique aqui para retornar aos atuais)
                  </Typography>
                </Box>
                <TicketsList
                  searchParam={searchParam}
                  subTabSearchParam={subTabSearchParam}
                  tab={tab}
                  searchClicked={searchClicked}
                  anchorEl={anchorEl}
                  filters={{
                    selectedReference,
                    selectedMains,
                    selectedStatus,
                    selectedUsersIds,
                    selectedQueueIds,
                    selectedTagIds,
                    selectedWhatsappsIds,
                    selectedWhatsappApisIds,
                    selectedMetasIds,
                    dateInterval,
                  }}
                  showAll={true}
                  updateCount={(val) => setPendingCount(val)}
									setFunctionsDeleteTicketObject={setFunctionsDeleteTicketObject}
                />
              </>
            )}

            {!anchorEl && (
              <>
                <TicketsList
                  status="open"
                  showAll={showAllTickets}
                  selectedQueueIds={selectedQueueIds}
                  selectedUsersIds={selectedUsersIds}
                  updateCount={(val) => setOpenCount(val)}
                  style={applyPanelStyle("open")}
                  arrowAnswering={arrowAnswering}
									setFunctionsDeleteTicketObject={setFunctionsDeleteTicketObject}
                />
                <TicketsList
                  status="pending"
                  showAll={showAllTickets}
                  selectedQueueIds={selectedQueueIds}
                  selectedUsersIds={selectedUsersIds}
                  updateCount={(val) => setPendingCount(val)}
                  style={applyPanelStyle("pending")}
                  arrowWaiting={arrowWaiting}
									setFunctionsDeleteTicketObject={setFunctionsDeleteTicketObject}
                />
                <TicketsList
                  status="groups"
                  showAll={showAllTickets}
                  selectedQueueIds={selectedQueueIds}
                  selectedUsersIds={selectedUsersIds}
                  updateCount={(val) => setGroupCount(val)}
                  style={applyPanelStyle("groups")}
									setFunctionsDeleteTicketObject={setFunctionsDeleteTicketObject}
                />
              </>
            )}
          </Paper>
        </TabPanel>

        <TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
          {anchorEl && (
            <>
              <Box
                onClick={() => {
                  setAnchorEl(null);
                  setPopperHidden(false);
                }}
                sx={{
                  color: "white",
                  backgroundColor: "#f50057",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  padding: "0.5em",
                  cursor: "pointer",
                }}
              >
                <Typography variant="p">Pesquisando tickets antigos</Typography>
                <Typography
                  variant="p"
                  style={{
                    fontSize: "0.7rem",
                    fontStyle: "italic",
                  }}
                >
                  (clique aqui para retornar aos atuais)
                </Typography>
              </Box>
              <TicketsList
                searchParam={searchParam}
                subTabSearchParam={subTabSearchParam}
                tab={tab}
                searchClicked={searchClicked}
                anchorEl={anchorEl}
                filters={{
                  selectedReference,
                  selectedMains,
                  selectedStatus,
                  selectedUsersIds,
                  selectedQueueIds,
                  selectedTagIds,
                  selectedWhatsappsIds,
                  dateInterval,
                }}
                showAll={true}
								setFunctionsDeleteTicketObject={setFunctionsDeleteTicketObject}
              />
            </>
          )}

          {!anchorEl && (
            <TicketsList
              status="closed"
              showAll={showAllTickets}
              selectedQueueIds={selectedQueueIds}
              selectedUsersIds={selectedUsersIds}
							setFunctionsDeleteTicketObject={setFunctionsDeleteTicketObject}
            />
          )}
        </TabPanel>
      </Paper>
    </>
  );
};

export default TicketsManager;
