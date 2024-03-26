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

const WhatsappSelect = ({ selectedWhatsappIds, onChange }) => {
  const classes = useStyles();
  const { whatsApps: whatsapps } = useContext(WhatsAppsContext);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ marginTop: 6 }}>
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel>Whatsapps Em Uso</InputLabel>
        <Select
          multiple
          labelWidth={60}
          value={selectedWhatsappIds || []}
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
                  const whatsapp = whatsapps.find((q) => q.id === id);
                  return whatsapp ? (
                    <Chip
                      key={id}
                      style={{ backgroundColor: "black", color: "white" }}
                      variant="outlined"
                      label={whatsapp.name}
                      className={classes.chip}
                    />
                  ) : null;
                })}
            </div>
          )}
        >
          {whatsapps
            .filter((whats) => whats.status !== "INATIVE")
            .map((whatsapp) => (
              <MenuItem key={whatsapp.id} value={whatsapp.id}>
                {whatsapp.name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default WhatsappSelect;
