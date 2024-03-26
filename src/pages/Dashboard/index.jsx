import React, { useContext, useEffect, useState } from "react";

import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import SwapVertIcon from "@material-ui/icons/SwapVert";
import AccessAlarmIcon from "@material-ui/icons/AccessAlarm";
import HelpIcon from "@material-ui/icons/Help";
import FolderSharedIcon from "@material-ui/icons/FolderShared";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import DateRangeIcon from "@material-ui/icons/DateRange";
import GroupIcon from "@material-ui/icons/Group";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";

import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { DateRangePicker } from "react-date-range";
import { pt } from "date-fns/locale";
import { defaultStaticRanges, defaultInputRanges } from "./DefaultRanges";

import Chart from "./Chart";
import api from "../../services/api";
import TicketsAndUsersTable from "./TicketsAndUsersTable";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Popover,
  Slider,
  Tooltip,
} from "@material-ui/core";
import { PieChartTest } from "./PieChartTest";
import toastError from "../../errors/toastError";
import { set } from "date-fns";
import { useStyles } from "./styles";

const requestsTimeInterval = 5000;
const requestsDaysInterval = 15;

const ticketsAndUsersHead = [
  {
    id: "name",
    numeric: false,
    disablePadding: true,
    align: "center",
    label: "Atendente",
  },
  {
    id: "openTickets",
    numeric: true,
    disablePadding: true,
    align: "center",
    label: "Abertos",
  },
  {
    id: "pendingTickets",
    numeric: true,
    disablePadding: true,
    align: "center",
    label: "Aguardando",
  },
  {
    id: "closedTickets",
    numeric: true,
    disablePadding: true,
    align: "center",
    label: "Fechados",
  },
  {
    id: "total",
    numeric: true,
    align: "center",
    disablePadding: false,
    label: "Total",
  },
];

const ticketsAndQeuesHead = [
  {
    id: "name",
    numeric: false,
    disablePadding: true,
    label: "Setor",
    align: "center",
  },
  {
    id: "openTickets",
    numeric: true,
    disablePadding: false,
    align: "center",
    label: "Abertos",
  },
  {
    id: "pendingTickets",
    numeric: true,
    disablePadding: false,
    align: "center",
    label: "Aguardando",
  },
  {
    id: "closedTickets",
    numeric: true,
    disablePadding: false,
    align: "center",
    label: "Fechados",
  },
  {
    id: "total",
    numeric: true,
    disablePadding: false,
    label: "Total",
    align: "center",
  },
];

// const closedMotivesHead = [
//   { id: "name", numeric: false, disablePadding: true, label: "Motivo" },
//   {
//     id: "closedTickets",
//     numeric: true,
//     disablePadding: false,
//     align: "center",
//     label: "Tickets finalizados",
//   },
// ];

const averagePendingCountHead = [
  {
    id: "name",
    numeric: false,
    disablePadding: true,
    label: "Atendente",
    align: "center",
  },
  {
    id: "average",
    numeric: false,
    disablePadding: true,
    align: "center",
    label: "TME",
  },
  {
    id: "attendanceTimeAverage",
    numeric: false,
    disablePadding: true,
    align: "center",
    label: "TMA",
  },
  {
    id: "avaliation",
    numeric: true,
    disablePadding: false,
    align: "center",
    label: "Avaliação",
  },
];

const averagePendingQueuesCountHead = [
  {
    id: "name",
    numeric: false,
    disablePadding: true,
    label: "Setor",
    align: "center",
  },
  {
    id: "average",
    numeric: false,
    disablePadding: true,
    align: "center",
    label: "TME",
  },
  {
    id: "attendanceTimeAverage",
    numeric: false,
    disablePadding: true,
    align: "center",
    label: "TMA",
  },
  {
    id: "avaliation",
    numeric: true,
    disablePadding: false,
    align: "center",
    label: "Avaliação",
  },
];

const Dashboard = () => {
  const classes = useStyles();
  const [month, setMonth] = useState(`${new Date().getMonth() + 1}`);
  const [year, setYear] = useState(new Date().getFullYear());

  const [monthContacts, setMonthContacts] = useState(0); // Scalar
  const [ticketsAndUsers, setTicketsAndUsers] = useState([]); // List
  const [ticketsAndQueues, setTicketsAndQueues] = useState([]); // List
  const [motivesCount, setMotivesCount] = useState([]); // List
  const [ticketsByQueue, setTicketsByQueue] = useState([]); // List
  const [averagePendingCount, setAveragePendingCount] = useState([]); // List
  const [averageQueuePendingCount, setAverageQueuePendingCount] = useState([]); // List
  const [allTickets, setAllTickets] = useState(); // Object
  const [avaliationsCount, setAvaliationsCount] = useState(); // Object
  const [averageAssistanceTime, setAverageAssistanceTime] = useState(0); // Scalar

  const { queues, track } = useContext(AuthContext);

  // const [closedMotives, setClosedMotives] = useState([]);
  // const [messagesCount, setMessagesCount] = useState([]);

  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(new Date().setHours(0, 0, 0, 0)),
    endDate: new Date(),
    key: "selection",
  });
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [marks, setMarks] = useState([]);
  const [sliderValue, setSliderValue] = useState(0);

  /* 	const [orphanTickets, setOrphanTickets] = useState() */

  const [loading, setLoading] = useState(true);

  const parseDateRange = (days) => {
    // split selectionRange in subranges width days variable

    const subRanges = [];
    let startDate = selectionRange.startDate;
    let endDate = selectionRange.endDate;
    let subRange = {};

    while (startDate < endDate) {
      subRange = {
        startDate,
        endDate:
          new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000) >
          selectionRange.endDate
            ? selectionRange.endDate
            : new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000),
      };
      subRanges.push(subRange);
      startDate = new Date(subRange.endDate.getTime() + 24 * 60 * 60 * 1000);
    }

    if (subRanges.length === 0) {
      subRanges.push({
        startDate: selectionRange.startDate,
        endDate: selectionRange.endDate,
      });
    }

    return subRanges;
  };

  const formatDatePickerMarks = (splitedRange) => {
    let marksStructure;

    if (splitedRange.length === 1) {
      const startDateFormated = `${splitedRange[0].startDate
        .getDate()
        .toString()
        .padStart(2, "0")}/${(splitedRange[0].startDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${splitedRange[0].startDate.getFullYear()}`;

      const endDateFormated = `${splitedRange[0].endDate
        .getDate()
        .toString()
        .padStart(2, "0")}/${(splitedRange[0].endDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${splitedRange[0].endDate.getFullYear()}`;

      marksStructure = [
        {
          value: 0,
          label: startDateFormated,
        },
        {
          value: 1,
          label: endDateFormated,
        },
      ];
    } else {
      marksStructure = splitedRange.map((date, index) => {
        if (index === splitedRange.length - 1) {
          const dateFormated = `${date.endDate
            .getDate()
            .toString()
            .padStart(2, "0")}/${(date.endDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${date.endDate.getFullYear()}`;

          return {
            value: index,
            label: dateFormated,
          };
        } else {
          const dateFormated = `${date.startDate
            .getDate()
            .toString()
            .padStart(2, "0")}/${(date.startDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${date.startDate.getFullYear()}`;

          return {
            value: index,
            label: dateFormated,
          };
        }
      });
    }

    setMarks(marksStructure);
  };

  const getTicketsAndUsers = async (monthWithZero, rangeSplited) => {
    const { data } = await api.get(
      `/dashboard/ticketsandusers/${year}-${monthWithZero}`,
      {
        params: {
          range: rangeSplited,
        },
      }
    );
    // setTicketsAndUsers(data);
    return data;
  };
  const getTicketsAndQueues = async (monthWithZero, rangeSplited) => {
    const { data } = await api.get(
      `/dashboard/ticketsandqueues/${year}-${monthWithZero}`,
      {
        params: {
          range: rangeSplited,
        },
      }
    );
    // setTicketsAndQueues(data);
    return data;
  };
  // const getClosedMotives = async (monthWithZero, rangeSplited) => {
  //   const { data } = await api.get(
  //     `/dashboard/closedmotives/${year}-${monthWithZero}`
  //   );
  //   setClosedMotives(data);
  // };
  const getMonthContacts = async (monthWithZero, rangeSplited) => {
    const { data } = await api.get(
      `/dashboard/monthcontacts/${year}-${monthWithZero}`,
      {
        params: {
          range: rangeSplited,
        },
      }
    );
    // setMonthContacts(data);
    return data;
  };
  // const getMessagesCount = async (monthWithZero, rangeSplited) => {
  //   const { data } = await api.get(
  //     `/dashboard/messagescount/${year}-${monthWithZero}`
  //   );
  //   setMessagesCount(data);
  // };
  const getAllTickets = async (monthWithZero, rangeSplited) => {
    const { data } = await api.get(
      `/dashboard/alltickets/${year}-${monthWithZero}`,
      {
        params: {
          range: rangeSplited,
        },
      }
    );

    setAllTickets((prevState) => {
      return {
        ticketsByStatus: data.ticketsByStatus,
        uniqueContactTickets:
          (prevState?.uniqueContactTickets || 0) + data?.uniqueContactTickets,
      };
    });

    return data;
  };

  const formatTmaTime = (value) => {
    const secondsTime = value;
    const days = Math.trunc(secondsTime / 3600 / 24);
    const hours = Math.trunc(secondsTime / 3600) - days * 24;
    const minutes = Math.trunc(secondsTime / 60) - hours * 60 - days * 24 * 60;
    return { days, hours, minutes };
  };

  const getAvaliations = async (monthWithZero, rangeSplited) => {
    const { data } = await api.get(
      `/dashboard/queue-avaliation/${year}-${monthWithZero}`,
      {
        params: {
          range: rangeSplited,
        },
      }
    );

    return data;
  };

  const getAveragePendingCount = async (monthWithZero, rangeSplited) => {
    const { data } = await api.get(
      `/dashboard/averagependingcount/${year}-${monthWithZero}-07-18`,
      {
        params: {
          range: rangeSplited,
        },
      }
    );

    // setUniqueContactTickets(data.uniqueContactTickets);

    let formatedUsersList = await data.usersPendingTimeList.map((user) => {
      const waitTime = user.average;
      const attendanceTime = user.attendanceTimeAverage;
      // const waitTimeFormated = formatDate(waitTime);
      // const attendanceTimeFormated = formatDate(attendanceTime);
      const waitTimeFormated = waitTime;
      const attendanceTimeFormated = attendanceTime;

      return {
        name: user.name,
        average: waitTimeFormated,
        attendanceTime: attendanceTimeFormated,
      };
    });
    // setAveragePendingCount(formatedUsersList);

    let formatedQueuesList = await data.queuesPendingTimeList.map((queue) => {
      const waitTime = queue.average;
      const attendanceTime = queue.attendanceTimeAverage;
      // const waitTimeFormated = formatDate(waitTime);
      // const attendanceTimeFormated = formatDate(attendanceTime);
      const waitTimeFormated = waitTime;
      const attendanceTimeFormated = attendanceTime;

      return {
        name: queue.name,
        average: waitTimeFormated,
        attendanceTime: attendanceTimeFormated,
      };
    });
    // setAverageQueuePendingCount(formatedQueuesList);

    const avaliations = await getAvaliations(monthWithZero, rangeSplited);

    formatedUsersList = formatedUsersList.map((user) => {
      const avaliation = avaliations.averageAvaliationsByUser[user.name];
      return {
        ...user,
        avaliation: avaliation ? avaliation : "N/A",
      };
    });

    formatedQueuesList = formatedQueuesList.map((queue) => {
      const avaliation = avaliations.averageAvaliationsByQueue[queue.name];
      return {
        ...queue,
        avaliation: avaliation ? avaliation : "N/A",
      };
    });

    return { formatedUsersList, formatedQueuesList };
  };

  const getAverageAssistanceTime = async (monthWithZero, rangeSplited) => {
    const { data } = await api.get(
      `/dashboard/averageassistancecount/${year}-${monthWithZero}-07-18`,
      {
        params: {
          range: rangeSplited,
        },
      }
    );

    // setAverageAssistanceTime(data);

    return data;
  };

  const getMotives = async (monthWithZero, rangeSplited) => {
    const { data } = await api.get(
      `/dashboard/motives/${year}-${monthWithZero}`,
      {
        params: {
          range: rangeSplited,
        },
      }
    );
    const motives = [];

    Object.keys(data).forEach((key) => {
      motives.push({ name: key, value: data[key] });
    });

    // setMotivesCount(motives);
    return motives;
  };

  const concatResults = (monthWithZero, splitedRanges) => {
    // create loading state depending on all requests

    try {
      splitedRanges.forEach((rangeSplited, index) => {
        setTimeout(async () => {
          const newMonthContacts = await getMonthContacts(
            monthWithZero,
            rangeSplited
          );
          setMonthContacts((prevState) => prevState + newMonthContacts);

          const newTicketsAndUsers = await getTicketsAndUsers(
            monthWithZero,
            rangeSplited
          );
          setTicketsAndUsers((prevState) =>
            newTicketsAndUsers.map((user) => {
              const prevUser = prevState.find(
                (prevUser) => prevUser.name === user.name
              );
              if (prevUser) {
                return {
                  ...user,
                  openTickets: user.openTickets + prevUser.openTickets,
                  pendingTickets: user.pendingTickets + prevUser.pendingTickets,
                  closedTickets: user.closedTickets + prevUser.closedTickets,
                  total: user.total + prevUser.total,
                };
              }
              return user;
            })
          );

          const newTicketsAndQueues = await getTicketsAndQueues(
            monthWithZero,
            rangeSplited
          );
          setTicketsAndQueues((prevState) =>
            newTicketsAndQueues.map((queue) => {
              const prevQueue = prevState.find(
                (prevQueue) => prevQueue.name === queue.name
              );

              if (prevQueue) {
                return {
                  ...queue,
                  openTickets: queue.openTickets + prevQueue.openTickets,
                  pendingTickets:
                    queue.pendingTickets + prevQueue.pendingTickets,
                  closedTickets: queue.closedTickets + prevQueue.closedTickets,
                  total: queue.total + prevQueue.total,
                };
              }
              return queue;
            })
          );

          const newMotives = await getMotives(monthWithZero, rangeSplited);
          setMotivesCount((prevState) => [
            ...prevState.map((motive) => {
              const newMotive = newMotives.find(
                (newMotive) => newMotive.name === motive.name
              );
              if (newMotive) {
                return {
                  ...motive,
                  value: motive.value + newMotive.value,
                };
              }
              return motive;
            }),
            ...newMotives.filter(
              (newMotive) =>
                !prevState.find((motive) => motive.name === newMotive.name)
            ),
          ]);

          const newAveragePendingCount = await getAveragePendingCount(
            monthWithZero,
            rangeSplited
          );

          const calculateAverageValues = (oldValue, newValue) => {
            // if newvalue is N/A or NaN, return old value
            if (isNaN(newValue) || newValue === "N/A") return oldValue;
            if (isNaN(oldValue) || oldValue === "N/A") return newValue;

            if (oldValue && newValue) {
              return (Number(oldValue) + Number(newValue)) / 2;
            } else if (oldValue && !newValue) {
              return oldValue;
            } else if (!oldValue && newValue) {
              return newValue;
            } else {
              return 0;
            }
          };

          // set state calculating average for "average", "attendanceTime" and "avaliation"
          setAveragePendingCount((prevState) => [
            ...prevState.map((user) => {
              const userData = newAveragePendingCount.formatedUsersList.find(
                (newUser) => newUser.name === user.name
              );

              if (userData) {
                return {
                  name: user.name,
                  average: calculateAverageValues(
                    Number(user.average),
                    Number(userData?.average)
                  ),
                  attendanceTime: calculateAverageValues(
                    Number(user.attendanceTime),
                    Number(userData?.attendanceTime)
                  ),
                  avaliation: calculateAverageValues(
                    user?.avaliation,
                    userData?.avaliation
                  ),
                };
              }

              return (
                user && {
                  name: user.name,
                  average: user.average,
                  attendanceTime: user.attendanceTime,
                  avaliation: user.avaliation,
                }
              );
            }),
            ...newAveragePendingCount.formatedUsersList.filter(
              (newUser) => !prevState.find((user) => user.name === newUser.name)
            ),
          ]);

          setAverageQueuePendingCount((prevState) => [
            ...prevState.map((queue) => {
              const queueData = newAveragePendingCount.formatedQueuesList.find(
                (newQueue) => newQueue.name === queue.name
              );

              if (queueData) {
                return {
                  name: queue.name,
                  average: calculateAverageValues(
                    Number(queue.average),
                    Number(queueData?.average)
                  ),
                  attendanceTime: calculateAverageValues(
                    Number(queue.attendanceTime),
                    Number(queueData?.attendanceTime)
                  ),
                  avaliation: calculateAverageValues(
                    queue?.avaliation,
                    queueData?.avaliation
                  ),
                };
              }

              return (
                queue && {
                  name: queue.name,
                  average: queue.average,
                  attendanceTime: queue.attendanceTime,
                  avaliation: queue.avaliation,
                }
              );
            }),
            ...newAveragePendingCount.formatedQueuesList.filter(
              (newQueue) =>
                !prevState.find((queue) => queue.name === newQueue.name)
            ),
          ]);

          // await getAvaliations(monthWithZero, rangeSplited);
          const newAverageAssistanceTime = await getAverageAssistanceTime(
            monthWithZero,
            rangeSplited
          );

          setAverageAssistanceTime((prevState) => {
            if (
              prevState &&
              prevState !== 0 &&
              newAverageAssistanceTime[0]?.AssistanceTime &&
              newAverageAssistanceTime[0]?.AssistanceTime !== 0
            ) {
              return (
                ((prevState || 0) +
                  (newAverageAssistanceTime[0]?.AssistanceTime || 0)) /
                2
              );
            } else if (
              (!prevState || prevState === 0) &&
              newAverageAssistanceTime[0]?.AssistanceTime &&
              newAverageAssistanceTime[0]?.AssistanceTime !== 0
            ) {
              return newAverageAssistanceTime[0]?.AssistanceTime;
            } else if (
              (!newAverageAssistanceTime[0]?.AssistanceTime ||
                newAverageAssistanceTime[0]?.AssistanceTime === 0) &&
              prevState &&
              prevState !== 0
            ) {
              return prevState;
            }
          });

          const newAllTickets = await getAllTickets(
            monthWithZero,
            rangeSplited
          );

          // set tickets by queue
          (async () => {
            try {
              const ticketsQueues = [];

              Object.keys(newAllTickets.ticketsByqueue).forEach((key) => {
                const queueName =
                  queues.find((queue) => queue.id === Number(key))?.name ||
                  "Sem setor";

                ticketsQueues.push({
                  name: queueName,
                  value: newAllTickets.ticketsByqueue[key],
                });
              });

              setTicketsByQueue((prevState) => [
                ...prevState.map((queue) => {
                  const queueData = ticketsQueues.find(
                    (newQueue) => newQueue.name === queue.name
                  );

                  if (queueData) {
                    return {
                      name: queue.name,
                      value: queue.value + queueData.value,
                    };
                  }

                  return queue;
                }),
                ...ticketsQueues.filter(
                  (newQueue) =>
                    !prevState.find((queue) => queue.name === newQueue.name)
                ),
              ]);
            } catch (err) {
              toastError(err);
            }
          })();

          if (splitedRanges.length === 1) {
            setSliderValue(index + 2);
          } else {
            setSliderValue(index + 1);
          }
        }, requestsTimeInterval * index);
      });

      setTimeout(() => {
        setLoading(false);
      }, requestsTimeInterval * (splitedRanges.length - 0.5));
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  const handleSubmitDateRange = () => {
    setMonthContacts(0); // Scalar
    setTicketsAndUsers([]); // List
    setTicketsAndQueues([]); // List
    setMotivesCount([]); // List
    setTicketsByQueue([]); // List
    setAveragePendingCount([]); // List
    setAverageQueuePendingCount([]); // List
    setAllTickets(); // Object
    setAvaliationsCount(); // Object
    setAverageAssistanceTime(0); // Scalar
    setSliderValue(0); // Scalar
    // clear all timeouts
    track("Date Change", {
      Action: "Selectd",
    });
    for (let i = 0; i < 99999; i++) window.clearInterval(i);

    const splitedRanges = parseDateRange(requestsDaysInterval);

    formatDatePickerMarks(splitedRanges);

    if (month && month !== "0" && month !== "00" && year && year !== 0) {
      setLoading(true);

      const monthWithZero = `${month}`.length < 2 ? `0${month}` : `${month}`;

      concatResults(monthWithZero, splitedRanges);
    }
  };

  useEffect(() => {
    setMonthContacts(0); // Scalar
    setTicketsAndUsers([]); // List
    setTicketsAndQueues([]); // List
    setMotivesCount([]); // List
    setTicketsByQueue([]); // List
    setAveragePendingCount([]); // List
    setAverageQueuePendingCount([]); // List
    setAllTickets(); // Object
    setAvaliationsCount(); // Object
    setAverageAssistanceTime(0); // Scalar
    setSliderValue(0); // Scalar
    // clear all timeouts
    track("Date Change", {
      Action: "Selectd",
    });
    for (let i = 0; i < 99999; i++) window.clearInterval(i);

    const splitedRanges = parseDateRange(requestsDaysInterval);

    formatDatePickerMarks(splitedRanges);

    if (month && month !== "0" && month !== "00" && year && year !== 0) {
      setLoading(true);

      const monthWithZero = `${month}`.length < 2 ? `0${month}` : `${month}`;

      concatResults(monthWithZero, splitedRanges);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressPercentage = (value) => {
    return `${((value * 100) / marks.length || 0).toFixed(2)}%`;
  };

  // const nextMonth = () => {
  //   setLoading(true);
  //   if (month < 12) {
  //     setMonth(Number(month) + 1);
  //   } else {
  //     setMonth(1);
  //     setYear(year + 1);
  //   }
  // };

  // const previousMonth = () => {
  //   setLoading(true);
  //   if (month > 1) {
  //     setMonth(Number(month) - 1);
  //   } else {
  //     setMonth(12);
  //     setYear(year - 1);
  //   }
  // };

  return (
    <div>
      <Container maxWidth="lg" className={classes.container}>
        {/* <Typography
          component="h1"
          variant="h6"
          color="primary"
          style={{ fontWeight: "900" }}
          gutterBottom
        >
          Total
        </Typography> */}

        <>
          <Box
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1em",
            }}
          >
            <Typography
              component="h1"
              variant="h6"
              color="primary"
              style={{ fontWeight: "900", whiteSpace: "nowrap" }}
              gutterBottom
            >
              Dados Totais
            </Typography>

            {/* <div className={classes.dateActions}>
              <Button
                onClick={previousMonth}
                size="small"
                color="primary"
                variant="outlined"
              >
                {"<"}
              </Button>
              {` ${months[month]} / ${year} `}
              <Button
                onClick={nextMonth}
                size="small"
                color="primary"
                variant="outlined"
              >
                {">"}
              </Button>
            </div> */}
          </Box>
          <Box className={classes.boxWithTotalData}>
            <Box className={classes.subBoxWithTotalData}>
              <Grid container style={{ display: "flex", gap: "1.5em" }}>
                <Paper
                  className={classes.customFixedHeightPaper}
                  style={{
                    width: "150px",
                    overflow: "visible",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <SwapVertIcon
                    style={{
                      backgroundImage:
                        "linear-gradient(5deg, #2b4b1d 0%, #42722c  70%)",
                      width: "50px",
                      height: "50px",
                      padding: "6px",
                      color: "#fff",
                      marginTop: "-30px",
                      marginBottom: "20px",
                      borderRadius: "10px",
                      boxShadow: "0px 3px 8px 0px rgba(0,0,0,0.55)",
                    }}
                  />
                  {loading ? (
                    <Box
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: "1em",
                      }}
                    >
                      <div className={classes.loading}>
                        <CircularProgress
                          size={30}
                          style={{
                            margin: -20,
                            padding: 0,
                            height: "30px",
                          }}
                        />
                      </div>
                    </Box>
                  ) : (
                    <Typography
                      component="h5"
                      variant="h5"
                      style={{ fontWeight: 900, color: "#406f2b" }}
                    >
                      {allTickets?.ticketsByStatus.open || 0}
                    </Typography>
                  )}
                  <Typography
                    component="h5"
                    variant="h6"
                    color="primary"
                    paragraph
                    style={{
                      fontSize: "1em",
                      fontWeight: "500",
                      marginTop: "5px",
                    }}
                  >
                    {i18n.t("dashboard.messages.inAttendance.title")}
                  </Typography>
                </Paper>

                <Paper
                  className={classes.customFixedHeightPaper}
                  style={{
                    width: "150px",
                    overflow: "visible",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <AccessAlarmIcon
                    style={{
                      backgroundImage:
                        "linear-gradient(5deg, #2b4b1d 0%, #42722c  70%)",
                      width: "50px",
                      height: "50px",
                      padding: "6px",
                      color: "#fff",
                      marginTop: "-30px",
                      marginBottom: "20px",
                      borderRadius: "10px",
                      boxShadow: "0px 3px 8px 0px rgba(0,0,0,0.55)",
                    }}
                  />
                  {loading ? (
                    <Box
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: "1em",
                      }}
                    >
                      <div className={classes.loading}>
                        <CircularProgress
                          size={30}
                          style={{
                            margin: -20,
                            padding: 0,
                            height: "30px",
                          }}
                        />
                      </div>
                    </Box>
                  ) : (
                    <Typography
                      component="h5"
                      variant="h5"
                      style={{ fontWeight: 900, color: "#406f2b" }}
                    >
                      {allTickets?.ticketsByStatus.pending || 0}
                    </Typography>
                  )}

                  <Typography
                    component="h5"
                    variant="h6"
                    color="primary"
                    paragraph
                    style={{
                      fontSize: "1em",
                      fontWeight: "500",
                      marginTop: "5px",
                    }}
                  >
                    {i18n.t("dashboard.messages.waiting.title")}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper
                  className={classes.customFixedHeightPaper}
                  style={{
                    marginTop: "10px",
                    width: "306px",
                    overflow: "visible",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: "15px",
                    // justifyContent: "space-between",
                  }}
                >
                  <FolderSharedIcon
                    style={{
                      backgroundImage:
                        "linear-gradient(5deg, #2b4b1d 0%, #42722c  70%)",
                      width: "50px",
                      height: "50px",
                      padding: "6px",
                      color: "#fff",
                      marginLeft: "-30px",
                      marginRight: "70px",
                      borderRadius: "10px",
                      boxShadow: "0px 3px 8px 0px rgba(0,0,0,0.55)",
                    }}
                  />
                  {loading ? (
                    <div className={classes.loading}>
                      <CircularProgress size={30} />
                    </div>
                  ) : (
                    <Typography
                      component="h5"
                      variant="h5"
                      style={{
                        fontWeight: 900,
                        color: "#406f2b",
                        display: "flex",
                        alignItems: "center",
                        marginRight: "20px",
                      }}
                    >
                      {allTickets?.ticketsByStatus.closed || 0}
                    </Typography>
                  )}

                  <Typography
                    component="h5"
                    variant="h6"
                    color="primary"
                    paragraph
                    style={{
                      margin: "0",
                      fontSize: "1em",
                      fontWeight: "500",
                    }}
                  >
                    {i18n.t("dashboard.messages.closed.title")}
                  </Typography>
                </Paper>
              </Grid>
            </Box>

            <Paper
              className={classes.fixedHeightPaper}
              style={{ overflow: "visible", width: "100%" }}
            >
              <Chart item="Tickets" title="Tickets por hora" />
            </Paper>

            {/* <PieChartTest />
          <PieChartTest /> */}
          </Box>
          <Divider style={{ margin: "2em" }} />
          <Box className={classes.boxWithCustomPeriod}>
            <Typography
              component="h1"
              variant="h6"
              color="primary"
              style={{ fontWeight: "900", whiteSpace: "nowrap" }}
              gutterBottom
            >
              Período personalizado
            </Typography>

            <Box
              display="flex"
              // set gap on mui Box component
              style={{
                gap: "1em",
              }}
            >
              <Slider
                className={classes.dateSlider}
                defaultValue={0}
                // getAriaValueText={valuetext}
                aria-labelledby="discrete-slider-always"
                value={sliderValue}
                disabled
                onChange={(e, value) => setSliderValue(value)}
                marks={
                  marks.length > 0
                    ? [
                        marks[0],
                        // marks[Math.floor((marks.length - 1) / 2)],
                        marks[marks.length - 1],
                      ]
                    : []
                }
                // valueLabelDisplay="on"
                step={1}
                min={0}
                max={marks.length}
              />
              <Typography>{progressPercentage(sliderValue)}</Typography>
              {sliderValue < marks.length && (
                <div className={classes.loading}>
                  <CircularProgress size={10} />
                </div>
              )}
            </Box>
            <Button
              id="date-picker"
              onClick={() => setDatePickerOpen(true)}
              variant="outlined"
              color="primary"
            >
              <Box className={classes.customDate}>
                Selecionar período
                <DateRangeIcon />
              </Box>
            </Button>

            <Popover
              open={datePickerOpen}
              onClose={() => setDatePickerOpen(false)}
              anchorEl={document.getElementById("date-picker")}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
            >
              <DateRangePicker
                ranges={[selectionRange]}
                onChange={(e) => setSelectionRange(e.selection)}
                locale={pt}
                staticRanges={defaultStaticRanges}
                rangeColors={["#4ba720", "#41702b"]}
                inputRanges={defaultInputRanges}
                className={classes.customDateRangePicker}
              />
              <Button
                onClick={handleSubmitDateRange}
                variant="contained"
                color="primary"
                className={classes.applyButton}
              >
                Aplicar
              </Button>
            </Popover>


            {/* <div className={classes.dateActions}>
              <Button
                onClick={previousMonth}
                size="small"
                color="primary"
                variant="outlined"
              >
                {"<"}
              </Button>
              {` ${months[month]} / ${year} `}
              <Button
                onClick={nextMonth}
                size="small"
                color="primary"
                variant="outlined"
              >
                {">"}
              </Button>
            </div> */}
          </Box>

          <Box display="flex" className={classes.boxWithCustomPeriodWithData}>
            <Box
              display="flex"
              justifyContent="space-between"
              flexWrap="wrap"
              className={classes.subBoxWithCustomPeriodWithData}
            >
              <Grid item xs={4}>
                <Paper
                  className={classes.customFixedHeightPaper}
                  style={{
                    marginTop: "10px",
                    width: "306px",
                    overflow: "visible",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: "15px",
                    // justifyContent: "space-between",
                  }}
                >
                  <PersonAddIcon
                    style={{
                      backgroundImage:
                        "linear-gradient(5deg, #2b4b1d 0%, #42722c  70%)",
                      width: "50px",
                      height: "50px",
                      padding: "6px",
                      color: "#fff",
                      marginLeft: "-30px",
                      marginRight: "70px",
                      borderRadius: "10px",
                      boxShadow: "0px 3px 8px 0px rgba(0,0,0,0.55)",
                    }}
                  />
                  {loading ? (
                    <div className={classes.loading}>
                      <CircularProgress size={30} />
                    </div>
                  ) : (
                    <Typography
                      component="h5"
                      variant="h5"
                      style={{
                        fontWeight: 900,
                        color: "#406f2b",
                        display: "flex",
                        alignItems: "center",
                        marginRight: "20px",
                      }}
                    >
                      {monthContacts}
                    </Typography>
                  )}

                  <Typography
                    component="h5"
                    variant="h6"
                    color="primary"
                    paragraph
                    style={{
                      margin: "0",
                      fontSize: "1em",
                      fontWeight: "500",
                    }}
                  >
                    Novos Contatos
                  </Typography>
                  <Tooltip
                    style={{
                      opacity: "0.5",
                      top: "0",
                      right: "0",
                      marginLeft: "auto",
                      padding: 0,
                      fontSize: "0.8em",
                    }}
                    title={
                      <div>
                        Novos Contatos: <br /> <br />
                        Total de contatos adicionados no mês.
                      </div>
                    }
                  >
                    <IconButton className={classes.help}>
                      <HelpIcon className={classes.help} />
                    </IconButton>
                  </Tooltip>
                </Paper>
                <Paper
                  className={classes.customFixedHeightPaper}
                  style={{
                    marginTop: "26px",
                    width: "306px",
                    overflow: "visible",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: "15px",
                    // justifyContent: "space-between",
                  }}
                >
                  <GroupIcon
                    style={{
                      backgroundImage:
                        "linear-gradient(5deg, #2b4b1d 0%, #42722c  70%)",
                      width: "50px",
                      height: "50px",
                      padding: "6px",
                      color: "#fff",
                      marginLeft: "-30px",
                      marginRight: "70px",
                      borderRadius: "10px",
                      boxShadow: "0px 3px 8px 0px rgba(0,0,0,0.55)",
                    }}
                  />
                  {loading ? (
                    <div className={classes.loading}>
                      <CircularProgress size={30} />
                    </div>
                  ) : (
                    <Typography
                      component="h5"
                      variant="h5"
                      style={{
                        fontWeight: 900,
                        color: "#406f2b",
                        display: "flex",
                        alignItems: "center",
                        marginRight: "20px",
                      }}
                    >
                      {allTickets?.uniqueContactTickets || 0}
                    </Typography>
                  )}

                  <Typography
                    component="h5"
                    variant="h6"
                    color="primary"
                    paragraph
                    style={{
                      margin: "0",
                      fontSize: "1em",
                      fontWeight: "500",
                    }}
                  >
                    Contactados
                  </Typography>
                  <Tooltip
                    style={{
                      opacity: "0.5",
                      top: "0",
                      right: "0",
                      marginLeft: "auto",
                      padding: 0,
                      fontSize: "0.8em",
                    }}
                    title={
                      <div>
                        Contactados: <br /> <br />
                        Total de contatos com tickets no mes.
                      </div>
                    }
                  >
                    <IconButton className={classes.help}>
                      <HelpIcon className={classes.help} />
                    </IconButton>
                  </Tooltip>
                </Paper>
                <Paper
                  className={classes.customFixedHeightPaper}
                  style={{
                    marginTop: "26px",
                    width: "306px",
                    overflow: "visible",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: "15px",
                    // justifyContent: "space-between",
                  }}
                >
                  {/* <FolderSharedIcon
                  style={{
                    backgroundImage:
                      "linear-gradient(5deg, #2b4b1d 0%, #42722c  70%)",
                    width: "50px",
                    height: "50px",
                    padding: "6px",
                    color: "#fff",
                    marginLeft: "-30px",
                    marginRight: "70px",
                    borderRadius: "10px",
                    boxShadow: "0px 3px 8px 0px rgba(0,0,0,0.55)",
                  }}
                /> */}
                  <Typography
                    style={{
                      backgroundImage:
                        "linear-gradient(5deg, #2b4b1d 0%, #42722c  70%)",
                      width: "50px",
                      height: "50px",
                      padding: "6px",
                      color: "#fff",
                      marginLeft: "-30px",
                      marginRight: "70px",
                      borderRadius: "10px",
                      boxShadow: "0px 3px 8px 0px rgba(0,0,0,0.55)",
                      textAlign: "center",
                      // vertical align
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                    }}
                  >
                    TMA
                  </Typography>
                  {/* <Typography
                  component="h5"
                  variant="h5"
                  style={{
                    fontWeight: 900,
                    color: "#406f2b",
                    display: "flex",
                    alignItems: "center",
                    marginRight: "20px",
                  }}
                >
                  {`
												${averageAssistanceTime.days} dia(s)
												${averageAssistanceTime.hours} hora(s)
												${averageAssistanceTime.minutes} minuto(s)
											`}
                </Typography> */}

                  {loading ? (
                    <div className={classes.loading}>
                      <CircularProgress size={30} />
                    </div>
                  ) : (
                    <Typography
                      component="h5"
                      variant="h6"
                      color="primary"
                      paragraph
                      style={{
                        fontWeight: 900,
                        color: "#406f2b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        verticalAlign: "middle",
                        marginBottom: "0px",
                      }}
                    >
                      {` 
                    ${
                      formatTmaTime(averageAssistanceTime).days > 0
                        ? `${formatTmaTime(averageAssistanceTime).days} D, `
                        : ``
                    } 
                    ${
                      formatTmaTime(averageAssistanceTime).hours > 0
                        ? `${formatTmaTime(averageAssistanceTime).hours} H, `
                        : ``
                    }
                    ${formatTmaTime(averageAssistanceTime).minutes || 0} M`}
                    </Typography>
                  )}

                  <Tooltip
                    style={{
                      opacity: "0.5",
                      top: "0",
                      right: "0",
                      marginLeft: "auto",
                      padding: 0,
                      fontSize: "0.8em",
                    }}
                    title={
                      <div>
                        Tempo Médio de Atendimento: <br /> <br />
                        Média geral do tempo de atendimento de cada ticket do
                        mês.
                        <br />
                        <br />D = Dias, H = Horas, M = Minutos
                      </div>
                    }
                  >
                    <IconButton className={classes.help}>
                      <HelpIcon className={classes.help} />
                    </IconButton>
                  </Tooltip>
                </Paper>
              </Grid>
            </Box>

            <Paper
              style={{
                marginTop: "10px",
                marginLeft: "10px",
                height: "300px",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                component="h5"
                variant="h6"
                color="primary"
                paragraph
                style={{
                  margin: "0",
                  fontSize: "1em",
                  fontWeight: "500",
                  marginTop: "10px",
                  marginBottom: "-30px",
                }}
              >
                Tickets por Setor
              </Typography>
              <Tooltip
                className={classes.tooltip}
                title={
                  <div>
                    Tickets por Setor: <br /> <br />
                    Distribuição dos tickets entre os setores.
                  </div>
                }
              >
                <IconButton className={classes.help}>
                  <HelpIcon className={classes.help} />
                </IconButton>
              </Tooltip>
              {loading ? (
                <div className={classes.loading}>
                  <CircularProgress size={240} />
                </div>
              ) : (
                <PieChartTest data={ticketsByQueue} />
              )}
            </Paper>
            <Paper
              style={{
                marginTop: "10px",
                marginLeft: "10px",
                height: "300px",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                component="h5"
                variant="h6"
                color="primary"
                paragraph
                style={{
                  margin: "0",
                  fontSize: "1em",
                  fontWeight: "500",
                  marginTop: "10px",
                  marginBottom: "-30px",
                }}
              >
                Motivos de Finalização
              </Typography>
              <Tooltip
                className={classes.tooltip}
                title={
                  <div>
                    Motivos de Finalização: <br /> <br />
                    Distribuição dos motivos de finalização entre os tickets.
                  </div>
                }
              >
                <IconButton className={classes.help}>
                  <HelpIcon className={classes.help} />
                </IconButton>
              </Tooltip>
              {loading ? (
                <div className={classes.loading}>
                  <CircularProgress size={240} />
                </div>
              ) : (
                <PieChartTest data={motivesCount} />
              )}
            </Paper>
          </Box>
          <Divider style={{ margin: "2em" }} />
          <Grid container spacing={3}>
            {/* <Grid item xs={4}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h5"  color="primary" paragraph>
                Novos contatos
              </Typography>
              <Grid item>
                <Typography component="h5" >
                  {monthContacts}
                </Typography>
              </Grid>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              className={classes.customFixedHeightPaper}
              style={{ overflow: "hidden" }}
            >
              <Typography component="h5"  color="primary" paragraph>
                Tempo médio de atendimento
              </Typography>
              <Grid item>
                <Typography component="h5" >
                  {`
												${averageAssistanceTime.days} dia(s)
												${averageAssistanceTime.hours} hora(s)
												${averageAssistanceTime.minutes} minuto(s)
											`}
                </Typography>
              </Grid>
            </Paper>
          </Grid> */}

            <Grid item xs={6}>
              <Paper
                className={classes.customFixedHeightPaper}
                style={{
                  overflow: "hidden",
                  // backgroundImage:
                  //   "linear-gradient(5deg, #2b4b1d 0%, #42722c  70%)",
                }}
              >
                <Typography
                  component="h5"
                  color="primary"
                  paragraph
                  className={classes.paperHeader}
                >
                  Tickets por Atendente
                  <Tooltip
                    style={{
                      opacity: "0.5",
                      fontSize: "0.9em",
                    }}
                    title={
                      <div>
                        Tickets por Atendente: <br /> <br />
                        Contagem de tickets Abertos, Aguardando, Fechados e
                        Total de cada usuário da plataforma.
                      </div>
                    }
                  >
                    <IconButton className={classes.help}>
                      <HelpIcon className={classes.help} />
                    </IconButton>
                  </Tooltip>
                </Typography>

                <Grid item>
                  {loading ? (
                    <div className={classes.loading}>
                      <CircularProgress
                        size={100}
                        style={{
                          margin: "66px 0px 66px 45%",
                        }}
                      />
                    </div>
                  ) : (
                    <TicketsAndUsersTable
                      rows={ticketsAndUsers}
                      headCells={ticketsAndUsersHead}
                    />
                  )}
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper
                className={classes.customFixedHeightPaper}
                style={{ overflow: "hidden" }}
              >
                <Typography
                  component="h5"
                  color="primary"
                  paragraph
                  className={classes.paperHeader}
                >
                  Tickets por Setor
                  <Tooltip
                    style={{
                      opacity: "0.5",
                      fontSize: "0.9em",
                    }}
                    title={
                      <div>
                        Tickets por Setor: <br /> <br />
                        Contagem de tickets Abertos, Aguardando, Fechados e
                        Total de cada setor da plataforma.
                      </div>
                    }
                  >
                    <IconButton className={classes.help}>
                      <HelpIcon className={classes.help} />
                    </IconButton>
                  </Tooltip>
                </Typography>

                <Grid item>
                  {loading ? (
                    <div className={classes.loading}>
                      <CircularProgress
                        size={100}
                        style={{
                          margin: "66px 0px 66px 45%",
                        }}
                      />
                    </div>
                  ) : (
                    <TicketsAndUsersTable
                      rows={ticketsAndQueues}
                      headCells={ticketsAndQeuesHead}
                    />
                  )}
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={6}>
              <Paper
                className={classes.customFixedHeightPaper}
                style={{ overflow: "hidden" }}
              >
                <Typography
                  component="h5"
                  color="primary"
                  paragraph
                  className={classes.paperHeader}
                >
                  Métricas dos Usuários
                  <Tooltip
                    style={{
                      opacity: "0.5",
                      fontSize: "0.9em",
                    }}
                    title={
                      <div>
                        Métricas dos Usuários: <br /> <br />
                        - Atendentes: Usuários da Plataforma <br />
                        - TME: Tempo Médio de Espera <br />
                        - TMA: Tempo Médio de Atendimento <br />- Avaliação:
                        Média de Avaliação dos Atendentes <br />
                        <br />D = Dias, H = Horas, M = Minutos
                      </div>
                    }
                  >
                    <IconButton className={classes.help}>
                      <HelpIcon className={classes.help} />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Grid item>
                  {loading ? (
                    <div className={classes.loading}>
                      <CircularProgress
                        size={100}
                        style={{
                          margin: "66px 0px 66px 45%",
                        }}
                      />
                    </div>
                  ) : (
                    <TicketsAndUsersTable
                      rows={averagePendingCount}
                      headCells={averagePendingCountHead}
                    />
                  )}
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={6}>
              <Paper
                className={classes.customFixedHeightPaper}
                style={{ overflow: "hidden" }}
              >
                <Typography
                  component="h5"
                  color="primary"
                  paragraph
                  className={classes.paperHeader}
                >
                  Métricas dos Setores
                  <Tooltip
                    style={{
                      opacity: "0.5",
                      fontSize: "0.9em",
                    }}
                    title={
                      <div>
                        Métricas dos Setores: <br /> <br />
                        - Setores: Setores da Plataforma <br />
                        - TME: Tempo Médio de Espera <br />
                        - TMA: Tempo Médio de Atendimento <br />- Avaliação:
                        Média de Avaliação dos Setores <br />
                        <br />D = Dias, H = Horas, M = Minutos
                      </div>
                    }
                  >
                    <IconButton className={classes.help}>
                      <HelpIcon className={classes.help} />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Grid item>
                  {loading ? (
                    <div className={classes.loading}>
                      <CircularProgress
                        size={100}
                        style={{
                          margin: "66px 0px 66px 45%",
                        }}
                      />
                    </div>
                  ) : (
                    <TicketsAndUsersTable
                      rows={averageQueuePendingCount}
                      headCells={averagePendingQueuesCountHead}
                    />
                  )}
                </Grid>
              </Paper>
            </Grid>

            {/* {relatorio === "enabled" && (
            <Grid item xs={6}>
              <Paper
                className={classes.customFixedHeightPaper}
                style={{ overflow: "hidden" }}
              >
                <Typography
                  component="h5"
                  
                  color="primary"
                  paragraph
                >
                  Motivos de atendimentos
                </Typography>
                <Grid item>
                  <TicketsAndUsersTable
                    rows={closedMotives}
                    headCells={closedMotivesHead}
                  />
                </Grid>
              </Paper>
            </Grid>
          )} */}
          </Grid>
        </>
      </Container>
    </div>
  );
};

export default Dashboard;
