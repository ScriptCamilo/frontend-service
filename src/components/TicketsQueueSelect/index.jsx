import React from "react";
import { useEffect } from "react";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Checkbox, InputLabel, ListItemText } from "@material-ui/core";

const TicketsQueueSelect = ({
  userQueues,
  selectedQueueIds = [],
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
          Setores
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
          displayEmpty
          label="Setores"
          variant="outlined"
          value={selectedQueueIds}
          onChange={handleChange}
          disabled={anchorEl}
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
              return <em>Setores</em>;
            }

            // return name of queues ids selected

            return selected
              .flatMap((id) => {
                const queue = userQueues.find((queue) => queue.id === id);
                if (!queue.deleted) return [queue.name];
                else return [];
              })
              .join(", ");
          }}
        >
          {userQueues?.length > 0 &&
            userQueues.map((queue) => {
              if (!queue.deleted) {
                return (
                  <MenuItem dense key={queue.id} value={queue.id}>
                    <Checkbox
                      style={{
                        color: queue.color,
                      }}
                      size="small"
                      color="primary"
                      checked={selectedQueueIds.indexOf(queue.id) > -1}
                    />
                    <ListItemText primary={queue.name} />
                  </MenuItem>
                );
              }
            })}
        </Select>
      </FormControl>
    </div>
  );
};

export default TicketsQueueSelect;
