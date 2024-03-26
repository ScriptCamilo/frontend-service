import React, { useEffect, useState } from "react";

import { TextField } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";
import { Form, Formik } from "formik";
import { toast } from "react-toastify";

import { useWhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { useStyles } from './styles';

const EditBotModal = ({ bot, open, onClose, getChatBots }) => {
  const classes = useStyles();
  const {
    whatsApps,
    allMetas: metas,
    whatsAppApis,
  } = useWhatsAppsContext();

  const [loading, setLoading] = useState(false);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState(bot?.whatsappId);
  const [selectedWhatsappApi, setSelectedWhatsappApi] = useState(bot?.whatsappApiId);
  const [selectedMeta, setSelectedMeta] = useState(bot?.metaId);
  const [name, setName] = useState(bot?.name);
  const [welcomeMessage, setWelcomeMessage] = useState(bot?.welcomeMessage);
  const [endMessage, setEndMessage] = useState(bot?.endMessage);
  const [autoFinish, setAutoFinish] = useState(Boolean(bot.autoFinishSeconds));
  const [avaliationHeader, setAvaliationHeader] = useState();
  const [avaliationBody, setAvaliationBody] = useState();
  const [avaliationFooter, setAvaliationFooter] = useState();
  const [avaliationReply, setAvaliationReply] = useState();
  const [avaliationEnd, setAvaliationEnd] = useState();
  const [avaliationTime, setAvaliationTime] = useState(1);

  const handleAutoFinishSwitch = () => {
    setAutoFinish((prevState) => {
      return !prevState;
    });
  };

  const handleClose = () => {
    onClose();
  };

  const updateChatBot = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const formProps = Object.fromEntries(formData);
      const isSecondsValid = autoFinish && +formProps.autoFinishSeconds > 0;

      if (autoFinish && !isSecondsValid) {
        toast.error('O campo de segundos para a finalização automática é obrigatório');
        return;
      }

      if (isSecondsValid) {
        formProps.autoFinishSeconds = +formProps.autoFinishSeconds;
      } else {
        formProps.autoFinishSeconds = null;
        formProps.autoFinishMessage = undefined;
      }

      if (formProps.whatsappId === "") {
        formProps.whatsappId = null;
      }
      if (formProps.metaId === "") {
        formProps.metaId = null;
      }
      if (formProps.whatsappApiId === "") {
        formProps.whatsappApiId = null;
      }

      await api.put(`/chatbot/${bot.id}`, formProps);
      toast.info("Chatbot Atualizado");
    } catch {
      toast.error("Erro ao atualizar Bot");
    } finally {
      setLoading(false);
      getChatBots();
      handleClose();
    }
  };

  useEffect(() => {
    const getAvaliationBot = async () => {
      try {
        const { data } = await api.get(`avaliation-bot/${bot.id}`);
        setAvaliationHeader(data.headerMessage);
        setAvaliationBody(data.body);
        setAvaliationFooter(data.footerMessage);
        setAvaliationReply(data.replyMessage);
        setAvaliationEnd(data.endMessage);
        setAvaliationTime(data.botTime);
      } catch (e) {
        console.log(e);
      }
    };
    getAvaliationBot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);


  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" scroll="paper">
      <DialogTitle id="form-dialog-title">Editar ChatBot</DialogTitle>
      <Formik>
        <Form onSubmit={updateChatBot}>
          <DialogContent>
            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                labelId="input-name-label"
                id="name"
                name="name"
                value={name}
                label="Nome do Chatbot"
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                id="welcomeMessage"
                name="welcomeMessage"
                label="Mensagem de Boas-vindas"
                multiline
                minRows={3}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
              />
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                id="endMessage"
                name="endMessage"
                label="Mensagem de Finalização de Atendimento"
                multiline
                minRows={3}
                value={endMessage}
                onChange={(e) => setEndMessage(e.target.value)}
              />
            </FormControl>

            <h2>Pesquisa de Satisfação</h2>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                id="headerMessage"
                name="headerMessage"
                label="Cabeçalho"
                multiline
                minRows={2}
                value={avaliationHeader}
                onChange={(e) => setAvaliationHeader(e.target.value)}
              />
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                id="avaliationBody"
                name="avaliationBody"
                label="Escala de Avaliação"
                multiline
                minRows={3}
                value={avaliationBody}
                onChange={(e) => setAvaliationBody(e.target.value)}
              />
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                id="footerMessage"
                name="footerMessage"
                label="Rodapé"
                multiline
                minRows={2}
                value={avaliationFooter}
                onChange={(e) => setAvaliationFooter(e.target.value)}
              />
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                id="avaliationReply"
                name="avaliationReply"
                label="Mensagem de tentativa inválida de avaliação"
                value={avaliationReply}
                onChange={(e) => setAvaliationReply(e.target.value)}
                multiline
                minRows={2}
              />
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                id="avaliationEnd"
                name="avaliationEnd"
                label="Mensagem de despedida de avaliação"
                value={avaliationEnd}
                onChange={(e) => setAvaliationEnd(e.target.value)}
                multiline
                minRows={2}
              />
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <TextField
                type="number"
                id="avaliationTime"
                name="avaliationTime"
                label="Tempo de avaliação (Minutos)"
                variant="outlined"
                value={avaliationTime}
                onChange={(e) => setAvaliationTime(e.target.value)}
              />
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <InputLabel id="conexao-label">Conexão</InputLabel>
              <Select
                id="whatsappId"
                name="whatsappId"
                value={selectedWhatsapp}
                onChange={(e) => setSelectedWhatsapp(e.target.value)}
                labelId="conexao-label"
              >
                <MenuItem value={""}>Sem conexão</MenuItem>
                {whatsApps.map((whasapp) => (
                  <MenuItem key={whasapp.id} value={whasapp.id}>
                    {whasapp.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <InputLabel id="conexao-label">Conexão Apis</InputLabel>
              <Select
                id="whatsappApiId"
                name="whatsappApiId"
                value={selectedWhatsappApi}
                onChange={(e) => setSelectedWhatsappApi(e.target.value)}
                labelId="conexao-label"
              >
                <MenuItem value={""}>Sem conexão</MenuItem>
                {whatsAppApis.map((whasapp) => (
                  <MenuItem key={whasapp.id} value={whasapp.id}>
                    {whasapp.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="outlined" className={classes.maxWidth}>
              <InputLabel id="conexao-page">Página</InputLabel>
              <Select
                id="metaId"
                name="metaId"
                value={selectedMeta}
                onChange={(e) => setSelectedMeta(e.target.value)}
                labelId="conexao-page"
              >
                <MenuItem value={""}>Sem Página</MenuItem>
                {metas.map((meta) => (
                  <MenuItem key={meta.id} value={meta.id}>
                    {meta.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div className={classes.autoFinishWrapper}>
              <FormControlLabel
                label="Habilitar a finalização automática do ChatBot"
                control={
                  <Switch
                    checked={autoFinish}
                    onChange={handleAutoFinishSwitch}
                    color="primary"
                  />
                }
              />

              {autoFinish && (
                <>
                  <TextField
                    label="Segundos"
                    name="autoFinishSeconds"
                    margin="dense"
                    variant="outlined"
                    type="number"
                    defaultValue={bot.autoFinishSeconds || 1}
                    className={classes.textField}
                    data-disabled={!autoFinish}
                    disabled={!autoFinish}
                  />

                  <TextField
                    id="autoFinishMessage"
                    name="autoFinishMessage"
                    label="Mensagem de Finalização Automática"
                    defaultValue={bot?.autoFinishMessage}
                    multiline
                    className={classes.maxWidth}
                  />
                </>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleClose}
              color="secondary"
              disabled={loading}
              variant="outlined"
            >
              {i18n.t("transferTicketModal.buttons.cancel")}
            </Button>
            <ButtonWithSpinner
              variant="contained"
              type="submit"
              color="primary"
              loading={loading}
            >
              Atualizar
            </ButtonWithSpinner>
          </DialogActions>
        </Form>
      </Formik>
    </Dialog>
  );
};

export default EditBotModal;
