import React, { useEffect, useState } from "react";

import { ListItemText, MenuItem, Select } from '@material-ui/core';

import { useUsersContext } from '../../context/UsersContext';
import { i18n } from "../../translate/i18n";

const selectMenuProps = {
  PaperProps: {
    style: { maxHeight: "400px" },
  },
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "left",
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "left",
  },
  getContentAnchorEl: null,
}

function SelectConnection(props) {
  const { channel, selectedConnection, setSelectedConnection, selectedUser } = props;
  const { users } = useUsersContext();

  const [items, setItems] = useState([]);
  const [user, setUser] = useState({});

  useEffect(() => {
    if (user) {
      switch (channel) {
        case "whatsapp":
          setItems(user?.whatsapps);
          break;
        case "facebook":
          setItems(user?.metas?.filter(({ name }) => !name.includes("- IG")));
          break;
        case "instagram":
          setItems(user?.metas?.filter(({ name }) => name.includes("- IG")));
          break;
        default:
          setItems([]);
      }
    } else setItems([]);
  }, [channel, user]);

  useEffect(() => {
    setUser(users?.find(u => u.id === selectedUser));
  }, [selectedUser, users]);

  return (
    <Select
      fullWidth
      displayEmpty
      variant="outlined"
      value={selectedConnection}
      onChange={(e) => setSelectedConnection(e.target.value)}
      MenuProps={selectMenuProps}
      renderValue={() => {
        if (selectedConnection === "") {
          return (
            <span style={{ color: "rgba(0, 0, 0, 0.54)" }}>
              {i18n.t(`selectConnection.${channel}.label`)}
            </span>
          );
        }
        const item = items?.find(i => i.id === selectedConnection);
        return item?.name;
      }}
    >
      <MenuItem dense value="">
        <ListItemText primary={i18n.t(`selectConnection.${channel}.firstItem`)} />
      </MenuItem>
      {
        items?.map((item, key) => (
          <MenuItem dense key={key} value={item.id}>
            <ListItemText primary={item.name} />
          </MenuItem>
        ))
      }
      {
        items?.length === 0 && (
          <MenuItem dense disabled>
            <ListItemText primary={i18n.t(`selectConnection.${channel}.empty`)} />
          </MenuItem>
        )
      }
    </Select>
  )
}

export default SelectConnection;
