import React from "react";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Checkbox, InputLabel, ListItemText } from "@material-ui/core";

const TicketsMainFilterSelect = ({
  selectedMains = [],
  onChange,
  isSubTab,
}) => {
  const handleChange = (e) => {
    onChange([e.target.value]);
  };

  const mainFilters = [
    { id: 0, name: "Nome", surname: "Nome" },
    { id: 1, name: "Contato", surname: "Número" },
    { id: 2, name: "Mensagem", surname: "Mensagem" },
    { id: 3, name: "Protocolo", surname: "Protocolo" },
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
          Parâmetro
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
          displayEmpty
          variant="outlined"
          value={selectedMains}
          defaultValue={selectedMains}
          onChange={handleChange}
          label={"Parâmetro"}
          // InputLabelProps={{ shrink: true }}
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
              return <em>Parâmetro</em>;
            }

            const selectedSurNames = selected.map((main) => {
              const mainFilter = mainFilters.find((f) => f.name === main);
              return mainFilter?.surname;
            });

            return selectedSurNames.join(", ");
          }}
        >
          {mainFilters?.length > 0 &&
            mainFilters.map((main) => {
              return (
                <MenuItem dense key={main.id} value={main.name}>
                  <Checkbox
                    size="small"
                    color="primary"
                    checked={selectedMains?.includes(main.name)}
                  />
                  <ListItemText primary={main.surname} />
                </MenuItem>
              );
            })}
        </Select>
      </FormControl>
    </div>
  );
};

export default TicketsMainFilterSelect;
