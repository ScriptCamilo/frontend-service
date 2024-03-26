import React from "react";

import { useStyles } from "./styles";

function QuickMentionSelect(params) {
  const { integrantsFiltered, handleClick } = params;
  const classes = useStyles();

  return (
    <ul className={classes.messageQuickAnswersWrapper}>
      {integrantsFiltered.map((value) => {
        return (
          <li
            key={value.number}
            onClick={() => handleClick(value.contact.number)}
          >
            {/*
              Acredito que possamos utilizar um botão aqui
              ao invés de um "anchor" sem href. Se a escolha do "anchor"
              foi o visual podemos modificar o botão com css ou utilizar o
              botão de texto do próprio Material-UI
            */}
            <span>
              {`${value.contact?.name} - ${value.contact.number}`}
            </span>
          </li>
        );
      })}
    </ul>
  )
}

export default QuickMentionSelect;
