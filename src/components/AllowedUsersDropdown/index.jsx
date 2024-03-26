import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import { ClickAwayListener, Divider } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  dropDownAllowUsers: {
    width: "80%",
    height: "30vh",
    marginTop: "-5px",
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    margin: "0px",
    position: "absolute",
    zIndex: "3",
    backgroundColor: "white",
    boxShadow: "0 2px 2px rgba(0, 0, 0, 0.538)",
    borderRadius: "0 0 5px 5px",
    overflowY: "scroll",
    overflowX: "hidden",
    fontWeight: 600,
    // position: "absolute",
  },

  inactiveUser: {
    width: "100%",
    backgroundColor: "#84002e",
    display: "flex",
    flexDirection: "column",
    margin: "0px",
    cursor: "pointer",
    transition: "0.1s ease-in-out",
    "&:hover": {
      backgroundColor: "#f50057",
    },
  },

  inactiveUserP: {
    width: "100%",
    color: "#ffffffa1",
    display: "flex",
    flexDirection: "column",
    margin: "0px",
    padding: "0.3em 1em",
    cursor: "pointer",
  },

  activeUser: {
    width: "100%",
    backgroundColor: "#42722c",
    display: "flex",
    flexDirection: "column",
    margin: "0px",
    cursor: "pointer",
    transition: "0.1s ease-in-out",
    "&:hover": {
      backgroundColor: "#60b23a",
    },
  },

  activeUserP: {
    width: "100%",
    color: "white",
    display: "flex",
    flexDirection: "column",
    margin: "0px",
    padding: "0.3em 1em",
    cursor: "pointer",
  },

  divider: {
    backgroundColor: "#ffffff",
    height: "1px",
    opacity: "0.2",
    width: "70%",
    margin: "auto",
  },

  showUsers: {
    width: "100%",
    userSelect: "none",
    border: "1px solid rgba(255, 255, 255, 0.218)",
    borderRadius: "8px",
    padding: "0.3em 1em",
    cursor: "pointer",
    display: "flex",
    gap: "0.5em",
    transition: "0.1s",
    "&:hover": {
      backgroundColor: "#ffffff20",
    },
  },

  toggleUsers: {
    transform: "rotate(180deg)",
  },
}));

const AllowedUsersDropdown = (props) => {
  const classes = useStyles();
  const {
    users,
    usersIdOnline,
    setDistribution,
    distributionId,
    distribution,
  } = props;
  const [activeUsers, setActiveUsers] = useState([]);
  const [inactiveUsers, setInactiveUsers] = useState([]);
  const [inactiveDrop, setInactiveDrop] = useState(false);
  const { setOnlineUsers } = useContext(AuthContext);
  const [usersWithQueue, setUsersWithQueue] = useState([]);

  useEffect(() => {
    if (users.users) {
      setInactiveUsers(
        // users.users
        users.users.filter((user) => {
          return user.queues?.find(
            (queue) => queue.id === distribution?.queueId
          );
        })
      );
    }
  }, [users]);

  useEffect(() => {
    const usersList = users.users;
    if (
      users &&
      Array.isArray(usersList) &&
      usersIdOnline &&
      usersIdOnline !== "fail"
    ) {
      const usersOnline = usersList.filter((user) =>
        JSON.parse(usersIdOnline).includes(user.id)
      );
      setActiveUsers(usersOnline);

      const usersOffline = usersList.filter(
        (user) => !usersIdOnline.includes(user.id)
      );
      setInactiveUsers(
        usersOffline.filter((user) =>
          user.queues.find((queue) => queue.id === distribution?.queueId)
        )
      );
    }
  }, [users, usersIdOnline]);

  const activeUsersHandleChange = (newActiveUsers) => {
    const newActiveUsersId = JSON.stringify(
      newActiveUsers.map((user) => user.id)
    );

    if (newActiveUsers.length === 0) {
      api.put(`/distributions/${distributionId}`, {
        userIds: newActiveUsersId,
        status: false,
      });
    } else {
      api.put(`/distributions/${distributionId}`, {
        userIds: newActiveUsersId,
      });
    }
  };

  const setUser = ({ target }) => {
    const nameClicked = target.getAttribute("name");
    const userClicked = users.users.find((user) => user.name === nameClicked);

    setInactiveUsers(
      inactiveUsers.filter(
        (user) =>
          user.name !== nameClicked &&
          user.queues.find((queue) => queue.id === distribution?.queueId)
      )
    );
    setActiveUsers([...activeUsers, userClicked]);

    activeUsersHandleChange([...activeUsers, userClicked]);
  };

  const removeUser = ({ target }) => {
    const nameClicked = target.getAttribute("name");
    setActiveUsers(activeUsers.filter((user) => user.name !== nameClicked));
    setInactiveUsers([
      ...inactiveUsers,
      users.users.find((user) => user.name === nameClicked),
    ]);

    activeUsersHandleChange(
      activeUsers.filter((user) => user.name !== nameClicked)
    );
  };

  useEffect(() => {
    setOnlineUsers(activeUsers.filter((user) => user.name));
  }, [activeUsers, setOnlineUsers]);

  const handleClickAway = () => {
    setInactiveDrop(true);
  };

  if (users.users) {
    return (
      <>
        <div className={classes.inactiveDrop}>
          <div
            className={classes.showUsers}
            onClick={() => setInactiveDrop(!inactiveDrop)}
          >
            {`${activeUsers.length}/${
              users.users.filter((user) => {
                return user.queues?.find(
                  (queue) => queue.id === distribution?.queueId
                );
              }).length
            } ativos`}
          </div>

          <div className={classes.dropDownAllowUsers}>
            {activeUsers.length > 0 &&
              activeUsers.map((user) => (
                <div className={classes.activeUser}>
                  <p
                    className={classes.activeUserP}
                    name={user.name}
                    onClick={removeUser}
                  >
                    {user.name}
                  </p>
                  <Divider className={classes.divider} />
                </div>
              ))}

            {inactiveUsers.length > 0 &&
              inactiveUsers.map((user) => (
                <div className={classes.inactiveUser}>
                  <p
                    className={classes.inactiveUserP}
                    name={user.name}
                    onClick={setUser}
                  >
                    {user.name}
                  </p>
                  <Divider className={classes.divider} />
                </div>
              ))}
          </div>

          {/* {!inactiveDrop && (
            <ClickAwayListener onClickAway={handleClickAway}>
              <div className={classes.dropDownAllowUsers}>
                {activeUsers.length > 0 &&
                  activeUsers.map((user) => (
                    <div className={classes.activeUser}>
                      <p
                        className={classes.activeUserP}
                        name={user.name}
                        onClick={removeUser}
                      >
                        {user.name}
                      </p>
                      <Divider className={classes.divider} />
                    </div>
                  ))}

                {inactiveUsers.length > 0 &&
                  inactiveUsers.map((user) => (
                    <div className={classes.inactiveUser}>
                      <p
                        className={classes.inactiveUserP}
                        name={user.name}
                        onClick={setUser}
                      >
                        {user.name}
                      </p>
                      <Divider className={classes.divider} />
                    </div>
                  ))}
              </div>
            </ClickAwayListener>
          )} */}
        </div>
      </>
    );
  }

  return null;
};

export default AllowedUsersDropdown;
