import React from "react";
import { Container, Paper } from "@material-ui/core";
import replaceSpecialChars from "../../helpers/replaceSpecialChars";
import { useStyles } from "./styles";

const defaultValues = ["protocolo", "atendente", "setor", "cliente"];

const DefaultWildCardsDisplay = ({ displayValues = defaultValues }) => {
  const { label, paperContainer, title, wildCardsContainer } = useStyles();

  return (
    <Paper className={paperContainer}>
      <p className={title}>
        Utilize variáveis e campos personalizados nas suas mensagens, veja
        exemplos:
      </p>
      <Container className={wildCardsContainer}>
        {displayValues.map((value) => {
          const capitalized = `${value[0].toUpperCase()}${value.slice(1)}`;
          return (
            <span key={value}>
              <strong className={label}>{capitalized}:</strong>
              {`{${replaceSpecialChars(value)}}`}
            </span>
          );
        })}
      </Container>
    </Paper>
  );
};

export default DefaultWildCardsDisplay;
