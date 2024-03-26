import React, { useState } from "react";
import { Pie, PieChart, Sector } from "recharts";

// const data = [
//   { name: "Group A", value: 400 },
//   { name: "Group B", value: 300 },
//   { name: "Group C", value: 300 },
//   { name: "Group D", value: 200 },
// ];

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text
        x={cx}
        y={260}
        dy={8}
        textAnchor="middle"
        fill={"#406f2b"}
        style={{ position: "absolute" }}
      >
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={"#4ba720"}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
        style={{ fontSize: "0.9em" }}
      >{`${value} tickets`}</text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={13}
        textAnchor={textAnchor}
        fill="rgba(75,167,32, 0.8)"
        style={{ fontSize: "0.8em" }}
      >
        {`${(percent * 100).toFixed(2)}%`}
      </text>
    </g>
  );
};

export const PieChartTest = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const emptyData = [{ name: "N/A", value: 1 }];

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <>
      {/* <ResponsiveContainer
        width="100%"
        height="100%"
        style={{ overflow: "visible", paddingBottom: "20px" }}
      > */}
      <PieChart
        width={450}
        height={270}
        style={{ overflow: "visible", marginTop: "-25px" }}
      >
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={data.length > 0 ? data : emptyData}
          cx="50%"
          cy="48%"
          innerRadius={60}
          outerRadius={80}
          fill="#406f2b"
          dataKey="value"
          onMouseEnter={onPieEnter}
          style={{ overflow: "visible" }}
        />
      </PieChart>
      {/* </ResponsiveContainer> */}
    </>
  );
};
