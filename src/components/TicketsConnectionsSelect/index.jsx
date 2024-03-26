import React from "react";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Checkbox, InputLabel, ListItemText } from "@material-ui/core";

const TicketsConnectionsSelect = ({
  connections,
  selectedConnectionsIds = [],
  onChange,
  isSubTab,
	nameOfSelect
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
          {nameOfSelect}
        </InputLabel>
        <Select
          style={
            !isSubTab
              ? {
                  width: "auto",
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
          label="Conexões"
          variant="outlined"
          displayEmpty
          value={selectedConnectionsIds}
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
              return <em>Conexões</em>;
            }

            // return name of whatsapps ids selected

            return selected
              .map((id) => {
                const conn = connections?.find((conn) => conn.id === id);
                return conn?.name;
              })
              .join(", ");
          }}
        >
          {connections?.length > 0 &&
            connections.map((conn) => (
              <MenuItem dense key={conn.id} value={conn.id}>
                <Checkbox
                  size="small"
                  color="primary"
                  checked={selectedConnectionsIds.indexOf(conn.id) > -1}
                />
                <ListItemText primary={conn.name} />
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default TicketsConnectionsSelect;
