import React, { useState, useEffect } from "react";
import { useTheme } from "@material-ui/core/styles";
import {
  BarChart,
  AreaChart,
  Area,
  CartesianGrid,
  Bar,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import Title from "./Title";
import api from "../../services/api";
import { makeStyles, TextField, Typography } from "@material-ui/core";
import { CustomTooltip } from "./CustomTooltip";

const useStyles = makeStyles((theme) => ({
  dateField: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    gap: "1em",
  },
}));

const Chart = (props) => {
  const { item, title } = props;
  const theme = useTheme();
  const classes = useStyles();
  /* const [date, setDate] = useState('2022-08-22') */
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());
  const [day, setDay] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [chartData, setChartData] = useState([
    { time: "00:00", amount: 0 },
    { time: "01:00", amount: 0 },
    { time: "02:00", amount: 0 },
    { time: "03:00", amount: 0 },
    { time: "04:00", amount: 0 },
    { time: "05:00", amount: 0 },
    { time: "06:00", amount: 0 },
    { time: "07:00", amount: 0 },
    { time: "08:00", amount: 0 },
    { time: "09:00", amount: 0 },
    { time: "10:00", amount: 0 },
    { time: "11:00", amount: 0 },
    { time: "12:00", amount: 0 },
    { time: "13:00", amount: 0 },
    { time: "14:00", amount: 0 },
    { time: "15:00", amount: 0 },
    { time: "16:00", amount: 0 },
    { time: "17:00", amount: 0 },
    { time: "18:00", amount: 0 },
    { time: "19:00", amount: 0 },
    { time: "20:00", amount: 0 },
    { time: "21:00", amount: 0 },
    { time: "22:00", amount: 0 },
    { time: "23:00", amount: 0 },
  ]);

  useEffect(() => {
    const actualDate = new Date();
    const monthWithZero =
      `${actualDate.getMonth() + 1}`.length < 2
        ? `0${actualDate.getMonth() + 1}`
        : `${actualDate.getMonth() + 1}`;
    const dayWithZero =
      `${actualDate.getDate()}`.length < 2
        ? `0${actualDate.getDate()}`
        : `${actualDate.getDate()}`;
    const fullYear = `${actualDate.getFullYear()}`;

    /* setDate(`${fullYear}-${monthWithZero}-${dayWithZero}`) */
    setDay(dayWithZero);
    setMonth(monthWithZero);
    setYear(fullYear);

    const getMessagesByHour = async () => {
      if (year === 0 || month === 0 || day === 0) return;

      const { data } = await api.get(
        `/dashboard/messagesbyhour/${year}-${monthWithZero}-${dayWithZero}`
      );
      setChartData(data);

      let totalMsg = 0;
      data.forEach((time) => (totalMsg += time.amount));
      setTotalMessages(totalMsg);
    };

    const getTicketsByHour = async () => {
      if (year === 0 || month === 0 || day === 0) return;

      const { data } = await api.get(
        `/dashboard/ticketsbyhour/${year}-${monthWithZero}-${dayWithZero}`
      );
      setChartData(data);

      let totalMsg = 0;
      data.forEach((time) => (totalMsg += time.amount));
      setTotalMessages(totalMsg);
    };

    if (item === "Mensagens") {
      getMessagesByHour();
    } else if (item === "Tickets") {
      getTicketsByHour();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const monthWithZero = `${month}`.length < 2 ? `0${month}` : `${month}`;
    const dayWithZero = `${day}`.length < 2 ? `0${day}` : `${day}`;

    const getMessagesByHour = async () => {
      if (year === 0 || month === 0 || day === 0) return;

      const { data } = await api.get(
        `/dashboard/messagesbyhour/${year}-${monthWithZero}-${dayWithZero}`
      );
      setChartData(data);

      let totalMsg = 0;
      data.forEach((time) => (totalMsg += time.amount));
      setTotalMessages(totalMsg);
    };

    const getTicketsByHour = async () => {
      if (year === 0 || month === 0 || day === 0) return;

      const { data } = await api.get(
        `/dashboard/ticketsbyhour/${year}-${monthWithZero}-${dayWithZero}`
      );
      setChartData(data);

      let totalMsg = 0;
      data.forEach((time) => (totalMsg += time.amount));
      setTotalMessages(totalMsg);
    };

    if (item === "Mensagens") {
      getMessagesByHour();
    } else if (item === "Tickets") {
      getTicketsByHour();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, month, year]);

  return (
    <React.Fragment>
      <ResponsiveContainer
        // set overflow to visible
        style={{ overflow: "visible", zIndex: 10 }}
      >
        <AreaChart
          width={730}
          height={250}
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
          style={{
            // position: "absolute",
            zIndex: 10,
            marginTop: "-35px",
            paddingTop: "15px",
            height: "200px",
            // backgroundColor: theme.palette.primary.main,
            backgroundImage: "linear-gradient(5deg, #2b4b1d 0%, #42722c  70%)",
            borderRadius: "8px",
            boxShadow: "0px 5px 5px 0px rgba(0,0,0,0.35)",
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            // change transparent grid
            stroke={"rgba(255, 255, 255, 0.15)"}
          />
          <XAxis
            dataKey="time"
            stroke={"white"}
            style={{ fontSize: "0.7em" }}
          />
          <YAxis
            type="number"
            allowDecimals={false}
            stroke={"white"}
            style={{ fontSize: "0.7em" }}
          ></YAxis>
          <Tooltip
            content={<CustomTooltip />}
            contentStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              color: "white",
              border: "transparent",
              borderRadius: "8px",
            }}
            itemStyle={{ color: "white", border: "transparent" }}
            labelStyle={{ color: "white", border: "transparent" }}
            // change tooltiple title
            labelFormatter={(label) => {
              return `${label}h`;
            }}
            formatter={(value) => {
              return `${value} ${item}`;
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke={theme.palette.text.secondary}
            fill={"white"}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className={classes.dateField}>
        {/* <Title>{`Nº de ${item}: ${totalMessages}`}</Title> */}
        <Title>
          <Typography
            style={{ fontSize: "0.7em", fontWeight: "500" }}
          >{`${title}`}</Typography>
        </Title>
        <TextField
          id="date"
          type="date"
          size="small"
          InputProps={{
            style: { fontSize: "0.8em" },
          }}
          onChange={(e) => {
            setDay(e.target.value.split(" ")[2]);
            setMonth(e.target.value.split(" ")[1] + 1);
            setYear(e.target.value.split(" ")[0]);
          }}
          defaultValue={`${new Date().getFullYear()}-${String(
            new Date().getMonth() + 1
          ).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </div>
    </React.Fragment>
  );
};

export default Chart;
