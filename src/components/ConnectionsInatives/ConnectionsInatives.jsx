import React, { useState, useCallback, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { format, parseISO } from "date-fns";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Button,
  TableBody,
  IconButton,
  Table,
  TableHead,
  Paper,
  Tooltip,
} from "@material-ui/core";
import { ReplayOutlined } from "@material-ui/icons";

import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

import api from "../../services/api";
import ConfirmationModal from "../../components/ConfirmationModal";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { StyledTableCell, StyledTableRow } from "../../pages/StyledTable";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cellElelement: {
    whiteSpace: "nowrap",
  },
  tooltip: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    fontSize: theme.typography.pxToRem(14),
    border: "1px solid #dadde9",
    maxWidth: 450,
  },
  tooltipPopper: {
    textAlign: "center",
  },
  buttonProgress: {
    color: green[500],
  },
}));

const confirmationModalInitialState = {
  action: "",
  title: "",
  message: "",
  whatsAppId: "",
  open: false,
};

const ConnectionsInatives = ({
  connectionsWhats,
  connectionsMeta,
  getConnections,
  getConnectionsMeta,
}) => {
  const classes = useStyles();

  const [confirmModalInfo, setConfirmModalInfo] = useState(
    confirmationModalInitialState
  );
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const handleOpenConfirmationModal = ({ action, connectionId, channel }) => {
    setConfirmModalInfo({
      action,
      title: "Restaurar conexão",
      message: "Deseja restaurar a conexão?",
      connectionId,
      open: true,
      channel,
    });

    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === "restore") {
      try {
        await api.post(`/status/${confirmModalInfo.connectionId}`, {
          channel: confirmModalInfo.channel,
        });
        toast.success("Conexão restaurada com sucesso!");
        getConnections();
        getConnectionsMeta();
      } catch (err) {
        toastError(err);
      }
    }
    setConfirmModalInfo(confirmationModalInitialState);
  };

  const formatNumber = (number) => {
    if (!number) return "";
    if (number.length === 13) {
      return number.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})/, "+$1 ($2) $3-$4");
    }
    if (number.length === 12) {
      return number.replace(/^(\d{2})(\d{2})(\d{4})(\d{4})/, "+$1 ($2) $3-$4");
    }
    return number;
  };

  return (
    <>
      <ConfirmationModal
        title={confirmModalInfo.title}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={handleSubmitConfirmationModal}
      >
        {confirmModalInfo.message}
      </ConfirmationModal>
      <MainHeader>
        <Title>Conexões Inativas</Title>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center">ID</StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("connections.table.name")}
              </StyledTableCell>
              <StyledTableCell align="center">Número</StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("connections.table.session")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("connections.table.lastUpdate")}
              </StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("connections.table.default")}
              </StyledTableCell>
              <StyledTableCell align="center">Reenvios</StyledTableCell>
              <StyledTableCell align="center">
                {i18n.t("connections.table.actions")}
              </StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {connectionsWhats?.length > 0 &&
              connectionsWhats.map(
                (whatsApp) =>
                  whatsApp.status === "INATIVE" && (
                    <StyledTableRow key={whatsApp.id}>
                      <StyledTableCell align="center">
                        {whatsApp.id}
                      </StyledTableCell>
                      <StyledTableCell
                        align="center"
                        className={classes.cellElelement}
                      >
                        {whatsApp.name}
                      </StyledTableCell>
                      <StyledTableCell
                        align="center"
                        className={classes.cellElelement}
                      >
                        {formatNumber(whatsApp.number)}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          style={{ cursor: "not-allowed" }}
                        >
                          Inativa
                        </Button>
                      </StyledTableCell>
                      <StyledTableCell
                        align="center"
                        className={classes.cellElelement}
                      >
                        {format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {/* is default */}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {/* reenvios */}
                      </StyledTableCell>
                      <StyledTableCell
                        align="center"
                        className={classes.cellElelement}
                      >
                        <>
                          <Tooltip title="Restaurar Conexão">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                handleOpenConfirmationModal({
                                  action: "restore",
                                  connectionId: whatsApp.id,
                                  channel: "whatsapp",
                                });
                              }}
                            >
                              <ReplayOutlined />
                            </IconButton>
                          </Tooltip>
                        </>
                      </StyledTableCell>
                    </StyledTableRow>
                  )
              )}
            {connectionsMeta?.length > 0 &&
              connectionsMeta.map(
                (meta) =>
                  meta.status === "INATIVE" && (
                    <StyledTableRow key={meta.id}>
                      <StyledTableCell align="center">
                        {meta.id}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {meta.name}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {meta.name.includes("IG")
                          ? "Página do Instagram"
                          : "Página do Facebook"}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          color="secondary"
                          style={{ cursor: "not-allowed" }}
                        >
                          Inativa
                        </Button>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {format(parseISO(meta.updatedAt), "dd/MM/yy HH:mm")}
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        {/* is default */}
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        {/* reenvios */}
                      </StyledTableCell>

                      <StyledTableCell align="center">
                        <>
                          <Tooltip title="Restaurar Conexão">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                handleOpenConfirmationModal({
                                  action: "restore",
                                  connectionId: meta.id,
                                  channel: meta.name.includes("- IG")
                                    ? "instagram"
                                    : "page",
                                });
                              }}
                            >
                              <ReplayOutlined />
                            </IconButton>
                          </Tooltip>
                        </>
                      </StyledTableCell>
                    </StyledTableRow>
                  )
              )}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default ConnectionsInatives;
