import React, { useContext, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Chip from "@material-ui/core/Chip";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";

const useStyles = makeStyles((theme) => ({
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
}));

const MetaSelect = ({ selectedMetaIds, onChange }) => {
  const classes = useStyles();
  const { allMetas: metas } = useContext(WhatsAppsContext);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ marginTop: 6 }}>
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel>Páginas Em Uso</InputLabel>
        <Select
          multiple
          labelWidth={60}
          value={selectedMetaIds || []}
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
          renderValue={(selected) => (
            <div className={classes.chips}>
              {selected?.length > 0 &&
                selected.map((id) => {
                  const meta = metas.find((q) => q.id === id);
                  return meta ? (
                    <Chip
                      key={id}
                      style={{ backgroundColor: "black", color: "white" }}
                      variant="outlined"
                      label={meta.name}
                      className={classes.chip}
                    />
                  ) : null;
                })}
            </div>
          )}
        >
          {metas
            .filter((meta) => meta.status !== "INATIVE")
            .map((meta) => (
              <MenuItem key={meta.id} value={meta.id}>
                {meta.name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default MetaSelect;
