import React, { useEffect, useState } from "react";

import { Box, Button, Grid, TextField, Typography } from "@material-ui/core";

import { useAuthContext } from "../../context/Auth/AuthContext";
import { useSettingsContext } from "../../context/SettingsContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { useStylesFilter } from "../Filters/filterStyle";
import SelectInputFilter from "../Filters/SelectInput";

export const TicketLogFilters = ({ fetchTickets, filters, setFilters }) => {
  const classes = useStylesFilter();
  const {
    users,
    user,
    queues,
    track,
    connections,
    connectionsMeta,
    connectionsApi,
  } = useAuthContext();
  const { getSettingValue } = useSettingsContext();

  const [tagsList, setTagsList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [queuesList, setQueuesList] = useState([]);
  const [extraFields, setExtraFields] = useState([]);
  const [motivesList, setMotivesList] = useState([]);

  const URL = window.location.href;

  let channelOptions = connections?.map((connection) => ({
    id: connection.id,
    name: connection?.name,
    value: `WA: ${connection.id}`,
  }));

  channelOptions = [
    ...channelOptions,
    ...connectionsMeta?.map((connection) => ({
      id: connection.id,
      name: connection?.name,
      value: `META: ${connection.id}`,
    })),
  ];

  channelOptions = [
    ...channelOptions,
    ...connectionsApi?.map((connection) => ({
      id: connection.id,
      name: connection?.name,
      value: `WA-API: ${connection.id}`,
    })),
  ];

  const isGroupOptions = [
    { id: 0, name: "Sim", value: "true" },
    { id: 1, name: "Não", value: "false" },
  ];

  const originOptions = [
    { id: 0, name: "Ativos", value: "Ativo" },
    { id: 1, name: "Receptivos", value: "Receptivo" },
  ];

  const statusOptions = [
    { id: 0, name: "Aberto", value: "open" },
    { id: 1, name: "Aguardando", value: "pending" },
    { id: 2, name: "Fechado", value: "closed" },
  ];

  const searchContacts = () => {
    const sanitizedFilters = {
      email: filters.email,
      name: filters.name,
      number: filters.number,
      isGroup: filters.isGroup,
      userIds: filters.user,
      channels: filters.channel,
      extraFields: Object.entries(filters.extraFields).map(([key, value]) => {
        if (value !== "" && value !== null && value.length !== 0) {
          return {
            fieldName: key,
            fieldValue: value,
            isContactField:
              extraFields?.find((field) => field.name === key)?.context ===
              "contact",
          };
        }
      }),
      createdAtStart: filters.createdAtStart
        ? `${filters.createdAtStart}`
        : undefined,
      createdAtEnd: filters.createdAtEnd
        ? `${filters.createdAtEnd}`
        : undefined,
      updatedAtStart: filters.updatedAtStart
        ? `${filters.updatedAtStart}`
        : undefined,
      updatedAtEnd: filters.updatedAtEnd
        ? `${filters.updatedAtEnd}`
        : undefined,
      motives: filters.motive,
      queueIds: filters.queue,
      status: filters.status,
      tags: filters.tag,
      origins: filters.origin,
      protocol: filters.protocol,
    };

    track(`Ticket Filtered`, {
      Origin: `${URL.split("/")[3]}`,
    });
    fetchTickets(sanitizedFilters);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({ ...filters, [filterName]: value });
  };

  const handleFieldsFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      extraFields: {
        ...filters.extraFields,
        [filterName]: value,
      },
    });
  };

  const sanitizeFieldsOptions = (options) => {
    return options.map((option) => ({
      id: option.id,
      name: option.value,
      value: option.id,
    }));
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/motive/");

        const motivesList = data?.map((motive) => ({
          id: motive.id,
          name: motive.name,
          value: motive.name,
        }));

        setMotivesList(motivesList);
      } catch (err) {
        console.log(err);
        toastError(err);
      }
    })();
  }, []);

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
      // setFilters({ ...filters, user: [user?.id] });
    }
  }, [users, user]);

  useEffect(() => {
    const queuesList = queues?.map((queue) => ({
      id: queue.id,
      name: queue.name,
      value: queue.id,
    }));

    setQueuesList(queuesList);
  }, [queues]);

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
              <TextField
                value={filters.updatedAtStart || ""}
                label="Data de finalização inicial"
                variant="outlined"
                size="small"
                className={classes.textInput}
                type="date"
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  handleFilterChange("updatedAtStart", e.target.value)
                }
              />
            </Grid>
            <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
              <TextField
                value={filters.updatedAtEnd || ""}
                label="Data de finalização final"
                variant="outlined"
                size="small"
                className={classes.textInput}
                type="date"
                InputLabelProps={{ shrink: true }}
                onChange={(e) =>
                  handleFilterChange("updatedAtEnd", e.target.value)
                }
              />
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
          <Grid item xs={12}>
            <Typography className={classes.filtersTitle}>
              Filtros por contato:
            </Typography>
            <Grid container>
              <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
                <TextField
                  value={filters.name}
                  label="Nome"
                  variant="outlined"
                  size="small"
                  className={classes.textInput}
                  onChange={(e) => handleFilterChange("name", e.target.value)}
                />
              </Grid>
              <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
                <TextField
                  value={filters.number}
                  label="Número"
                  variant="outlined"
                  size="small"
                  className={classes.textInput}
                  onChange={(e) => handleFilterChange("number", e.target.value)}
                />
              </Grid>
              <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
                <TextField
                  value={filters.email}
                  label="Email"
                  variant="outlined"
                  size="small"
                  className={classes.textInput}
                  onChange={(e) => handleFilterChange("email", e.target.value)}
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
                  className={classes.textInput}
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
                          parameter={field?.name}
                          parameterName={field?.name}
                          options={sanitizeFieldsOptions(field.options)}
                          onChange={handleFieldsFilterChange}
                          selectedValues={filters.extraFields[field?.name]}
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
                          parameter={field?.name}
                          parameterName={field?.name}
                          options={sanitizeFieldsOptions(field.options)}
                          onChange={handleFieldsFilterChange}
                          selectedValues={filters.extraFields[field?.name]}
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
                          value={filters.extraFields[field?.name] || ""}
                          label={field?.name}
                          variant="outlined"
                          size="small"
                          className={classes.textInput}
                          onChange={(e) =>
                            handleFieldsFilterChange(
                              field?.name,
                              e.target.value
                            )
                          }
                        />
                      </Grid>
                    );
                  }
                  return null;
                })}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography className={classes.filtersTitle}>
              Filtros por ticket:
            </Typography>
            <Grid container>
              <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
                <TextField
                  value={filters.protocol}
                  label="Protocolo"
                  variant="outlined"
                  size="small"
                  className={classes.textInput}
                  onChange={(e) =>
                    handleFilterChange("protocol", e.target.value)
                  }
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
                  parameter="origin"
                  parameterName={"Origem do ticket"}
                  options={originOptions}
                  onChange={handleFilterChange}
                  selectedValues={filters["origin"]}
                  multiple={true}
                  width="100%"
                />
              </Grid>
              <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
                <SelectInputFilter
                  parameter="motive"
                  parameterName={"Motivo de finalização"}
                  options={motivesList}
                  onChange={handleFilterChange}
                  selectedValues={filters["motive"]}
                  multiple={true}
                  width="100%"
                />
              </Grid>
              <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
                <SelectInputFilter
                  parameter="user"
                  parameterName={"Atendente Responsável"}
                  options={usersList}
                  onChange={handleFilterChange}
                  selectedValues={filters["user"]}
                  multiple={true}
                  width="100%"
                />
              </Grid>
              <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
                <SelectInputFilter
                  parameter="queue"
                  parameterName={"Setor"}
                  options={queuesList}
                  onChange={handleFilterChange}
                  selectedValues={filters["queue"]}
                  multiple={true}
                  width="100%"
                />
              </Grid>
              <Grid item md={2} sm={4} xs={6} className={classes.gridItem}>
                <SelectInputFilter
                  parameter="status"
                  parameterName="Status"
                  options={statusOptions}
                  onChange={handleFilterChange}
                  selectedValues={filters["status"]}
                  multiple
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
                ?.filter((field) => field.context === "ticket")
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
          </Grid>
        </Grid>
      </div>
    </Box>
  );
};
