import React from "react";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Checkbox, InputLabel, ListItemText } from "@material-ui/core";

const SelectInputFilter = ({
  parameter,
  parameterName,
  selectedValues = [],
  onChange,
  options,
  multiple = false,
  width = "200px",
}) => {
  const handleChange = (e) => {
    return onChange(parameter, e.target.value);
  };

  return (
    <div style={{ width: "auto" }}>
      <FormControl fullWidth>
        <InputLabel
          style={{
            fontSize: "0.8em",
            marginTop: -13,
            marginLeft: 14,
          }}
        >
          {parameterName}
        </InputLabel>
        <Select
          style={{
            width: width,
            height: "34px",
            fontSize: "0.8em",
          }}
          label={parameterName}
          multiple={multiple}
          variant="outlined"
          value={selectedValues}
          onChange={handleChange}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: "400px",
              },
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
          }}
          renderValue={(selected) => {
            if (!multiple) {
              return options.find((option) => option.value === selected)?.name;
            }

            return options
              .filter((option) => selected.includes(option.value))
              .map((option) => option.name)
              .join(", ");
          }}
        >
          {!multiple && (
            <MenuItem dense key="null" value={""}>
              <ListItemText primary="Nenhum" />
            </MenuItem>
          )}
          {options?.length > 0 &&
            options.map((option) => (
              <MenuItem dense key={option.id} value={option.value}>
                {multiple && (
                  <Checkbox
                    size="small"
                    color="primary"
                    checked={selectedValues?.includes(option.value)}
                  />
                )}
                <ListItemText primary={option.name} />
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default SelectInputFilter;
