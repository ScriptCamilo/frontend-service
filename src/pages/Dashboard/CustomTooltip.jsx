import React from "react";

export const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.55)",
          color: "white",
          padding: "8px 20px",
          border: "transparent",
          borderRadius: "8px",
          fontSize: "0.85em",
        }}
      >
        <p
          className="label"
          style={{
            padding: 0,
            margin: 0,
          }}
        >{`Horário: ${label}h `}</p>
        <p
          className="intro"
          style={{
            padding: 0,
            margin: 0,
          }}
        >{`Tickets: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};
