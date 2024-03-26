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
  infosContainer: {
    fontSize: "0.9em",
    color: "#242424",
    backgroundColor: "#e6e6e6",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0px 0px 10px rgba(0,0,0,0.25)",
  },
  section: {
    marginBottom: "20px",
  },
  sectionTitle: {
    marginBottom: "10px",
    fontWeight: "bold",
  },
  info: {
    marginBottom: "5px",
  },
}));

const TicketInfos = ({ ticketInfos }) => {
  const classes = useStyles();

  return (
    <StyledTableRow>
      <StyledTableCell colSpan={12}>
        <div className={classes.infosContainer}>
          <div className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Informações do Ticket
            </Typography>

            <p className={classes.info}>
              <strong>Criado em:</strong>{" "}
              {new Date(ticketInfos?.createdAt)?.toLocaleDateString(
                "pt-BR",
                options
              )}
            </p>
            <p className={classes.info}>
              <strong>Atualizado em:</strong>{" "}
              {new Date(ticketInfos?.updatedAt)?.toLocaleDateString(
                "pt-BR",
                options
              )}
            </p>
            <p className={classes.info}>
              <strong>Número:</strong> {ticketInfos?.contact?.number}
            </p>
            {ticketInfos?.endTicket?.length > 0 && (
              <p className={classes.info}>
                <strong>Motivo de finalização:</strong>{" "}
                {`${ticketInfos?.endTicket[0]?.option} - ${ticketInfos?.endTicket[0]?.body}`}
              </p>
            )}
            <p className={classes.info}>
              <strong>Grupo:</strong> {ticketInfos?.isGroup ? "Sim" : "Não"}
            </p>
            <p className={classes.info}>
              <strong>Canal:</strong> {ticketInfos?.contact?.channel}
            </p>
            <p className={classes.info}>
              <strong>Conexão:</strong>{" "}
              {ticketInfos?.whatsapp?.name ||
                ticketInfos?.meta?.name ||
                ticketInfos?.whatsappApi?.name}
            </p>
          </div>

          <div className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Campos personalizados do contato
            </Typography>

            {ticketInfos?.contact?.extraInfo
              ?.filter((extraInfo) => extraInfo.ticketId === null)
              .map((info) => (
                <p className={classes.info} key={info.id}>
                  <strong>{info.name}:</strong> {info.option?.value}
                </p>
              ))}
          </div>

          <div className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Campos personalizados do Ticket
            </Typography>

            {ticketInfos?.contact?.extraInfo
              ?.filter((extraInfo) => extraInfo.ticketId === ticketInfos.id)
              .map((info) => (
                <p className={classes.info} key={info.id}>
                  <strong>{info.name}:</strong> {info.option?.value}
                </p>
              ))}
          </div>

          <div className={classes.section}>
            <Typography variant="h6" className={classes.sectionTitle}>
              Etiquetas
            </Typography>

            <p className={classes.info}>
              {ticketInfos?.contact?.tags?.map((tag) => tag.name).join(", ")}
            </p>
          </div>
        </div>
      </StyledTableCell>
    </StyledTableRow>
  );
};

export default TicketInfos;
