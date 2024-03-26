import React from "react";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Checkbox, InputLabel, ListItemText } from "@material-ui/core";

const TicketsUserSelect = ({
  user,
  users,
  selectedUsersIds = [],
  onChange,
  isSubTab,
  anchorEl,
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ width: isSubTab ? "100%" : "auto", marginTop: -4 }}>
      <FormControl fullWidth margin="dense">
        <InputLabel
          shrink
          style={{
            fontSize: "1em",
            marginTop: -9,
            marginLeft: 10,
          }}
        >
          Atendentes
        </InputLabel>
        <Select
          style={
            !isSubTab
              ? {
                  width: "100px",
                  fontSize: "0.8em",
                  marginTop: -4,
                }
              : {
                  width: "90%",
                  fontSize: "0.8em",
                  marginTop: -4,
                }
          }
          multiple
          label="Atendentes"
          displayEmpty
          variant="outlined"
          value={selectedUsersIds}
          onChange={handleChange}
          MenuProps={{
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            getContentAnchorEl: null,
          }}
          renderValue={(selected) => {
            if (selected.length === 0) {
              return <em>Atendentes</em>;
            }

            // return name of user ids selected

            return selected
              .map((id) => {
                const user = users?.find((user) => user.id === id);
                return user?.name;
              })
              .join(", ");
          }}
          disabled={
            (user?.profile !== "admin" && user?.profile !== "supervisor") ||
            anchorEl
          }
        >
          {users?.length > 0 &&
            users.map((user) => (
              <MenuItem dense key={user.id} value={user.id}>
                <Checkbox
                  size="small"
                  color="primary"
                  checked={selectedUsersIds?.indexOf(user.id) > -1}
                />
                <ListItemText primary={user.name} />
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default TicketsUserSelect;
