import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import TicketsMainFilterSelect from "../TicketsMainFilterSelect";
import TicketsQueueSelect from "../TicketsQueueSelect";
import TicketsUserSelect from "../TicketsUserSelect";
import TicketsTagSelect from "../TicketsTagSelect";
import { Box, Divider, TextField } from "@material-ui/core";
import TicketsConnectionsSelect from "../TicketsConnectionsSelect";
import TicketsStatusFilterSelect from "../TicketsStatusFilterSelect";
import TicketsDateFilterSelect from "../TicketsDateFilterSelect";

const useStyles = makeStyles((theme) => ({
  filtersContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.3em",
    margin: 0,
    padding: "0 0 1em 0",
    width: "100%",
  },

  filtersTitle: {
    margin: "0 1em 0 1em",
    padding: 0,
  },

  filtersDrops: {
    width: "100%",
    margin: "0 1em 0 1em",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },

  filtersSubTab: {
    width: "100%",
    margin: "0 1em 0 1em",
    padding: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },

  dateField: {
    margin: "auto",
  },

  datesBox: {
    display: "flex",
    gap: "1em",
  },

  resize: {
    fontSize: "0.8em",
  },

  filtersToggle: {
    cursor: "pointer",
    marginLeft: "auto",
    marginRight: "1em",
  },
}));

const oneDay = 24 * 60 * 60 * 1000;

const TicketsFilters = ({
  selectedMains,
  setSelectedMains,
  selectedUsersIds,
  setSelectedUsersIds,
  selectedQueueIds,
  setSelectedQueueIds,
  selectedWhatsappsIds,
  setSelectedWhatsappsIds,
  selectedWhatsappApisIds,
  setSelectedWhatsappApisIds,
  selectedMetasIds,
  setSelectedMetasIds,
  selectedStatus,
  setSelectedStatus,
  tags,
  getTags,
  connections,
  connectionsApi,
  connectionsMeta,
  getConnections,
  selectedTagIds,
  setSelectedTagIds,
  users,
  user,
  selectedReference,
  setSelectedReference,
  dateInterval,
  setDateInterval,
  toggleFilters,
  isSubTab,
}) => {
  const classes = useStyles();

  useEffect(() => {
    getTags();
    getConnections();
  }, []);

  const handleEndDateOnLimite = (date) => {
    if (
      new Date(date).getTime() + oneDay >
      new Date(dateInterval.endDate).getTime()
    ) {
      setDateInterval({
        startDate: new Date(new Date(date).getTime() + oneDay),
        endDate: new Date(new Date(date).getTime() + oneDay),
      });
    } else if (
      new Date(date).getTime() + 30 * oneDay <
      new Date(dateInterval.endDate).getTime()
    ) {
      setDateInterval({
        startDate: new Date(new Date(date).getTime() + oneDay),
        endDate: new Date(new Date(date).getTime() + 30 * oneDay),
      });
    } else {
      setDateInterval({
        ...dateInterval,
        startDate: new Date(new Date(date).getTime() + oneDay),
      });
    }
  };

  const handleStartDateOnLimite = (date) => {
    if (
      new Date(date).getTime() + oneDay <
      new Date(dateInterval.startDate).getTime()
    ) {
      setDateInterval({
        startDate: new Date(new Date(date).getTime() + oneDay),
        endDate: new Date(new Date(date).getTime() + oneDay),
      });
    } else if (
      new Date(dateInterval.startDate).getTime() + 30 * oneDay <
      new Date(date).getTime()
    ) {
      setDateInterval({
        endDate: new Date(date),
        startDate: new Date(new Date(date).getTime() - 30 * oneDay),
      });
    } else {
      setDateInterval({
        ...dateInterval,
        endDate: new Date(new Date(date).getTime() + oneDay),
      });
    }
  };

  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  return (
    <div className={classes.filtersContainer}>
      {toggleFilters && (
        <>
          <div
            className={isSubTab ? classes.filtersSubTab : classes.filtersDrops}
          >
            <TicketsStatusFilterSelect
              style={{ marginLeft: 6 }}
              selectedStatus={selectedStatus}
              onChange={(values) => setSelectedStatus(values)}
              isSubTab={isSubTab}
            />
            <TicketsMainFilterSelect
              style={{ marginLeft: 6 }}
              selectedMains={selectedMains}
              isSubTab={isSubTab}
              onChange={(values) => setSelectedMains(values)}
            />
            <TicketsQueueSelect
              style={{ marginLeft: 6 }}
              selectedQueueIds={selectedQueueIds}
              isSubTab={isSubTab}
              userQueues={user?.queues}
              onChange={(values) => setSelectedQueueIds(values)}
            />
            <TicketsUserSelect
              style={{ marginLeft: 6 }}
              selectedUsersIds={selectedUsersIds}
              isSubTab={isSubTab}
              users={users?.users}
              user={user}
              onChange={(values) => setSelectedUsersIds(values)}
            />
            <TicketsConnectionsSelect
              style={{ marginLeft: 6 }}
              selectedConnectionsIds={selectedWhatsappsIds}
              isSubTab={isSubTab}
              connections={connections}
              onChange={(values) => setSelectedWhatsappsIds(values)}
              nameOfSelect="Whatsapps"
            />
            <TicketsConnectionsSelect
              style={{ marginLeft: 6 }}
              selectedConnectionsIds={selectedWhatsappApisIds}
              isSubTab={isSubTab}
              connections={connectionsApi}
              onChange={(values) => setSelectedWhatsappApisIds(values)}
              nameOfSelect="Whatsapp Apis"
            />
            <TicketsConnectionsSelect
              style={{ marginLeft: 6 }}
              selectedConnectionsIds={selectedMetasIds}
              isSubTab={isSubTab}
              connections={connectionsMeta}
              onChange={(values) => setSelectedMetasIds(values)}
              nameOfSelect="Conexões Metas"
            />

            <TicketsTagSelect
              style={{ marginLeft: 6 }}
              selectedTagIds={selectedTagIds}
              tags={tags}
              isSubTab={isSubTab}
              onChange={(values) => setSelectedTagIds(values)}
            />

            {isSubTab && (
              <>
                <Divider style={{ width: "50%", margin: "1em 0 1em -2em" }} />

                <TicketsDateFilterSelect
                  style={{ marginLeft: 6 }}
                  selectedReference={selectedReference}
                  onChange={(value) => setSelectedReference(value)}
                  isSubTab={isSubTab}
                />
              </>
            )}

            <Box className={classes.datesBox}>
              <div className={classes.dateField}>
                <TextField
                  InputProps={{
                    classes: {
                      input: classes.resize,
                    },
                  }}
                  label="Início"
                  id="start-date"
                  type="date"
                  onChange={(e) => handleEndDateOnLimite(e.target.value)}
                  defaultValue={formatDate(new Date())}
                  InputLabelProps={{ shrink: true }}
                  value={formatDate(new Date(dateInterval.startDate))}
                />
              </div>

              <div className={classes.dateField}>
                <TextField
                  InputProps={{
                    classes: {
                      input: classes.resize,
                    },
                  }}
                  label="Fim"
                  id="end-date"
                  type="date"
                  size="small"
                  onChange={(e) => handleStartDateOnLimite(e.target.value)}
                  defaultValue={formatDate(new Date())}
                  InputLabelProps={{ shrink: true }}
                  value={formatDate(new Date(dateInterval.endDate))}
                />
              </div>
            </Box>
          </div>
        </>
      )}
    </div>
  );
};

export default TicketsFilters;
