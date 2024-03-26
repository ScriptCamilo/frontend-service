import React, { useEffect, useRef, useState } from "react";

import {
  Button
} from "@material-ui/core";
import Badge from "@material-ui/core/Badge";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import { makeStyles } from "@material-ui/core/styles";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import ForumOutlinedIcon from "@material-ui/icons/ForumOutlined";
import { useHistory, useLocation } from "react-router-dom";

import { useAuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import NewTicketModal from "../NewTicketModal";
import TicketsQueueSelect from "../TicketsQueueSelect";
import TicketsUserSelect from "../TicketsUserSelect";

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  tabsHeader: {
    flex: "none",
    backgroundColor: "#eee",
  },

  settingsIcon: {
    alignSelf: "center",
    marginLeft: "auto",
    padding: 8,
  },

  tab: {
    minWidth: 120,
    width: 120,
  },

  unreadsTab: {
    maxWidth: 60,
    minWidth: 60,
    width: 60,
  },

  subTab: {
    fontSize: "0.8rem",
    minWidth: 100,
    width: 100,
  },

  tabSearchButton: {
    position: "absolute",
    right: -20,
    width: "1.5em",
    height: "1.5em",
    // left: 38,
    top: -3,
    // marginLeft: 3,
  },

  tabSearchIcon: {
    fontSize: "1em",
    opacity: 0.8,
  },

  popper: {
    backgroundColor: "#fafafa",
    height: "490px",
    width: "300px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    // borderRadius: "0 20px 20px 0",
    borderRadius: "20px",
    marginLeft: "35.8%",
    // marginTop: "-4.5vh",
    boxShadow: "0px 0px 5px 5px rgba(0,0,0,0.1)",
  },

  popperClosed: {
    backgroundColor: "#fafafa",
    height: "490px",
    width: "300px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    // borderRadius: "0 20px 20px 0",
    borderRadius: "20px",
    marginLeft: "-64%",
    marginTop: "13vh",
    boxShadow: "0px 0px 5px 5px rgba(0,0,0,0.1)",
  },

  popperBox: {
    height: "490px",
    width: "300px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    // borderRadius: "0 20px 20px 0",
    borderRadius: "20px",
  },

  ticketOptionsBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fafafa",
    padding: theme.spacing(1),
    boxShadow: "0px 0px 5px 5px rgba(0,0,0,0.1)",
  },

  serachInputWrapper: {
    flex: 1,
    background: "#fff",
    display: "flex",
    borderRadius: 40,
    padding: 4,
    marginRight: theme.spacing(1),
  },

  searchIcon: {
    color: "grey",
    marginLeft: 6,
    marginRight: 6,
    alignSelf: "center",
  },

  searchInput: {
    flex: 1,
    border: "none",
  },

  subTabSearchInput: {
    marginLeft: 6,
    paddingLeft: 8,
    flex: 1,
    border: "1px solid #ccc",
    borderRadius: 6,
    width: "100%",
    height: "2.3em",
    marginTop: "3em",
  },

  searchContainedButton: {
    borderRadius: "0 0 10px 10px",
  },

  badge: {
    // paddingRight: 0,

    "& .MuiBadge-badge": {
      position: "absolute",
      right: 23,
      top: 0,
    },
  },
}));

const TicketsManagerV2 = () => {
  const classes = useStyles();
  const history = useHistory();

  const [searchParam, setSearchParam] = useState("");
  const [subTabSearchParam, setSubTabSearchParam] = useState("");
  const [tab, setTab] = useState("open");
  const [tabOpen, setTabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const searchInputRef = useRef();
  const { user, users, tags, getTags, connections, getConnections } = useAuthContext();

  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);
  const [selectedUsersIds, setSelectedUsersIds] = useState([]);
  const [selectedMains, setSelectedMains] = useState(["Nome"]);
  const [selectedStatus, setSelectedStatus] = useState([
    "open",
    "pending",
    "closed",
  ]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [selectedConnectionsIds, setSelectedConnectionsIds] = useState(
    user?.whatsapps?.map((c) => c.id) || []
  );

  const [dateInterval, setDateInterval] = useState({
    startDate: new Date(
      // today -1 month
      `2023-${String(new Date().getMonth()).padStart(2, "0")}-${
        new Date().getDate() + 1
      }`
    ),
    endDate: new Date(
      `2023-${String(new Date().getMonth() + 1).padStart(2, "0")}-${
        new Date().getDate() + 1
      }`
    ),
  });
  const [searchClicked, setSearchClicked] = useState(0);
  const [unreadsTabActive, setUnreadsTabActive] = useState(false);
  const [toggleFilters, setToggleFilters] = useState(false);
  const [selectedReference, setSelectedReference] = useState("updatedAt");
  const [anchorEl, setAnchorEl] = useState(null);
  const [statusSearch, setStatusSearch] = useState("open");
  const [popperHidden, setPopperHidden] = useState(false);

  const [arrowAnswering, setArrowAnswering] = useState("DESC");
  const [arrowWaiting, setArrowWaiting] = useState("DESC");

  const { pathname } = useLocation();

  const searcHandleClick = (event) => {
    // take parent anchor element
    setPopperHidden(false);
    setAnchorEl(
      event.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode
        .parentNode
    );
  };

  useEffect(() => {
    const showAllTicketsLs = localStorage.getItem("showAllTickets");

    if (showAllTicketsLs === "true") {
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
  }, [users.users]);

  const toggleShowAllTickets = () => {
    if (showAllTickets) {
      setSelectedUsersIds([user.id]);
    } else {
      setSelectedUsersIds(users.users?.map((u) => u.id));
    }
    setShowAllTickets(!showAllTickets);
  };

  useEffect(() => {
    setSelectedUsersIds([user.id]);
  }, [user]);

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    if (tab === "search") {
      setSearchParam(searchedTerm);
    }
  };

  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  const handleChangeTabOpen = (e, newValue) => {
    setTabOpen(newValue);
    if (tabOpen !== newValue) {
      setAnchorEl(null);
      setPopperHidden(false);
    }
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { width: 0, height: 0 };
    }
  };

  const handleCloseOrOpenTicket = (ticket) => {
    setNewTicketModalOpen(false);
    if (ticket) {
      history.push(`/tickets/${ticket.id}`);
    }
  };

  useEffect(() => {
    if (tabOpen !== "unread") {
      setUnreadsTabActive(false);
    }
  }, [tabOpen]);

  const handleToggleUnreadsTab = () => {
    if (tabOpen !== "unread") {
      setTabOpen("unread");
      setUnreadsTabActive(true);
    } else {
      setTabOpen("open");
      setUnreadsTabActive(false);
    }
  };

  useEffect(() => {
    setPopperHidden(true);
  }, [pathname]);

  useEffect(() => {
    setSelectedConnectionsIds(connections.map((c) => c.id));
  }, [connections]);

  return (
    <>
      <Paper
        elevation={0}
        variant="outlined"
        className={classes.ticketsWrapper}
      >
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
                    color="secondary"
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
                    color="secondary"
                  >
                    Finalizados
                  </Badge>
                </div>
              }
              classes={{ root: classes.tab }}
            />
          </Tabs>
        </Paper>

        <Paper square elevation={0} className={classes.ticketOptionsBox}>
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
        </Paper>
      </Paper>
    </>
  );
};

export default TicketsManagerV2;
