import React from "react";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Checkbox, InputLabel, ListItemText } from "@material-ui/core";

const TicketsStatusFilterSelect = ({
  selectedStatus = [],
  onChange,
  isSubTab,
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const mainFilters = [
    { id: 0, name: "Aberto", value: "open" },
    { id: 1, name: "Aguardando", value: "pending" },
    { id: 2, name: "Fechado", value: "closed" },
    { id: 3, name: "Grupo", value: "groups" },
    { id: 4, name: "Finalizado", value: "closed" },
  ];

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
          Status
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
          label={"Status"}
          multiple
          displayEmpty
          variant="outlined"
          value={selectedStatus}
          onChange={handleChange}
          disabled={isSubTab}
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
              return <em>Status</em>;
            }

            return selected
              .join(", ")
              .replace("open", "Aberto")
              .replace("pending", "Aguardando")
              .replace("closed", "Fechado")
              .replace("groups", "Grupo");
          }}
        >
          {mainFilters?.length > 0 &&
            mainFilters.map((main) => (
              <MenuItem dense key={main.id} value={main.value}>
                <Checkbox
                  size="small"
                  color="primary"
                  checked={selectedStatus?.includes(main.value)}
                />
                <ListItemText primary={main.name} />
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default TicketsStatusFilterSelect;
