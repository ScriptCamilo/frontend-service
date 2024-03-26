import React, { useEffect, useState } from "react";

import { Box, Button, TextField, Typography, Grid } from "@material-ui/core";

import { useAuthContext } from "../../context/Auth/AuthContext";
import { useSettingsContext } from "../../context/SettingsContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { useStylesFilter } from "../Filters/filterStyle";
import SelectInputFilter from "../Filters/SelectInput";

export const ContactFilters = ({ fetchContacts, filters, setFilters }) => {
  const classes = useStylesFilter();
  const { users, user, track } = useAuthContext();
  const { getSettingValue } = useSettingsContext();

  const [usersList, setUsersList] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [extraFields, setExtraFields] = useState([]);

  const channelOptions = [
    { id: 0, name: "Whatsapp", value: "whatsapp" },
    { id: 1, name: "Facebook", value: "facebook" },
    { id: 2, name: "Instagram", value: "instagram" },
  ];

  const isGroupOptions = [
    { id: 0, name: "Sim", value: "true" },
    { id: 1, name: "Não", value: "false" },
  ];

  useEffect(() => {
    const usersList = users?.users?.map((user) => ({
      id: user.id,
      name: user.name,
      value: user.id,
    }));

    if (
      usersList &&
      (["admin", "supervisor"].includes(user?.profile) ||
        getSettingValue("showPocketContacts") === "true")
    ) {
      setUsersList([
        { id: 0, name: "Sem atendente", value: null },
        ...usersList,
      ]);
    } else {
      setUsersList([
        {
          id: user.id,
          name: user.name,
          value: user.id,
        },
      ]);
    }
  }, [users, user, getSettingValue]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/tags/");
        const tagsList = data?.map((tag) => ({
          id: tag.id,
          name: tag.name,
          value: tag.id,
        }));

        setTagsList(tagsList);
      } catch (err) {
        console.log(err);
        toastError(err);
      }
    })();

    (async () => {
      try {
        const { data: fields } = await api.get("/extrainfo/field");
        setExtraFields(fields);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  const searchContacts = () => {
    const sanitizedFilters = {
      email: filters.email,
      name: filters.name,
      number: filters.number,
      isGroup: filters.isGroup,
      tagIds: filters.tag,
      userIds: filters.user,
      channels: filters.channel,
      extraFields: Object.entries(filters.extraFields).map(([key, value]) => {
        if (value !== "" && value !== null && value) {
          return {
            fieldName: key,
            fieldValue: value,
          };
        }
      }),
      createdAtStart: filters.createdAtStart
        ? filters.createdAtStart
        : undefined,
      createdAtEnd: filters.createdAtEnd ? filters.createdAtEnd : undefined,
      isFiltered: true,
    };
    fetchContacts(sanitizedFilters);
    track("Contacts Filtered");
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  const handleFieldsFilterChange = (filterName, value) => {
    if (value.length === 0) {
      const newFilters = { ...filters };
      delete newFilters.extraFields[filterName];
      setFilters(newFilters);
      return;
    }
    setFilters((prevFilters) => ({
      ...prevFilters,
      extraFields: {
        ...prevFilters.extraFields,
        [filterName]: value,
      },
    }));
  };

  const sanitizeFieldsOptions = (options) => {
    return options.map((option) => ({
      id: option.id,
      name: option.value,
      value: option.id,
    }));
  };

  return (
    <Box
      className={classes.container}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          searchContacts();
        }
      }}
    >
      <div className={classes.filterContainer}>
        <Typography className={classes.filtersTitle}>
          Filtros por data:
        </Typography>
        <div className={classes.filterSecondPart}>
          <Grid container>
            <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
              <TextField
                value={filters.createdAtStart || ""}
                label="Data de criação inicial"
                variant="outlined"
                size="small"
                className={classes.textInput}
                type="date"
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  handleFilterChange("createdAtStart", e.target.value)
                }
              />
            </Grid>
            <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
              <TextField
                value={filters.createdAtEnd || ""}
                label="Data de criação final"
                variant="outlined"
                size="small"
                className={classes.textInput}
                type="date"
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  handleFilterChange("createdAtEnd", e.target.value)
                }
              />
            </Grid>
            <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
              {" "}
            </Grid>
            <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
              {" "}
            </Grid>
            <Grid
              item
              md={4}
              sm={8}
              xs={12}
              container
              justifyContent="flex-end"
            >
              <div className={classes.filterButtons}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    setFilters({
                      email: "",
                      name: "",
                      number: "",
                      isGroup: [],
                      user: [],
                      channel: [],
                      extraFields: {},
                      createdAtStart: "",
                      createdAtEnd: "",
                      updatedAtStart: "",
                      updatedAtEnd: "",
                      motive: [],
                      queue: [],
                      tag: [],
                      origin: [],
                      protocol: "",
                    });
                  }}
                  className={classes.clearFiltersBtn}
                >
                  Limpar Filtros
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => searchContacts()}
                  className={classes.searchBtn}
                >
                  Procurar
                </Button>
              </div>
            </Grid>
          </Grid>
        </div>

        <Grid container>
          <Typography className={classes.filtersTitle}>Filtros:</Typography>
          <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
            <TextField
              label="Nome"
              variant="outlined"
              size="small"
              value={filters.name || ""}
              className={classes.textInput}
              onChange={(e) => handleFilterChange("name", e.target.value)}
            />
          </Grid>
          <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
            <TextField
              label="Número"
              variant="outlined"
              size="small"
              value={filters.number || ""}
              className={classes.textInput}
              onChange={(e) => handleFilterChange("number", e.target.value)}
            />
          </Grid>
          <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
            <TextField
              label="Email"
              variant="outlined"
              size="small"
              value={filters.email || ""}
              className={classes.textInput}
              onChange={(e) => handleFilterChange("email", e.target.value)}
            />
          </Grid>
          <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
            <SelectInputFilter
              parameter="channel"
              parameterName={"Canal"}
              options={channelOptions}
              onChange={handleFilterChange}
              selectedValues={filters["channel"]}
              multiple={true}
              width="100%"
            />
          </Grid>

          <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
            <SelectInputFilter
              parameter="user"
              parameterName={"Atendente Recorrente"}
              options={usersList}
              onChange={handleFilterChange}
              selectedValues={filters["user"]}
              multiple={true}
              width="100%"
            />
          </Grid>

          <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
            <SelectInputFilter
              parameter="tag"
              parameterName={"Tag"}
              options={tagsList}
              onChange={handleFilterChange}
              selectedValues={filters["tag"]}
              multiple={true}
              width="100%"
            />
          </Grid>

          <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
            <SelectInputFilter
              parameter="isGroup"
              parameterName={"Grupo"}
              options={isGroupOptions}
              onChange={handleFilterChange}
              selectedValues={filters["isGroup"]}
              width="100%"
            />
          </Grid>

          {extraFields
            ?.filter((field) => field.context === "contact")
            .map((field) => {
              if (field.type === "singleOption") {
                return (
                  <Grid
                    item
                    md={2}
                    sm={4}
                    xs={6}
                    className={classes.gridItem}
                    key={field.id}
                  >
                    <SelectInputFilter
                      parameter={field.name}
                      parameterName={field.name}
                      options={sanitizeFieldsOptions(field.options)}
                      onChange={handleFieldsFilterChange}
                      selectedValues={filters.extraFields[field.name]}
                      width="100%"
                    />
                  </Grid>
                );
              } else if (field.type === "multiOption") {
                return (
                  <Grid
                    item
                    md={2}
                    sm={4}
                    xs={6}
                    className={classes.gridItem}
                    key={field.id}
                  >
                    <SelectInputFilter
                      parameter={field.name}
                      parameterName={field.name}
                      options={sanitizeFieldsOptions(field.options)}
                      onChange={handleFieldsFilterChange}
                      selectedValues={filters.extraFields[field.name]}
                      multiple={true}
                      width="100%"
                    />
                  </Grid>
                );
              } else if (field.type === "text") {
                return (
                  <Grid
                    item
                    md={2}
                    sm={4}
                    xs={6}
                    className={classes.gridItem}
                    key={field.id}
                  >
                    <TextField
                      value={filters.extraFields[field.name] || ""}
                      label={field.name}
                      variant="outlined"
                      size="small"
                      className={classes.textInput}
                      width="100%"
                      onChange={(e) =>
                        handleFieldsFilterChange(field.name, e.target.value)
                      }
                    />
                  </Grid>
                );
              }
              return null;
            })}
        </Grid>
      </div>
    </Box>
  );
};
