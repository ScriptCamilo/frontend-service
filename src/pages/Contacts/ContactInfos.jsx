import { Typography, makeStyles } from "@material-ui/core";
import React from "react";
import { StyledTableCell, StyledTableRow } from "../StyledTable";

const options = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
};

const useStyles = makeStyles((theme) => ({
  tableRow: {
    width: "100%",
    overflow: "hidden",
    // inner shadow
  },

  tableCell: {
    padding: 0,
  },

  infosContainer: {
    fontSize: "0.9em",
    color: "#242424",
    backgroundColor: "#e6e6e6",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "10px 30px",
    boxShadow: "inset 0px 0px 10px 0px rgba(0,0,0,0.25)",
  },

  info: {
    minWidth: "200px",
    marginRight: "30px",
  },

  section: {
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  sectionTitle: {
    width: "100%",
  },
}));

const ContactInfos = ({ contactInfos }) => {
  const classes = useStyles();

  return (
    <>
      <StyledTableRow className={classes.tableRow}>
        <StyledTableCell className={classes.tableCell} colSpan={6}>
          <div className={classes.infosContainer}>
            <div className={classes.section}>
              <Typography variant="h6" className={classes.sectionTitle}>
                Informações do contato
              </Typography>

              <p className={classes.info}>
                <strong>Criado em:</strong>{" "}
                {new Date(contactInfos?.createdAt)?.toLocaleDateString(
                  "pt-BR",
                  options
                )}
              </p>
              <p className={classes.info}>
                <strong>Atualizado em:</strong>{" "}
                {new Date(contactInfos?.updatedAt)?.toLocaleDateString(
                  "pt-BR",
                  options
                )}
              </p>
            </div>

            <div className={classes.section}>
              <Typography variant="h6" className={classes.sectionTitle}>
                Campos personalizados
              </Typography>

              {contactInfos?.extraInfo?.length === 0 && (
                <p className={classes.info}>
                  <strong>Nenhum campo personalizado</strong>
                </p>
              )}

              {contactInfos?.extraInfo?.map((info) => (
                <p className={classes.info}>
                  <strong>{info.name}:</strong> {info.value}
                </p>
              ))}
            </div>

            <div className={classes.section}>
              <Typography variant="h6" className={classes.sectionTitle}>
                Etiquetas
              </Typography>

              {contactInfos?.tags?.length === 0 && (
                <p className={classes.info}>
                  <strong>Nenhuma etiqueta</strong>
                </p>
              )}

              <p className={classes.info}>
                {contactInfos?.tags?.map((tag) => tag.name).join(", ")}
              </p>
            </div>
          </div>
        </StyledTableCell>
      </StyledTableRow>
    </>
  );
};

export default ContactInfos;
