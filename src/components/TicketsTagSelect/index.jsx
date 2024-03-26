import React from "react";

import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import {
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  Select,
} from "@material-ui/core";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";

const TicketsTagSelect = ({
  tags,
  selectedTagIds = [],
  onChange,
  isSubTab,
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

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
            Etiquetas
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
          multiple
          // label="Etiquetas"
          variant="outlined"
          displayEmpty
          defaultValue={[]}
          value={selectedTagIds}
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
              return <em>Etiquetas</em>;
            }

            // return name of tags ids selected

            return selected
              .map((id) => {
                const tag = tags.find((tag) => tag.id === id);
                return tag.name;
              })
              .join(", ");
          }}
        >
          {tags?.length > 0 &&
            tags.map((tag) => (
              <MenuItem dense key={tag.id} value={tag.id}>
                <Checkbox
                  style={{
                    color: tag.color,
                  }}
                  size="small"
                  color="primary"
                  checked={selectedTagIds.indexOf(tag.id) > -1}
                />
                <ListItemText primary={tag.name} />
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {/* </TextField> */}
      {/* </ClickAwayListener> */}
    </div>
  );
};

export default TicketsTagSelect;
