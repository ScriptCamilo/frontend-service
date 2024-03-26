import React, { useCallback, useEffect, useState } from "react";

import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import { toast } from "react-toastify";

import HistoryModal from "../../components/HistoryModal";
import { useAuthContext } from "../../context/Auth/AuthContext";
import { useSettingsContext } from "../../context/SettingsContext/index.jsx";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import { useStyles } from "./styles";
import { getSuperUserEmail } from "../../config.jsx";

const Settings = () => {
  const classes = useStyles();
  const { setRelatorio, user } = useAuthContext();
  const { updateSetting, getSettingValue } = useSettingsContext();

  const [historyModal, setHistoryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiToken, setApiToken] = useState("");
  const [loadingNewToken, setLoadingNewToken] = useState(false);
  const [tokenExpiryTime, setTokenExpiryTime] = useState(0);

  const isDeskRioAdmin = user.email.includes(getSuperUserEmail());

  const handleChangeSetting = async (e) => {
    e.preventDefault();
    const key = e.target?.name;
    const value = e.target.value;

    if (key === "endTicket") setRelatorio(value);

    updateSetting(key, value);
  };

  const handleCloseHistoryModal = () => {
    setHistoryModal(false);
  };

  const handleBackup = async () => {
    try {
      setLoading(true);
      await api.post("/backup");
      toast.success("Backup realizado com sucesso!");
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeToExpireToken = (token = "") => {
    const expUnix = JSON.parse(atob((apiToken || token).split(".")[1])).exp;
    const expMillis = expUnix * 1000;
    const expDate = new Date(expMillis);
    const currentDate = new Date();
    const timeDifference = expDate - currentDate;
    const daysRemaining = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    setTokenExpiryTime(daysRemaining);
    if (daysRemaining < 30) {
      toast.info("Por favor renove sua chave token", {
        autoClose: false,
      });
    }
  };

  const generateExternalApi = useCallback(async () => {
    setLoadingNewToken(true);
    try {
      const {
        data: { token },
      } = await api.get("/api/messages/generate-external-api-token");
      setApiToken(token);
      getTimeToExpireToken(token);
    } catch (err) {
      toastError(err);
    }
    setLoadingNewToken(false);
  }, []);

  const getExternalApi = useCallback(async () => {
    setLoadingNewToken(true);
    try {
      const {
        data: { token },
      } = await api.get("/api/messages/external-api-token");
      setApiToken(token);
      getTimeToExpireToken(token);
    } catch {
      setApiToken("");
    }
    setLoadingNewToken(false);
  }, []);

  useEffect(() => {
    getExternalApi();
  }, [getExternalApi]);

  return (
    <div className={classes.root}>
      {user.profile === "admin" ? (
        <Container className={classes.container} maxWidth="sm">
          <Typography variant="body2" gutterBottom>
            {i18n.t("settings.title")}
          </Typography>
          <Paper className={classes.paper}>
            <Typography variant="body1">Pesquisa de Satisfação</Typography>
            <Select
              margin="dense"
              variant="outlined"
              native
              id="showSearch-setting"
              name="showSearch"
              value={getSettingValue("showSearch") || ""}
              className={classes.settingOption}
              onChange={handleChangeSetting}
            >
              <option value="true">Ativado</option>
              <option value="false">Desativado</option>
            </Select>
          </Paper>
          {isDeskRioAdmin && (
            <Paper className={classes.paper}>
              <Typography variant="body1">Limite de Usuários</Typography>
              <TextField
                label="Usuários"
                type="number"
                id="usersLimit-setting"
                name="usersLimit"
                value={getSettingValue("usersLimit") || ""}
                onChange={handleChangeSetting}
                inputProps={{
                  min: 0,
                  max: 100,
                }}
                InputProps={{
                  inputProps: {
                    min: 0,
                    max: 100,
                  },
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Paper>
          )}
          {isDeskRioAdmin && (
            <Paper className={classes.paper}>
              <Typography variant="body1">Limite de Conexões</Typography>
              <TextField
                label="Conexões"
                type="number"
                id="connectionsLimit-setting"
                name="connectionsLimit"
                value={getSettingValue("connectionsLimit") || ""}
                onChange={handleChangeSetting}
                inputProps={{
                  min: 0,
                  max: 100,
                }}
                InputProps={{
                  inputProps: {
                    min: 0,
                    max: 100,
                  },
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Paper>
          )}
          {isDeskRioAdmin && (
            <Paper className={classes.paper}>
              <Typography variant="body1">
                Limite de Páginas de Facebook e Instagram
              </Typography>
              <TextField
                label="Páginas"
                type="number"
                id="pagesLimit-setting"
                name="pagesLimit"
                value={getSettingValue("pagesLimit") || ""}
                onChange={handleChangeSetting}
                inputProps={{
                  min: 0,
                  max: 100,
                }}
                InputProps={{
                  inputProps: {
                    min: 0,
                    max: 100,
                  },
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Paper>
          )}
          {isDeskRioAdmin && (
            <Paper className={classes.paper}>
              <Typography variant="body1">Facebook e Instagram</Typography>
              <Select
                margin="dense"
                variant="outlined"
                native
                id="showIntegrationLogin-setting"
                name="showIntegrationLogin"
                value={getSettingValue("showIntegrationLogin") || ""}
                className={classes.settingOption}
                onChange={handleChangeSetting}
              >
                <option value="true">Ativado</option>
                <option value="false">Desativado</option>
              </Select>
            </Paper>
          )}
          <Paper className={classes.paper}>
            <Typography variant="body1">
              ChatBot iniciar ao mencionar/reagir ao story
            </Typography>
            <Select
              margin="dense"
              variant="outlined"
              native
              id="instagramInitChatbot-setting"
              name="instagramInitChatbot"
              value={getSettingValue("instagramInitChatbot") || ""}
              className={classes.settingOption}
              onChange={handleChangeSetting}
            >
              <option value="true">Ativado</option>
              <option value="false">Desativado</option>
            </Select>
          </Paper>
          {isDeskRioAdmin && (
            <Paper className={classes.paper}>
              <Typography variant="body1">Disparador</Typography>
              <Select
                margin="dense"
                variant="outlined"
                native
                id="showDisparatorPage-setting"
                name="showDisparatorPage"
                value={getSettingValue("showDisparatorPage") || ""}
                className={classes.settingOption}
                onChange={handleChangeSetting}
              >
                <option value="true">Ativado</option>
                <option value="false">Desativado</option>
              </Select>
            </Paper>
          )}
          {getSettingValue("showDisparatorPage") === "true" && (
            <Paper className={classes.paper}>
              <Typography variant="body1">
                Módulo de disparo visível a nível de
              </Typography>
              <Select
                margin="dense"
                variant="outlined"
                native
                id="disparadorPermission-setting"
                name="disparadorPermission"
                value={getSettingValue("disparadorPermission")}
                className={classes.settingOption}
                onChange={handleChangeSetting}
              >
                <option value="user">Usuário</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrador</option>
              </Select>
            </Paper>
          )}
          {isDeskRioAdmin && (
            <Paper className={classes.paper}>
              <Typography variant="body1">Aplicativo mobile</Typography>
              <Select
                margin="dense"
                variant="outlined"
                native
                id="mobileApp-setting"
                name="mobileApp"
                value={getSettingValue("mobileApp") || ""}
                className={classes.settingOption}
                onChange={handleChangeSetting}
              >
                <option value="enabled">Ativado</option>
                <option value="disabled">Desativado</option>
              </Select>
            </Paper>
          )}
          {isDeskRioAdmin && (
            <Paper className={classes.paper}>
              <Typography variant="body1">Webhook</Typography>
              <Select
                margin="dense"
                variant="outlined"
                native
                id="showWebhookPage-setting"
                name="showWebhookPage"
                value={getSettingValue("showWebhookPage") || ""}
                className={classes.settingOption}
                onChange={handleChangeSetting}
              >
                <option value="true">Ativado</option>
                <option value="false">Desativado</option>
              </Select>
            </Paper>
          )}
          {isDeskRioAdmin && (
            <Paper className={classes.paper}>
              <Typography variant="body1">Agendamento de Mensagens</Typography>
              <Select
                margin="dense"
                variant="outlined"
                native
                id="showSchedulePage-setting"
                name="showSchedulePage"
                value={getSettingValue("showSchedulePage") || ""}
                className={classes.settingOption}
                onChange={handleChangeSetting}
              >
                <option value="true">Ativado</option>
                <option value="false">Desativado</option>
              </Select>
            </Paper>
          )}

          {isDeskRioAdmin && (
            <Paper className={classes.paper}>
              <Typography variant="body1">
                Ativar monitoramento Hotjar
              </Typography>
              <Select
                margin="dense"
                variant="outlined"
                native
                id="hotjar-setting"
                name="hotjar"
                value={getSettingValue("hotjar") || ""}
                className={classes.settingOption}
                onChange={handleChangeSetting}
              >
                <option value="enabled">Ativado</option>
                <option value="disabled">Desativado</option>
              </Select>
            </Paper>
          )}
          {isDeskRioAdmin && (
            <Paper className={classes.paper}>
              <Typography variant="body1">Ativar Log</Typography>
              <Select
                margin="dense"
                variant="outlined"
                native
                id="activeLog-setting"
                name="activeLog"
                value={getSettingValue("activeLog") || ""}
                className={classes.settingOption}
                onChange={handleChangeSetting}
              >
                <option value="true">Ativado</option>
                <option value="false">Desativado</option>
              </Select>
            </Paper>
          )}
          <Typography variant="body2" gutterBottom></Typography>
          <Tooltip title={i18n.t("settings.settings.timeCreateNewTicket.note")}>
            <Paper className={classes.paper} elevation={3}>
              <Typography variant="body1">
                Tempo para Virar um Novo Potencial
              </Typography>
              <Select
                margin="dense"
                variant="outlined"
                native
                id="timeCreateNewTicket-setting"
                name="timeCreateNewTicket"
                value={getSettingValue("timeCreateNewTicket") || ""}
                className={classes.settingOption}
                onChange={handleChangeSetting}
              >
                <option value="0">nunca</option>
                <option value="10">
                  {i18n.t("settings.settings.timeCreateNewTicket.options.10")}
                </option>
                <option value="30">
                  {i18n.t("settings.settings.timeCreateNewTicket.options.30")}
                </option>
                <option value="60">
                  {i18n.t("settings.settings.timeCreateNewTicket.options.60")}
                </option>
                <option value="300">
                  {i18n.t("settings.settings.timeCreateNewTicket.options.300")}
                </option>
                <option value="1800">
                  {i18n.t("settings.settings.timeCreateNewTicket.options.1800")}
                </option>
                <option value="3600">
                  {i18n.t("settings.settings.timeCreateNewTicket.options.3600")}
                </option>
                <option value="7200">
                  {i18n.t("settings.settings.timeCreateNewTicket.options.7200")}
                </option>
                <option value="21600">
                  {i18n.t(
                    "settings.settings.timeCreateNewTicket.options.21600"
                  )}
                </option>
                <option value="43200">
                  {i18n.t(
                    "settings.settings.timeCreateNewTicket.options.43200"
                  )}
                </option>
              </Select>
            </Paper>
          </Tooltip>
          <Paper className={classes.paper}>
            <Typography variant="body1">Página de Grupos</Typography>
            <Select
              margin="dense"
              variant="outlined"
              native
              id="showGroupsPage-setting"
              name="showGroupsPage"
              value={getSettingValue("showGroupsPage") || ""}
              className={classes.settingOption}
              onChange={handleChangeSetting}
            >
              <option value="true">Ativado</option>
              <option value="false">Desativado</option>
            </Select>
          </Paper>
          <Paper className={classes.paper}>
            <Typography variant="body1">Mensagens de Grupos</Typography>
            <Select
              margin="dense"
              variant="outlined"
              native
              id="CheckMsgIsGroup-setting"
              name="CheckMsgIsGroup"
              value={getSettingValue("CheckMsgIsGroup") || ""}
              className={classes.settingOption}
              onChange={handleChangeSetting}
            >
              <option value="disabled">Ativado</option>
              <option value="enabled">Desativado</option>
            </Select>
          </Paper>
          <Paper className={classes.paper}>
            <Typography variant="body1">Motivos de Finalização</Typography>

            <Select
              margin="dense"
              variant="outlined"
              native
              id="endTicket-setting"
              name="endTicket"
              value={getSettingValue("endTicket") || ""}
              className={classes.settingOption}
              onChange={handleChangeSetting}
            >
              <option value="enabled">Ativado</option>
              <option value="disabled">Desativado</option>
            </Select>
          </Paper>
          {/* <Paper className={classes.paper}>
                      <Typography variant="body1">
                          Puxar Histórico
                      </Typography>
                      <Button
                          margin="dense"
                          variant="outlined"
                          native
                          onClick={openHistoryModal}
                      >
                          Histórico
                      </Button>
                  </Paper> */}
          <HistoryModal
            modalOpen={historyModal}
            onClose={handleCloseHistoryModal}
          />

          <Paper className={classes.paper}>
            <Typography variant="body1">
              Habilitar pré visualização do ticket para
            </Typography>
            <Select
              margin="dense"
              variant="outlined"
              native
              id="ticketPreviewPermission-setting"
              name="ticketPreviewPermission"
              value={getSettingValue("ticketPreviewPermission")}
              className={classes.settingOption}
              onChange={handleChangeSetting}
            >
              <option value="user">Usuário</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrador</option>
            </Select>
          </Paper>
          <Paper className={classes.paper}>
            <Typography variant="body1">
              Modo de Histórico dos Tickets
            </Typography>

            <Select
              margin="dense"
              variant="outlined"
              native
              id="historic-setting"
              name="historicMessages"
              value={getSettingValue("historicMessages") || ""}
              className={classes.settingOption}
              onChange={handleChangeSetting}
            >
              <option value="global">Global</option>
              <option value="tickets">Tickets</option>
              <option value="whatsapp">Canal</option>
            </Select>
          </Paper>
          <Paper className={classes.paper}>
            <Typography variant="body1">
              Data e horário visual dos tickets por
            </Typography>
            <Select
              margin="dense"
              variant="outlined"
              native
              id="ticket-order-setting"
              name="ticketOrder"
              value={getSettingValue("ticketOrder") || ""}
              onChange={handleChangeSetting}
              className={classes.settingOption}
            >
              <option value="createdAt">Criação do ticket</option>
              <option value="lastMessageDate">Última mensagem</option>
            </Select>
          </Paper>
          <Paper className={classes.paper}>
            <Typography variant="body1">
              {i18n.t("settings.settings.call.name")}
            </Typography>
            <Select
              margin="dense"
              variant="outlined"
              native
              id="call-setting"
              name="call"
              value={getSettingValue("call") || ""}
              className={classes.settingOption}
              onChange={handleChangeSetting}
            >
              <option value="enabled">
                {i18n.t("settings.settings.call.options.enabled")}
              </option>
              <option value="disabled">
                {i18n.t("settings.settings.call.options.disabled")}
              </option>
            </Select>
          </Paper>
          {getSettingValue("call") === "enabled" && (
            <Paper className={classes.textArea}>
              <Typography variant="body1">
                Mensagem automática ao receber ligação:
              </Typography>
              <TextField
                margin="dense"
                variant="outlined"
                multiline
                id="phoneCallMessage-setting"
                name="phoneCallMessage"
                value={getSettingValue("phoneCallMessage") || ""}
                onChange={handleChangeSetting}
              />
            </Paper>
          )}
          <Paper className={classes.paper}>
            <Typography variant="body1">Permitir envio de áudio</Typography>
            <Select
              margin="dense"
              variant="outlined"
              id="allowAudio-setting"
              name="allowAudio"
              value={getSettingValue("allowAudio") || ""}
              className={classes.settingOption}
              onChange={handleChangeSetting}
            >
              <option value="enabled">Ativado</option>
              <option value="disabled">Desativado</option>
            </Select>
          </Paper>
          {getSettingValue("allowAudio") === "disabled" && (
            <Paper className={classes.textArea}>
              <Typography variant="body1">
                Texto a ser exibido quando receber uma mensagem de áudio:
              </Typography>
              <TextField
                id="audioMessage-setting"
                name="noAudioText"
                multiline
                margin="dense"
                variant="outlined"
                value={getSettingValue("noAudioText") || ""}
                onChange={handleChangeSetting}
              />
            </Paper>
          )}
          <Paper className={classes.paper}>
            <Typography variant="body1">
              Assinatura obrigatória para o perfil ATENDENTE
            </Typography>
            <Select
              margin="dense"
              variant="outlined"
              native
              id="signature-setting"
              name="forcedSignature"
              value={getSettingValue("forcedSignature") || ""}
              className={classes.settingOption}
              onChange={handleChangeSetting}
            >
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </Select>
          </Paper>

          <Paper className={classes.paper}>
            <Typography variant="body1">
              Contatos carteirizados visíveis ao perfil ATENDENTE
            </Typography>
            <Select
              margin="dense"
              variant="outlined"
              native
              id="signature-setting"
              name="showPocketContacts"
              value={getSettingValue("showPocketContacts") || ""}
              className={classes.settingOption}
              onChange={handleChangeSetting}
            >
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </Select>
          </Paper>

          <Typography variant="body2" gutterBottom></Typography>

          <Paper
            className={classes.paper}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <TextField
              id="api-token-setting"
              readOnly
              label="Token Api"
              margin="dense"
              variant="outlined"
              fullWidth
              value={apiToken}
            />
            {apiToken && (
              <Typography variant="body1">
                Tempo de expiração para o token: {tokenExpiryTime} dias
              </Typography>
            )}
            <Button
              onClick={() => generateExternalApi()}
              color="primary"
              variant="contained"
              disabled={loadingNewToken || tokenExpiryTime > 30}
            >
              Gerar novo token
            </Button>
          </Paper>

          <Typography variant="body2" gutterBottom></Typography>

          {isDeskRioAdmin && (
            <Button
              onClick={handleBackup}
              color="primary"
              variant="contained"
              disabled={loading}
            >
              {loading ? (
                <CircularProgress color="inherit" size={20} />
              ) : (
                "Backup Manual"
              )}
            </Button>
          )}
        </Container>
      ) : (
        <Container className={classes.container} maxWidth="sm">
          <Typography variant="body2" gutterBottom>
            <h1>
              Você não tem permissão para alterar as configurações. Contate um
              administrador.
            </h1>
          </Typography>
        </Container>
      )}
    </div>
  );
};

export default Settings;
