import React from "react";

import {
  InputLabel,
  ListItemText,
  Typography,
} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

const TicketsDateFilterSelect = ({ selectedReference, onChange, isSubTab }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const mainFilters = [
    { id: 0, name: "Data de criação", value: "createdAt" },
    { id: 1, name: "Última alteração", value: "updatedAt" },
  ];

  return (
    <div style={{ width: isSubTab ? "100%" : "auto", marginTop: -4 }}>
      <FormControl fullWidth margin="dense">
        <div
          style={{
            backgroundColor: "#fff",
            zIndex: 999,
          }}
        >
          <InputLabel
            shrink
            style={{
              fontSize: "1em",
              marginTop: -9,
              marginLeft: 10,
              backgroundColor: "#fff",
            }}
          >
            Data referencial
          </InputLabel>
        </div>
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
          // label={"Data referencial"}
          variant="outlined"
          displayEmpty
          defaultValue={selectedReference}
          value={selectedReference}
          onChange={handleChange}
          size="small"
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
            return selected === "createdAt" ? (
              <Typography style={{ fontSize: "1em" }}>
                Data de criação
              </Typography>
            ) : (
              <Typography style={{ fontSize: "1em" }}>
                Última alteração
              </Typography>
            );
          }}

          // renderValue={(selected) => {
          //   if (!selected.length === 0) {
          //     return <em>Data referencial</em>;
          //   }

          //   return selected
          //     .join(", ")
          //     .replace("open", "Aberto")
          //     .replace("pending", "Aguardando")
          //     .replace("closed", "Fechado")
          //     .replace("groups", "Grupo");
          // }}
        >
          {mainFilters?.length > 0 &&
            mainFilters.map((main) => (
              <MenuItem dense key={main.id} value={main.value}>
                {/* <Checkbox
                  size="small"
                  color="primary"
                  checked={selectedStatus?.includes(main.value)}
                /> */}
                <ListItemText primary={main.name} />
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default TicketsDateFilterSelect;
