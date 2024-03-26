import React, { useCallback, useEffect, useState } from "react";

import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableHead,
  Tooltip,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import {
  CheckCircle,
  DeleteOutline,
  ReplayOutlined,
  Restore,
  Facebook,
  Instagram,
  Edit,
  PhonelinkSetupOutlined,
  CropFreeOutlined,
} from "@material-ui/icons";
import { format, parseISO } from "date-fns";
import { toast } from "react-toastify";

import { FacebookLoginClient } from "@greatsumini/react-facebook-login";
import axios from "axios";
import ConfirmationModal from "../../components/ConfirmationModal";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MetaModal from "../../components/MetaModal";
import QrcodeModal from "../../components/QrcodeModal";
import ResendMessagesDropdown from "../../components/ResendMessagesDropdown";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";

import OficialWhatsAppModal from "../../components/OficialWhatsAppModal";
import TransferTicketWhatsapp from "../../components/TransferTicketWhatsapp";
import WhatsAppModal from "../../components/WhatsAppModal";
import { getAPPID, getVerifyToken } from "../../config";
import { useAuthContext } from "../../context/Auth/AuthContext";
import { useSettingsContext } from "../../context/SettingsContext";
import { useWhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ConnectionsInatives from "../../components/ConnectionsInatives/ConnectionsInatives";
import { StyledTableCell, StyledTableRow } from "../StyledTable";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customStyledTableCell: {
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

const Connections = () => {
  const classes = useStyles();
  const { user, track } = useAuthContext();
  const { getSettingValue } = useSettingsContext();

  const {
    whatsAppApis,
    loading,
    whatsApps,
    allMetas,
    getConnections,
    getConnectionsMeta,
  } = useWhatsAppsContext();
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [oficialWhatsappModalOpen, setOficialWhatsAppModalOpen] =
    useState(false);
  const [metaModalOpen, setMetaModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [selectedMeta, setSelectedMeta] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [transferWModal, setTransferWModal] = useState(false);
  const [isQrCode, setIsQrCode] = useState(true);

  const confirmationModalInitialState = {
    action: "",
    title: "",
    message: "",
    connectionId: "",
    open: false,
    isOficial: false,
    channel: "",
  };
  const [confirmModalInfo, setConfirmModalInfo] = useState(
    confirmationModalInitialState
  );

  const createPagesFB = async (data, userToken) => {
    try {
      const metaData = {
        name: data.name,
        pageId: data.id,
        pageToken: data.access_token,
        verifyToken: getVerifyToken(),
        userToken,
      };
      await api.post("/meta", metaData);
      toast.success("Facebook Page criado com sucesso");
    } catch (err) {
      console.error(err);
    }
  };

  const createPagesIG = async (data, userToken) => {
    try {
      const instaData = data["instagram_business_account"];
      const name = `${instaData["name"]} - IG`;
      const pageId = instaData["id"];
      const pageToken = data.access_token;
      const verifyToken = getVerifyToken();
      const metaData = {
        name,
        pageId,
        pageToken,
        verifyToken,
        userToken,
        faceId: data.id,
      };
      await api.post("/meta", metaData);
      toast.success("Instagram Page criado com sucesso");
    } catch (err) {
      console.error(err);
    }
  };


  const getPageDataFB = async (dataUser) => {
    try {
      const { accessToken, userID } = dataUser.authResponse;
      const { data } = await axios.get(
        `https://graph.facebook.com/${userID}/accounts`,
        {
          params: {
            access_token: accessToken,
          },
        }
      );
      for (const page of data.data) {
        await createPagesFB(page, accessToken);
      }
      getConnectionsMeta();
    } catch (err) {
      console.error(err);
    }
  };

  const getPageDataIG = async (dataUser) => {
    try {
      const { accessToken, userID } = dataUser.authResponse;
      const { data } = await axios.get(
        `https://graph.facebook.com/${userID}/accounts?fields=instagram_business_account{id,name},access_token`,
        {
          params: {
            access_token: accessToken,
          },
        }
      );
      for (const page of data.data) {
        if (page["instagram_business_account"]) {
          await createPagesIG(page, accessToken);
        }
      }
      getConnectionsMeta();
    } catch (err) {
      console.error(err);
    }
  };

  const loadFB = async () => {
    try {
      FacebookLoginClient.clear();
      await FacebookLoginClient.loadSdk("pt_BR");
      FacebookLoginClient.init({ appId: getAPPID(), version: "v15.0" });
    } catch (err) {
      console.error(err);
    }
  };

  const loginFB = () => {
    try {
      FacebookLoginClient.login(
        (data) => {
          getPageDataFB(data);
        },
        {
          scope:
            "email, pages_show_list, pages_messaging, pages_read_engagement, public_profile, pages_manage_metadata, business_management",
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const loginIG = () => {
    try {
      FacebookLoginClient.login(
        (data) => {
          getPageDataIG(data);
        },
        {
          scope:
            "public_profile, email, pages_show_list, pages_messaging, instagram_basic, instagram_manage_messages, pages_manage_metadata, instagram_manage_insights, business_management",
        }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const logOutFB = () => {
    FacebookLoginClient.logout(() => {
      console.log("logout completed!");
    });
  };

  useEffect(() => {
    getConnectionsMeta();
    getConnections();
    loadFB();
  }, []);

  const handleOpenWhatsAppModal = () => {
    setSelectedWhatsApp(null);
    setWhatsAppModalOpen(true);
  };

  const handleOpenOficialWhatsAppModal = () => {
    setSelectedWhatsApp(null);
    setOficialWhatsAppModalOpen(true);
  };

  const handleCloseWhatsAppModal = useCallback(() => {
    setWhatsAppModalOpen(false);
    setSelectedWhatsApp(null);
  }, [setSelectedWhatsApp, setWhatsAppModalOpen]);

  const handleCloseOficialWhatsAppModal = useCallback(() => {
    setOficialWhatsAppModalOpen(false);
    setSelectedWhatsApp(null);
  }, [setOficialWhatsAppModalOpen, setSelectedWhatsApp]);

  const handleCloseMetaModal = useCallback(() => {
    setMetaModalOpen(false);
    setSelectedMeta(null);
  }, [setSelectedMeta, setMetaModalOpen]);

  const handleOpenQrModal = (whatsApp, showQrCode = true) => {
    setSelectedWhatsApp(whatsApp);
    setIsQrCode(showQrCode);
    setQrModalOpen(true);
  };

  const handleCloseQrModal = useCallback(() => {
    setSelectedWhatsApp(null);
    setQrModalOpen(false);
  }, [setQrModalOpen, setSelectedWhatsApp]);

  const handleEditWhatsApp = (whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setWhatsAppModalOpen(true);
  };

  const handleEditWhatsappApi = (whatsAppApi) => {
    setSelectedWhatsApp(whatsAppApi);
    setOficialWhatsAppModalOpen(true);
  };

  const handleEditMeta = (meta) => {
    setSelectedMeta(meta);
    setMetaModalOpen(true);
  };

  const handleOpenConfirmationModal = ({
    action,
    connectionId,
    isOficial,
    channel,
  }) => {
    if (action === "disconnect") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.disconnectTitle"),
        message: i18n.t("connections.confirmationModal.disconnectMessage"),
        connectionId: connectionId,
        isOficial,
      });
    }

    if (action === "delete") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.deleteTitle"),
        message: i18n.t("connections.confirmationModal.deleteMessage"),
        connectionId: connectionId,
        channel,
      });
    }

    if (action === "restart") {
      setConfirmModalInfo({
        action: action,
        title: "Deseja reiniciar a conexão?",
        message:
          "Esta ação não poderá ser desfeita e a conexão será reiniciada",
        connectionId: connectionId,
      });
    }

    if (action === "reset") {
      setConfirmModalInfo({
        action: action,
        title: "Deseja resetar a conexão?",
        message: "Esta ação não poderá ser desfeita e a conexão será resetada",
        connectionId: connectionId,
      });
    }
    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === "disconnect") {
      try {
        confirmModalInfo.isOficial
          ? await api.delete(
              `/whatsapp-api/disconnect/${confirmModalInfo.connectionId}`
            )
          : await api.delete(
              `/whatsappsession/${confirmModalInfo.connectionId}`
            );
        getConnections();
      } catch (err) {
        toastError(err);
      }
    }

    if (confirmModalInfo.action === "delete") {
      try {
        await api.post(`/status/${confirmModalInfo.connectionId}`, {
          channel: confirmModalInfo.channel,
        });
        toast.success(i18n.t("connections.toasts.deleted"));
        getConnections();
        getConnectionsMeta();
      } catch (err) {
        toastError(err);
      }
    }

    if (confirmModalInfo.action === "restart") {
      try {
        await api.post(`/restartsession/${confirmModalInfo.connectionId}`);
        track("Connection Change", {
          Action: "Restart",
        });
        getConnections();
        toast.success("Conexão reiniciada com sucesso");
      } catch (err) {
        toastError(err);
      }
    }

    if (confirmModalInfo.action === "reset") {
      try {
        await api.post(`/resetsession/${confirmModalInfo.connectionId}`);
        track("Connection Change", {
          Action: "Reset",
        });
        toast.success("Conexão resetada com sucesso");
        getConnections();
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

  const handleConnect = async (whatsAppId) => {
    try {
      await api.post(`/whatsapp-api/connect/${whatsAppId}`);
      toast.success("Conectado com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  const renderActionButtons = (whatsApp) => {
    return (
      <>
        {(whatsApp.status === "qrcode" || (whatsApp.status === "DISCONNECTED" && !whatsApp.isOficial)) && (
          <>
            <Button
              size="medium"
              variant="contained"
              color="primary"
              onClick={() => handleOpenQrModal(whatsApp, true)}
              startIcon={<CropFreeOutlined />}
              style={{
                margin: 3,
              }}
            >
              QRCODE
            </Button>

            <Button
              size="medium"
              variant="contained"
              color="primary"
              onClick={() => handleOpenQrModal(whatsApp, false)}
              startIcon={<PhonelinkSetupOutlined />}
              style={{
                margin: 3,
              }}
            >
              CÓDIGO
            </Button>
          </>
        )}
        {whatsApp.status === "DISCONNECTED" && whatsApp.isOficial && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => {
              handleConnect(whatsApp.id);
            }}
          >
            CONECTAR
          </Button>
        )}
        {(whatsApp.status === "CONNECTED" ||
          whatsApp.status === "PAIRING" ||
          whatsApp.status === "TIMEOUT") && (
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => {
              handleOpenConfirmationModal({
                action: "disconnect",
                connectionId: whatsApp.id,
                isOficial: whatsApp.isOficial,
                channel: "whatsappApi",
              });
            }}
          >
            {i18n.t("connections.buttons.disconnect")}
          </Button>
        )}
        {whatsApp.status === "OPENING" && (
          <Button size="small" variant="outlined" disabled color="default">
            {i18n.t("connections.buttons.connecting")}
          </Button>
        )}
      </>
    );
  };

  return (
    <>
      <MainContainer>
        <TransferTicketWhatsapp
          open={transferWModal}
          onClose={async () => {
            setTransferWModal(!transferWModal);
          }}
          aria-labelledby="form-dialog-title"
        />
        <ConfirmationModal
          title={confirmModalInfo.title}
          open={confirmModalOpen}
          onClose={setConfirmModalOpen}
          onConfirm={handleSubmitConfirmationModal}
        >
          {confirmModalInfo.message}
        </ConfirmationModal>
        <QrcodeModal
          open={qrModalOpen}
          onClose={handleCloseQrModal}
          whatsAppId={
            !whatsAppModalOpen &&
            !oficialWhatsappModalOpen &&
            selectedWhatsApp?.id
          }
          isQrCode={isQrCode}
        />
        <WhatsAppModal
          open={whatsAppModalOpen}
          onClose={handleCloseWhatsAppModal}
          whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
        />
        <OficialWhatsAppModal
          open={oficialWhatsappModalOpen}
          onClose={handleCloseOficialWhatsAppModal}
          whatsAppId={selectedWhatsApp?.id}
        />
        <MetaModal
          open={metaModalOpen}
          onClose={handleCloseMetaModal}
          metaId={selectedMeta?.id}
          getConnectionsMeta={getConnectionsMeta}
        />
        <MainHeader>
          <Title>{i18n.t("connections.title")}</Title>
          <MainHeaderButtonsWrapper>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setTransferWModal(true)}
            >
              Transferir tickets
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenWhatsAppModal}
            >
              {i18n.t("connections.buttons.add")}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenOficialWhatsAppModal}
            >
              Adicionar Whatsapp API
            </Button>
            {getSettingValue("showIntegrationLogin") === "true" && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Facebook />}
                  onClick={() => loginFB()}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Instagram />}
                  onClick={() => loginIG()}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Facebook />}
                  onClick={() => logOutFB()}
                >
                  LogOut
                </Button>
              </>
            )}
          </MainHeaderButtonsWrapper>
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
              {loading ? (
                <TableRowSkeleton />
              ) : (
                <>
                  {whatsApps?.length > 0 &&
                    whatsApps
                      .filter((whats) => whats.status !== "INATIVE")
                      .map((whatsApp) => (
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
                            {renderActionButtons(whatsApp)}
                          </StyledTableCell>
                          <StyledTableCell
                            align="center"
                            className={classes.cellElelement}
                          >
                            {format(
                              parseISO(whatsApp.updatedAt),
                              "dd/MM/yy HH:mm"
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {whatsApp.isDefault && (
                              <div className={classes.customStyledTableCell}>
                                <CheckCircle style={{ color: green[500] }} />
                              </div>
                            )}
                          </StyledTableCell>
                          {user.name === "Administrador" ? (
                            <StyledTableCell align="center">
                              <ResendMessagesDropdown
                                whatsappId={whatsApp.id}
                              />
                            </StyledTableCell>
                          ) : (
                            <StyledTableCell align="center" />
                          )}
                          <StyledTableCell
                            align="center"
                            className={classes.cellElelement}
                          >
                            {user.profile === "admin" && (
                              <>
                                <Tooltip title="Editar Conexão">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditWhatsApp(whatsApp)}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Reiniciar Conexão">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      handleOpenConfirmationModal({
                                        action: "restart",
                                        connectionId: whatsApp.id,
                                      });
                                    }}
                                  >
                                    <ReplayOutlined />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Resetar Conexão">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      handleOpenConfirmationModal({
                                        action: "reset",
                                        connectionId: whatsApp.id,
                                      });
                                    }}
                                  >
                                    <Restore />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Deletar Conexão">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      handleOpenConfirmationModal({
                                        action: "delete",
                                        connectionId: whatsApp.id,
                                        channel: "whatsapp",
                                      });
                                    }}
                                  >
                                    <DeleteOutline />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                  {whatsAppApis?.length > 0 &&
                    whatsAppApis
                      .filter((whatsApi) => whatsApi.status !== "INATIVE")
                      .map((whatsApp) => (
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
                            {renderActionButtons(whatsApp)}
                          </StyledTableCell>
                          <StyledTableCell
                            align="center"
                            className={classes.cellElelement}
                          >
                            {format(
                              parseISO(whatsApp.updatedAt),
                              "dd/MM/yy HH:mm"
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {whatsApp.isDefault && (
                              <div className={classes.customStyledTableCell}>
                                <CheckCircle style={{ color: green[500] }} />
                              </div>
                            )}
                          </StyledTableCell>
                          {user.name === "Administrador" ? (
                            <StyledTableCell align="center">
                              <ResendMessagesDropdown
                                whatsappId={whatsApp.id}
                              />
                            </StyledTableCell>
                          ) : (
                            <StyledTableCell align="center" />
                          )}
                          <StyledTableCell
                            align="center"
                            className={classes.cellElelement}
                          >
                            {user.profile === "admin" && (
                              <>
                                <Tooltip title="Editar Conexão">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleEditWhatsappApi(whatsApp)
                                    }
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                  {allMetas?.length > 0 &&
                    allMetas
                      .filter((meta) => meta.status !== "INATIVE")
                      .map((meta) => (
                        <StyledTableRow key={meta.id}>
                          <StyledTableCell align="center">
                            {meta.id}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {meta.name}
                          </StyledTableCell>
                          {/* <StyledTableCell align="center">{renderStatusToolTips(meta)}</StyledTableCell> */}
                          <StyledTableCell align="center">
                            {meta.name.includes("IG")
                              ? "Página do Instagram"
                              : "Página do Facebook"}
                          </StyledTableCell>

                          <StyledTableCell align="center">
                            {/* session */}
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
                            {user.profile === "admin" && (
                              <>
                                <Tooltip title="Editar Página">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditMeta(meta)}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Deletar Página">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      handleOpenConfirmationModal({
                                        action: "delete",
                                        connectionId: meta.id,
                                        channel: meta.name.includes("- IG")
                                          ? "instagram"
                                          : "page",
                                      });
                                    }}
                                  >
                                    <DeleteOutline />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                </>
              )}
            </TableBody>
          </Table>
        </Paper>
      </MainContainer>
      {user.profile === "admin" && (
        <ConnectionsInatives
          connectionsWhats={whatsApps}
          connectionsMeta={allMetas}
          getConnections={getConnections}
          getConnectionsMeta={getConnectionsMeta}
        />
      )}
    </>
  );
};

export default Connections;
